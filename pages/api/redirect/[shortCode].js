import { PrismaClient } from '@prisma/client';
import { getClientIP, getCountryFromIP, getUserAgent, getDevice } from '../../../lib/geo-utils';
import { EarningsOptimizer } from '../../../lib/earnings-optimizer';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

// Use edge runtime for better performance
export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const { searchParams, pathname } = new URL(req.url);
  const shortCode = pathname.split('/').pop();

  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Get client information
    const clientIP = getClientIP(req);
    const userAgent = req.headers.get('user-agent') || '';
    const referrer = req.headers.get('referer') || '';
    const acceptLanguage = req.headers.get('accept-language') || '';

    // Check if IP is blacklisted
    const blacklistedIP = await prisma.blacklistedIp.findUnique({
      where: { ipAddress: clientIP }
    });

    if (blacklistedIP) {
      return new Response('Access denied', { status: 403 });
    }

    // Find URL by short code or custom alias
    const url = await prisma.url.findFirst({
      where: {
        OR: [
          { shortCode: shortCode },
          { customAlias: shortCode }
        ],
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      include: {
        user: {
          include: { plan: true }
        }
      }
    });

    if (!url) {
      return new Response(generateErrorPage('Link not found', 'The requested link does not exist or has expired.'), {
        status: 404,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // Check click limit
    if (url.clickLimit && url.totalClicks >= url.clickLimit) {
      return new Response(generateErrorPage('Link limit reached', 'This link has reached its maximum number of clicks.'), {
        status: 410,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // Handle password protection
    const password = searchParams.get('password');
    if (url.password && password !== url.password) {
      return new Response(generatePasswordPage(shortCode), {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // Get geographic data
    const geoData = await getCountryFromIP(clientIP);
    const deviceInfo = getUserAgent(userAgent);

    // Check for unique click
    const recentClick = await prisma.click.findFirst({
      where: {
        urlId: url.id,
        ipAddress: clientIP,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    });

    const isUnique = !recentClick;

    // Calculate earnings
    let earnings = 0;
    let selectedAdNetwork = null;

    if (url.user && url.user.plan) {
      const optimizer = new EarningsOptimizer();
      const earningsData = await optimizer.calculateEarnings({
        country: geoData.country,
        device: deviceInfo.device,
        timeOfDay: new Date().getHours(),
        userPlan: url.user.plan.name,
        isUnique,
        userId: url.user.id,
        ipAddress: clientIP
      });

      earnings = earningsData.amount;
      selectedAdNetwork = earningsData.adNetwork;
    }

    // Record the click
    await prisma.click.create({
      data: {
        urlId: url.id,
        userId: url.userId,
        ipAddress: clientIP,
        userAgent: userAgent,
        country: geoData.country,
        region: geoData.region,
        city: geoData.city,
        device: deviceInfo.device,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        referrer: referrer,
        language: acceptLanguage.split(',')[0],
        isUnique,
        earnings,
        adNetwork: selectedAdNetwork
      }
    });

    // Update URL statistics
    await prisma.url.update({
      where: { id: url.id },
      data: {
        totalClicks: { increment: 1 },
        uniqueClicks: isUnique ? { increment: 1 } : undefined,
        totalEarnings: { increment: earnings },
        lastClickedAt: new Date()
      }
    });

    // Update user earnings if applicable
    if (url.user && earnings > 0) {
      await prisma.user.update({
        where: { id: url.user.id },
        data: {
          totalEarnings: { increment: earnings },
          availableBalance: { increment: earnings }
        }
      });

      // Record earning
      await prisma.earning.create({
        data: {
          userId: url.user.id,
          urlId: url.id,
          amount: earnings,
          type: 'CLICK',
          source: selectedAdNetwork,
          country: geoData.country,
          description: `Click earnings from ${shortCode}`
        }
      });

      // Handle referral bonus
      if (url.user.referredBy) {
        const referralBonus = earnings * 0.1; // 10% referral bonus
        await prisma.user.update({
          where: { id: url.user.referredBy },
          data: {
            totalEarnings: { increment: referralBonus },
            availableBalance: { increment: referralBonus }
          }
        });

        await prisma.earning.create({
          data: {
            userId: url.user.referredBy,
            amount: referralBonus,
            type: 'REFERRAL',
            source: 'referral_system',
            description: `Referral bonus from ${url.user.email || 'user'} click`
          }
        });
      }
    }

    // Update analytics
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.analytics.upsert({
      where: {
        urlId_date_country_device_browser: {
          urlId: url.id,
          date: today,
          country: geoData.country || 'Unknown',
          device: deviceInfo.device || 'Unknown',
          browser: deviceInfo.browser || 'Unknown'
        }
      },
      update: {
        clicks: { increment: 1 },
        earnings: { increment: earnings }
      },
      create: {
        urlId: url.id,
        date: today,
        clicks: 1,
        earnings,
        country: geoData.country || 'Unknown',
        device: deviceInfo.device || 'Unknown',
        browser: deviceInfo.browser || 'Unknown'
      }
    });

    // Check if we should show ads
    const showAd = earnings > 0 && selectedAdNetwork && !searchParams.get('skip_ads');

    if (showAd) {
      // Return interstitial page with ads
      return new Response(generateInterstitialPage({
        originalUrl: url.originalUrl,
        shortCode,
        adNetwork: selectedAdNetwork,
        country: geoData.country,
        device: deviceInfo.device,
        earnings: earnings.toFixed(4)
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'text/html',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
      });
    } else {
      // Direct redirect
      return Response.redirect(url.originalUrl, 302);
    }

  } catch (error) {
    console.error('Error in redirect handler:', error);
    return new Response(generateErrorPage('Server Error', 'An unexpected error occurred. Please try again later.'), {
      status: 500,
      headers: { 'Content-Type': 'text/html' },
    });
  } finally {
    await prisma.$disconnect();
  }
}

function generateInterstitialPage({ originalUrl, shortCode, adNetwork, country, device, earnings }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LinkVault - Redirecting...</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        .countdown { font-size: 2rem; font-weight: bold; color: #3B82F6; }
        .ad-container { min-height: 250px; background: #f8f9fa; border: 1px dashed #dee2e6; }
        .loader { border: 4px solid #f3f4f6; border-top: 4px solid #3B82F6; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .fade-in { animation: fadeIn 0.5s ease-in; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    </style>
</head>
<body class="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen flex items-center justify-center">
    <div class="max-w-2xl mx-auto p-6 fade-in">
        <div class="bg-white rounded-xl shadow-2xl p-8">
            <!-- Header -->
            <div class="text-center mb-6">
                <div class="flex justify-center mb-4">
                    <div class="bg-blue-100 p-3 rounded-full">
                        <i class="fas fa-link text-blue-600 text-2xl"></i>
                    </div>
                </div>
                <h1 class="text-2xl font-bold text-gray-800 mb-2">LinkVault</h1>
                <p class="text-gray-600">Preparing your link...</p>
            </div>

            <!-- Countdown -->
            <div class="text-center mb-6">
                <div class="countdown mb-2" id="countdown">5</div>
                <p class="text-sm text-gray-500">You will be redirected automatically</p>
                <div class="w-full bg-gray-200 rounded-full h-2 mt-3">
                    <div class="bg-blue-600 h-2 rounded-full transition-all duration-1000" id="progress" style="width: 0%"></div>
                </div>
            </div>

            <!-- Ad Container -->
            <div class="ad-container rounded-lg p-4 mb-6 text-center">
                <div class="text-gray-500 mb-4">
                    <i class="fas fa-ad text-3xl mb-2"></i>
                    <p class="text-sm">Advertisement</p>
                </div>
                
                <!-- Ad Network Scripts -->
                ${generateAdScript(adNetwork, country, device)}
                
                <div class="text-xs text-gray-400 mt-4">
                    Supporting content creators • Earnings: $${earnings}
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3 justify-center">
                <button onclick="skipAd()" class="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors">
                    <i class="fas fa-forward mr-2"></i>Skip (3s)
                </button>
                <button onclick="continueToLink()" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    <i class="fas fa-external-link-alt mr-2"></i>Continue
                </button>
            </div>

            <!-- Security Info -->
            <div class="mt-6 p-3 bg-green-50 rounded-lg border border-green-200">
                <div class="flex items-center text-green-700 text-sm">
                    <i class="fas fa-shield-alt mr-2"></i>
                    <span>This link has been verified as safe</span>
                </div>
            </div>
        </div>
    </div>

    <script>
        let countdown = 5;
        let skipEnabled = false;
        
        const countdownEl = document.getElementById('countdown');
        const progressEl = document.getElementById('progress');
        
        const timer = setInterval(() => {
            countdown--;
            countdownEl.textContent = countdown;
            progressEl.style.width = ((5 - countdown) / 5) * 100 + '%';
            
            if (countdown === 2) {
                skipEnabled = true;
                document.querySelector('button[onclick="skipAd()"]').disabled = false;
                document.querySelector('button[onclick="skipAd()"]').innerHTML = '<i class="fas fa-forward mr-2"></i>Skip';
            }
            
            if (countdown <= 0) {
                clearInterval(timer);
                continueToLink();
            }
        }, 1000);
        
        function skipAd() {
            if (!skipEnabled) return;
            clearInterval(timer);
            continueToLink();
        }
        
        function continueToLink() {
            window.location.href = '${originalUrl}';
        }
        
        // Track ad engagement
        document.addEventListener('click', (e) => {
            if (e.target.closest('.ad-container')) {
                fetch('/api/track-ad-click', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ shortCode: '${shortCode}', adNetwork: '${adNetwork}' })
                });
            }
        });
    </script>
</body>
</html>`;
}

function generateAdScript(adNetwork, country, device) {
  switch (adNetwork) {
    case 'propeller':
      return `<script async src="//cdn.propellerads.com/tags/PropellerAds.js"></script>`;
    case 'google':
      return `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>`;
    case 'coinzilla':
      return `<script async src="//coinzillatag.com/lib/display.js"></script>`;
    default:
      return '<div class="loader mx-auto"></div>';
  }
}

function generatePasswordPage(shortCode) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LinkVault - Password Required</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen flex items-center justify-center">
    <div class="max-w-md mx-auto p-6">
        <div class="bg-white rounded-xl shadow-2xl p-8">
            <div class="text-center mb-6">
                <div class="bg-yellow-100 p-3 rounded-full inline-block mb-4">
                    <i class="fas fa-lock text-yellow-600 text-2xl"></i>
                </div>
                <h1 class="text-2xl font-bold text-gray-800 mb-2">Password Protected</h1>
                <p class="text-gray-600">This link requires a password to access.</p>
            </div>
            
            <form onsubmit="submitPassword(event)" class="space-y-4">
                <div>
                    <input type="password" id="password" placeholder="Enter password" 
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                </div>
                <button type="submit" class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors">
                    <i class="fas fa-unlock mr-2"></i>Access Link
                </button>
            </form>
        </div>
    </div>
    
    <script>
        function submitPassword(e) {
            e.preventDefault();
            const password = document.getElementById('password').value;
            window.location.href = window.location.pathname + '?password=' + encodeURIComponent(password);
        }
    </script>
</body>
</html>`;
}

function generateErrorPage(title, message) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LinkVault - ${title}</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-gradient-to-br from-red-50 to-pink-100 min-h-screen flex items-center justify-center">
    <div class="max-w-md mx-auto p-6">
        <div class="bg-white rounded-xl shadow-2xl p-8 text-center">
            <div class="bg-red-100 p-3 rounded-full inline-block mb-4">
                <i class="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
            </div>
            <h1 class="text-2xl font-bold text-gray-800 mb-2">${title}</h1>
            <p class="text-gray-600 mb-6">${message}</p>
            <a href="/" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block">
                <i class="fas fa-home mr-2"></i>Go Home
            </a>
        </div>
    </div>
</body>
</html>`;
}