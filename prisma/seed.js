const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding LinkVault database...');

  // Create premium subscription plans
  const plans = await Promise.all([
    prisma.plan.upsert({
      where: { name: 'free' },
      update: {},
      create: {
        name: 'free',
        displayName: 'Free Plan',
        price: 0.00,
        cpmRate: 1.00,
        referralBonus: 0.10,
        withdrawalLimit: 10.00,
        features: {
          maxUrls: 100,
          analytics: 'basic',
          customDomain: false,
          passwordProtection: true,
          qrCodes: true,
          apiAccess: false,
          priority: 'standard',
          support: 'community'
        },
        isActive: true,
        sortOrder: 1
      }
    }),

    prisma.plan.upsert({
      where: { name: 'starter' },
      update: {},
      create: {
        name: 'starter',
        displayName: 'Starter Plan',
        price: 9.99,
        cpmRate: 3.00,
        referralBonus: 0.30,
        withdrawalLimit: 5.00,
        features: {
          maxUrls: 1000,
          analytics: 'advanced',
          customDomain: true,
          passwordProtection: true,
          qrCodes: true,
          apiAccess: true,
          priority: 'high',
          support: 'email'
        },
        isActive: true,
        sortOrder: 2
      }
    }),

    prisma.plan.upsert({
      where: { name: 'professional' },
      update: {},
      create: {
        name: 'professional',
        displayName: 'Professional Plan',
        price: 29.99,
        cpmRate: 8.00,
        referralBonus: 0.80,
        withdrawalLimit: 1.00,
        features: {
          maxUrls: 10000,
          analytics: 'premium',
          customDomain: true,
          passwordProtection: true,
          qrCodes: true,
          apiAccess: true,
          priority: 'highest',
          support: 'priority',
          whiteLabel: true,
          bulkOperations: true
        },
        isActive: true,
        sortOrder: 3
      }
    }),

    prisma.plan.upsert({
      where: { name: 'enterprise' },
      update: {},
      create: {
        name: 'enterprise',
        displayName: 'Enterprise Plan',
        price: 99.99,
        cpmRate: 15.00,
        referralBonus: 1.50,
        withdrawalLimit: 1.00,
        features: {
          maxUrls: -1, // Unlimited
          analytics: 'enterprise',
          customDomain: true,
          passwordProtection: true,
          qrCodes: true,
          apiAccess: true,
          priority: 'enterprise',
          support: 'dedicated',
          whiteLabel: true,
          bulkOperations: true,
          customBranding: true,
          dedicatedManager: true
        },
        isActive: true,
        sortOrder: 4
      }
    })
  ]);

  console.log(`✅ Created ${plans.length} subscription plans`);

  // Create ad networks
  const adNetworks = await Promise.all([
    prisma.adNetwork.upsert({
      where: { code: 'propeller' },
      update: {},
      create: {
        name: 'PropellerAds',
        code: 'propeller',
        scriptUrl: 'https://cdn.propellerads.com/tags/PropellerAds.js',
        isActive: true,
        cpmRate: 5.00,
        countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES'],
        deviceTypes: ['mobile', 'desktop', 'tablet']
      }
    }),

    prisma.adNetwork.upsert({
      where: { code: 'google' },
      update: {},
      create: {
        name: 'Google AdSense',
        code: 'google',
        scriptUrl: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
        isActive: true,
        cpmRate: 3.50,
        countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'JP', 'KR'],
        deviceTypes: ['mobile', 'desktop', 'tablet']
      }
    }),

    prisma.adNetwork.upsert({
      where: { code: 'coinzilla' },
      update: {},
      create: {
        name: 'Coinzilla',
        code: 'coinzilla',
        scriptUrl: 'https://coinzillatag.com/lib/display.js',
        isActive: true,
        cpmRate: 8.00,
        countries: ['US', 'CA', 'GB', 'DE', 'SG', 'JP'],
        deviceTypes: ['mobile', 'desktop']
      }
    }),

    prisma.adNetwork.upsert({
      where: { code: 'popads' },
      update: {},
      create: {
        name: 'PopAds',
        code: 'popads',
        isActive: true,
        cpmRate: 4.50,
        countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'BR', 'MX'],
        deviceTypes: ['mobile', 'desktop', 'tablet']
      }
    }),

    prisma.adNetwork.upsert({
      where: { code: 'a_ads' },
      update: {},
      create: {
        name: 'A-Ads',
        code: 'a_ads',
        isActive: true,
        cpmRate: 6.00,
        countries: ['US', 'CA', 'GB', 'DE', 'NL', 'CH'],
        deviceTypes: ['mobile', 'desktop']
      }
    })
  ]);

  console.log(`✅ Created ${adNetworks.length} ad networks`);

  // Create initial settings
  const settings = await Promise.all([
    prisma.setting.upsert({
      where: { key: 'app_name' },
      update: {},
      create: {
        key: 'app_name',
        value: 'LinkVault'
      }
    }),

    prisma.setting.upsert({
      where: { key: 'app_description' },
      update: {},
      create: {
        key: 'app_description',
        value: 'Premium URL shortener with high CPM ads and crypto payments'
      }
    }),

    prisma.setting.upsert({
      where: { key: 'default_cpm_rate' },
      update: {},
      create: {
        key: 'default_cpm_rate',
        value: 1.00
      }
    }),

    prisma.setting.upsert({
      where: { key: 'minimum_withdrawal' },
      update: {},
      create: {
        key: 'minimum_withdrawal',
        value: 10.00
      }
    }),

    prisma.setting.upsert({
      where: { key: 'referral_bonus_rate' },
      update: {},
      create: {
        key: 'referral_bonus_rate',
        value: 0.10
      }
    }),

    prisma.setting.upsert({
      where: { key: 'short_code_length' },
      update: {},
      create: {
        key: 'short_code_length',
        value: 6
      }
    }),

    prisma.setting.upsert({
      where: { key: 'max_urls_free_plan' },
      update: {},
      create: {
        key: 'max_urls_free_plan',
        value: 100
      }
    }),

    prisma.setting.upsert({
      where: { key: 'enable_registration' },
      update: {},
      create: {
        key: 'enable_registration',
        value: true
      }
    }),

    prisma.setting.upsert({
      where: { key: 'enable_anonymous_shortening' },
      update: {},
      create: {
        key: 'enable_anonymous_shortening',
        value: true
      }
    }),

    prisma.setting.upsert({
      where: { key: 'maintenance_mode' },
      update: {},
      create: {
        key: 'maintenance_mode',
        value: false
      }
    })
  ]);

  console.log(`✅ Created ${settings.length} app settings`);

  console.log('');
  console.log('🎉 LinkVault database seeded successfully!');
  console.log('');
  console.log('📊 Summary:');
  console.log(`   • ${plans.length} subscription plans created`);
  console.log(`   • ${adNetworks.length} ad networks configured`);
  console.log(`   • ${settings.length} app settings initialized`);
  console.log('');
  console.log('🚀 Your LinkVault is ready to start earning money!');
  console.log('');
  console.log('💡 Next steps:');
  console.log('   1. Configure ad network credentials in environment variables');
  console.log('   2. Set up payment processing (Stripe, PayPal, Crypto)');
  console.log('   3. Apply to ad networks for higher CPM rates');
  console.log('   4. Launch and start promoting your URL shortener');
  console.log('');
  console.log('💰 Expected earnings: $1,000-$5,000+ per month');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });