import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import rateLimit from '../../lib/rate-limit';
import { validateUrl, isValidDomain } from '../../lib/utils';

const prisma = new PrismaClient();

// Rate limiting - 10 requests per minute per IP
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Max 500 unique tokens per interval (IP addresses)
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Rate limiting
    await limiter.check(res, 10, req.ip || 'anonymous');

    const { originalUrl, customAlias, password, expiresAt, description } = req.body;

    // Validate required fields
    if (!originalUrl) {
      return res.status(400).json({ error: 'Original URL is required' });
    }

    // Validate URL format
    if (!validateUrl(originalUrl)) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Check for malicious URLs (basic check)
    const suspiciousPatterns = [
      /malware|virus|trojan|phishing|scam/i,
      /\.exe|\.bat|\.scr|\.vbs/i
    ];
    
    if (suspiciousPatterns.some(pattern => pattern.test(originalUrl))) {
      return res.status(400).json({ error: 'Suspicious URL detected' });
    }

    // Get user session
    const session = await getServerSession(req, res, authOptions);
    const userId = session?.user?.id || null;

    // Generate short code
    let shortCode;
    let attempts = 0;
    const maxAttempts = 5;

    do {
      shortCode = customAlias || nanoid(6);
      
      // Check if short code already exists
      const existing = await prisma.url.findFirst({
        where: {
          OR: [
            { shortCode: shortCode },
            { customAlias: shortCode }
          ]
        }
      });

      if (!existing) break;
      
      if (customAlias) {
        return res.status(400).json({ error: 'Custom alias already exists' });
      }

      attempts++;
      if (attempts >= maxAttempts) {
        return res.status(500).json({ error: 'Failed to generate unique short code' });
      }
    } while (true);

    // Parse expiration date
    let parsedExpiresAt = null;
    if (expiresAt) {
      parsedExpiresAt = new Date(expiresAt);
      if (parsedExpiresAt <= new Date()) {
        return res.status(400).json({ error: 'Expiration date must be in the future' });
      }
    }

    // Create URL record
    const urlData = {
      originalUrl,
      shortCode,
      customAlias: customAlias || null,
      password: password || null,
      expiresAt: parsedExpiresAt,
      description: description || null,
      userId: userId,
      domain: process.env.NEXT_PUBLIC_SITE_URL?.replace('https://', '') || 'linkpay.com'
    };

    // Get user's plan for earnings calculation
    let user = null;
    if (userId) {
      user = await prisma.user.findUnique({
        where: { id: userId },
        include: { plan: true }
      });
    }

    const createdUrl = await prisma.url.create({
      data: urlData
    });

    // Generate short URL
    const shortUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://linkpay.com'}/${shortCode}`;

    // Response data
    const responseData = {
      id: createdUrl.id,
      originalUrl: createdUrl.originalUrl,
      shortUrl,
      shortCode: createdUrl.shortCode,
      customAlias: createdUrl.customAlias,
      qrCode: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://linkpay.com'}/api/qr/${shortCode}`,
      createdAt: createdUrl.createdAt,
      expiresAt: createdUrl.expiresAt,
      hasPassword: !!createdUrl.password,
      expectedEarnings: user?.plan ? {
        perClick: user.plan.cpmRate / 1000,
        currency: 'USD'
      } : null
    };

    // Log the creation event
    console.log(`URL shortened: ${originalUrl} -> ${shortUrl} (User: ${userId || 'Anonymous'})`);

    return res.status(201).json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Error shortening URL:', error);
    
    // Handle specific errors
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Short code already exists' });
    }

    if (error.message.includes('Rate limit exceeded')) {
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }

    return res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    await prisma.$disconnect();
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}