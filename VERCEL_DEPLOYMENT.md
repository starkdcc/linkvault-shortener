# 🚀 LinkVault Vercel Deployment Guide

## 🎯 Quick Deploy (5 Minutes)

Your GitHub repository is ready! Now let's deploy to Vercel and configure your domain.

### Step 1: Deploy to Vercel
1. **Visit**: [https://vercel.com/new](https://vercel.com/new)
2. **Import from GitHub**: Look for `starkdcc/linkvault-shortener`
3. **Click "Import"** 
4. **Framework**: Next.js (auto-detected)
5. **Root Directory**: `./` (leave default)
6. **Build Command**: `npm run build` (auto-filled)
7. **Output Directory**: `.next` (auto-filled)
8. **Install Command**: `npm install` (auto-filled)
9. **Click "Deploy"**

### Step 2: Environment Variables (Critical for Monetization)

After deployment starts, add these environment variables in Vercel Dashboard:

#### 🗄️ Database Configuration
```env
DATABASE_URL=postgresql://username:password@host:port/database
```
**Recommended**: Use [PlanetScale](https://planetscale.com/) or [Supabase](https://supabase.com/) for free PostgreSQL

#### 🔐 Security Keys
```env
JWT_SECRET=your-super-secure-jwt-secret-key-here-32-chars-min
ENCRYPTION_KEY=your-32-character-encryption-key-here-exactly-32
NEXTAUTH_SECRET=your-nextauth-secret-key-here-minimum-32-chars
NEXTAUTH_URL=https://linkvault.dpdns.org
```

#### 💰 High CPM Ad Networks
```env
# Google AdSense (Apply at: https://adsense.google.com)
GOOGLE_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX
GOOGLE_ADSENSE_SLOT=XXXXXXXXXX

# PropellerAds (High CPM - Apply at: https://propellerads.com)
PROPELLER_ADS_SITE_ID=XXXXXXX
PROPELLER_ADS_ZONE_ID=XXXXXXX

# Coinzilla (Crypto ads - Apply at: https://coinzilla.com)
COINZILLA_ZONE_ID=your-coinzilla-zone-id
COINZILLA_API_KEY=your-coinzilla-api-key

# PopAds (High paying - Apply at: https://popads.net)
POPADS_SITE_ID=XXXXXXX
POPADS_API_KEY=your-popads-api-key
```

#### 💳 Payment Processing
```env
# Stripe (Apply at: https://stripe.com)
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx

# PayPal (Apply at: https://developer.paypal.com)
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret

# Coinbase (Crypto payments - Apply at: https://developers.coinbase.com)
COINBASE_API_KEY=your-coinbase-api-key
COINBASE_API_SECRET=your-coinbase-api-secret
```

#### 📧 Email & Analytics
```env
# Email (Use Gmail App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@linkvault.dpdns.org

# Google Analytics
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

#### 🌐 App Configuration
```env
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://linkvault.dpdns.org
NEXT_PUBLIC_APP_NAME=LinkVault
DEFAULT_DOMAIN=linkvault.dpdns.org
```

### Step 3: Database Setup

#### Option A: PlanetScale (Recommended - Free)
1. Sign up at [PlanetScale.com](https://planetscale.com)
2. Create database: `linkvault-db`
3. Get connection string
4. Add to `DATABASE_URL` in Vercel

#### Option B: Supabase (Alternative - Free)
1. Sign up at [Supabase.com](https://supabase.com)
2. Create project: `linkvault`
3. Get PostgreSQL connection string
4. Add to `DATABASE_URL` in Vercel

### Step 4: Custom Domain Setup
1. **In Vercel Dashboard**:
   - Go to your deployed project
   - Click "Domains" tab
   - Add domain: `linkvault.dpdns.org`
   - Copy the CNAME record provided

2. **Configure DNS**:
   - Login to your DNS provider
   - Add CNAME record:
     ```
     Name: linkvault
     Value: [vercel-provided-cname]
     ```

### Step 5: Initialize Database
Once deployed with `DATABASE_URL`, run these commands:

```bash
# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# (Optional) Seed with sample data
npx prisma db seed
```

## 🎯 Post-Deployment Checklist

### ✅ Verify Features Working:
- [ ] URL shortening working
- [ ] Click tracking active
- [ ] Analytics dashboard accessible
- [ ] User registration/login functional
- [ ] Payment systems integrated
- [ ] Ad networks displaying
- [ ] Email notifications sending
- [ ] Custom domain resolving

### 💰 Revenue Optimization:
- [ ] Apply to ad networks (PropellerAds, AdSense, Coinzilla)
- [ ] Configure payment methods (PayPal, Stripe, Crypto)
- [ ] Set up premium plans and pricing
- [ ] Enable referral system
- [ ] Configure geo-targeting for maximum CPM

### 📊 Monitoring Setup:
- [ ] Google Analytics tracking
- [ ] Error monitoring (Vercel automatically included)
- [ ] Performance monitoring
- [ ] Revenue tracking dashboard

## 💡 Quick Tips:

### 🚀 For Immediate Earnings:
1. **Start with PropellerAds** - Fast approval, high CPM
2. **Enable crypto payments** - Higher conversion rates
3. **Set premium plans** - $3, $8, $15 CPM tiers
4. **Promote referral system** - 10% commissions

### 🔧 Performance Optimization:
- Edge functions for redirects (already configured)
- Image optimization enabled
- Automatic code splitting
- CDN caching globally

### 💸 Expected Revenue:
- **Month 1**: $500-$1,500 (initial traffic)
- **Month 3**: $2,000-$5,000 (established user base)
- **Month 6**: $5,000-$15,000+ (premium users + referrals)

## 🆘 Need Help?

If you encounter any issues:
1. Check Vercel deployment logs
2. Verify environment variables are set
3. Confirm database connection
4. Test API endpoints manually

---

## 🎉 You're Ready to Launch!

**Your LinkVault URL shortener will be live at:**
**https://linkvault.dpdns.org**

**Expected launch time**: 5-10 minutes after following this guide!

**Start monetizing immediately** with high CPM ads and crypto payments! 💰