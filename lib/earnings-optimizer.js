import { getCountryCPMMultiplier, getDeviceCPMMultiplier, getTimeCPMMultiplier, isHighValueCountry } from './geo-utils';

export class EarningsOptimizer {
  constructor() {
    this.adNetworks = [
      {
        id: 'propeller',
        name: 'PropellerAds',
        baseCPM: 5.0,
        countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'CH', 'SE', 'NO', 'DK'],
        deviceTypes: ['mobile', 'desktop', 'tablet'],
        minCPM: 1.0,
        maxCPM: 15.0
      },
      {
        id: 'google',
        name: 'Google AdSense',
        baseCPM: 3.5,
        countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'JP', 'KR', 'NL', 'CH', 'SE'],
        deviceTypes: ['mobile', 'desktop', 'tablet'],
        minCPM: 0.5,
        maxCPM: 12.0
      },
      {
        id: 'coinzilla',
        name: 'Coinzilla',
        baseCPM: 8.0,
        countries: ['US', 'CA', 'GB', 'DE', 'SG', 'JP', 'KR', 'AU', 'CH', 'NL'],
        deviceTypes: ['mobile', 'desktop'],
        minCPM: 2.0,
        maxCPM: 25.0,
        specialty: 'crypto'
      },
      {
        id: 'popads',
        name: 'PopAds',
        baseCPM: 4.5,
        countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'BR', 'MX'],
        deviceTypes: ['mobile', 'desktop', 'tablet'],
        minCPM: 1.0,
        maxCPM: 10.0
      },
      {
        id: 'a_ads',
        name: 'A-Ads',
        baseCPM: 6.0,
        countries: ['US', 'CA', 'GB', 'DE', 'NL', 'CH', 'AU', 'SG'],
        deviceTypes: ['mobile', 'desktop'],
        minCPM: 2.0,
        maxCPM: 15.0,
        specialty: 'crypto'
      }
    ];

    this.planMultipliers = {
      'free': 1.0,
      'starter': 1.5,
      'professional': 2.0,
      'enterprise': 3.0
    };
  }

  /**
   * Calculate optimized earnings based on multiple factors
   */
  async calculateEarnings(params) {
    const {
      country = 'US',
      device = 'desktop',
      timeOfDay = new Date().getHours(),
      userPlan = 'free',
      isUnique = true,
      userId,
      ipAddress
    } = params;

    // Skip earnings for bots or suspicious traffic
    if (await this.isSuspiciousTraffic(ipAddress, userId)) {
      return {
        amount: 0,
        adNetwork: null,
        reason: 'suspicious_traffic'
      };
    }

    // Select best ad network for this traffic
    const selectedNetwork = this.selectOptimalAdNetwork(country, device);
    
    if (!selectedNetwork) {
      return {
        amount: 0,
        adNetwork: null,
        reason: 'no_suitable_network'
      };
    }

    // Calculate base earnings
    let earnings = selectedNetwork.baseCPM / 1000; // Convert CPM to per-click earnings

    // Apply multipliers
    const countryMultiplier = getCountryCPMMultiplier(country);
    const deviceMultiplier = getDeviceCPMMultiplier(device);
    const timeMultiplier = getTimeCPMMultiplier(timeOfDay);
    const planMultiplier = this.planMultipliers[userPlan] || 1.0;
    
    // Unique click bonus
    const uniqueMultiplier = isUnique ? 1.0 : 0.3; // Non-unique clicks get 30% earnings

    // Calculate final earnings
    earnings *= countryMultiplier * deviceMultiplier * timeMultiplier * planMultiplier * uniqueMultiplier;

    // Apply network min/max constraints
    const finalCPM = Math.min(Math.max(earnings * 1000, selectedNetwork.minCPM), selectedNetwork.maxCPM);
    earnings = finalCPM / 1000;

    // Add random variation (±10%) to prevent gaming
    const randomFactor = 0.9 + (Math.random() * 0.2);
    earnings *= randomFactor;

    // Round to 4 decimal places
    earnings = Math.round(earnings * 10000) / 10000;

    return {
      amount: earnings,
      adNetwork: selectedNetwork.id,
      cpm: finalCPM,
      multipliers: {
        country: countryMultiplier,
        device: deviceMultiplier,
        time: timeMultiplier,
        plan: planMultiplier,
        unique: uniqueMultiplier
      },
      networkInfo: {
        name: selectedNetwork.name,
        baseCPM: selectedNetwork.baseCPM
      }
    };
  }

  /**
   * Select optimal ad network based on country and device
   */
  selectOptimalAdNetwork(country, device) {
    // Filter networks that support this country and device
    const suitableNetworks = this.adNetworks.filter(network => 
      network.countries.includes(country) && 
      network.deviceTypes.includes(device)
    );

    if (suitableNetworks.length === 0) {
      // Fallback to any network that supports the device
      const fallbackNetworks = this.adNetworks.filter(network => 
        network.deviceTypes.includes(device)
      );
      if (fallbackNetworks.length === 0) return null;
      return fallbackNetworks[0];
    }

    // For high-value countries, prefer crypto networks
    if (isHighValueCountry(country)) {
      const cryptoNetworks = suitableNetworks.filter(network => 
        network.specialty === 'crypto'
      );
      if (cryptoNetworks.length > 0) {
        // Select highest CPM crypto network
        return cryptoNetworks.reduce((best, current) => 
          current.baseCPM > best.baseCPM ? current : best
        );
      }
    }

    // Otherwise, select network with highest base CPM
    return suitableNetworks.reduce((best, current) => 
      current.baseCPM > best.baseCPM ? current : best
    );
  }

  /**
   * Check for suspicious traffic patterns
   */
  async isSuspiciousTraffic(ipAddress, userId) {
    // This would typically check against a database of known patterns
    
    // Check for localhost/development IPs
    if (ipAddress === '127.0.0.1' || ipAddress === '::1' || ipAddress.startsWith('192.168.')) {
      return false; // Allow for development
    }

    // Check for common bot IP patterns
    const botPatterns = [
      /^66\.249\./, // Googlebot
      /^157\.55\./, // Bing bot
      /^54\./, // AWS (common for bots)
      /^18\./, // AWS
    ];

    for (const pattern of botPatterns) {
      if (pattern.test(ipAddress)) {
        return true;
      }
    }

    // Add more sophisticated checks here:
    // - Rate limiting per IP
    // - User agent analysis
    // - Click patterns
    // - Geolocation consistency

    return false;
  }

  /**
   * Get earnings statistics for a user
   */
  async getEarningsStats(userId, timeframe = '30d') {
    // This would query the database for user earnings
    // For now, return sample data
    return {
      totalEarnings: 0,
      totalClicks: 0,
      averageCPM: 0,
      topCountries: [],
      topNetworks: [],
      recentEarnings: []
    };
  }

  /**
   * Predict earnings potential for a URL
   */
  predictEarnings(url, userPlan = 'free', estimatedClicks = 100) {
    const averageCPM = 3.0; // Base average
    const planMultiplier = this.planMultipliers[userPlan] || 1.0;
    
    const estimatedEarnings = (averageCPM / 1000) * estimatedClicks * planMultiplier;
    
    return {
      estimatedEarnings: Math.round(estimatedEarnings * 100) / 100,
      estimatedCPM: averageCPM * planMultiplier,
      basedOnClicks: estimatedClicks,
      assumptions: {
        averageCountryTier: 'mid',
        averageDevice: 'mixed',
        uniqueClickRate: 0.7
      }
    };
  }

  /**
   * Get recommended plan based on expected traffic
   */
  getRecommendedPlan(expectedMonthlyClicks) {
    if (expectedMonthlyClicks < 1000) {
      return {
        plan: 'free',
        reason: 'Low traffic volume, free plan sufficient',
        potentialEarnings: expectedMonthlyClicks * 0.001
      };
    } else if (expectedMonthlyClicks < 10000) {
      return {
        plan: 'starter',
        reason: 'Medium traffic, starter plan provides better CPM',
        potentialEarnings: expectedMonthlyClicks * 0.003
      };
    } else if (expectedMonthlyClicks < 100000) {
      return {
        plan: 'professional',
        reason: 'High traffic, professional plan maximizes earnings',
        potentialEarnings: expectedMonthlyClicks * 0.008
      };
    } else {
      return {
        plan: 'enterprise',
        reason: 'Very high traffic, enterprise plan offers premium CPM',
        potentialEarnings: expectedMonthlyClicks * 0.015
      };
    }
  }
}