import UAParser from 'ua-parser-js';

/**
 * Extract client IP address from request
 */
export function getClientIP(req) {
  // Check various headers for the real IP (Vercel, Cloudflare, etc.)
  const forwarded = req.headers['x-forwarded-for'];
  const realIP = req.headers['x-real-ip'];
  const cfIP = req.headers['cf-connecting-ip'];
  const vercelIP = req.headers['x-vercel-forwarded-for'];
  
  if (cfIP) return cfIP;
  if (vercelIP) return vercelIP;
  if (realIP) return realIP;
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  // Fallback to connection remote address
  return req.connection?.remoteAddress || 
         req.socket?.remoteAddress || 
         req.connection?.socket?.remoteAddress ||
         '127.0.0.1';
}

/**
 * Get country and location data from IP address
 */
export async function getCountryFromIP(ipAddress) {
  try {
    // Use ip-api.com for free geolocation (15,000 requests/hour)
    const response = await fetch(`http://ip-api.com/json/${ipAddress}?fields=status,message,country,countryCode,region,regionName,city,lat,lon,timezone,isp`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'success') {
      return {
        country: data.countryCode || 'Unknown',
        countryName: data.country || 'Unknown',
        region: data.regionName || '',
        city: data.city || '',
        latitude: data.lat || 0,
        longitude: data.lon || 0,
        timezone: data.timezone || '',
        isp: data.isp || '',
        ip: ipAddress
      };
    } else {
      console.error('IP geolocation failed:', data.message);
      return getDefaultLocationData(ipAddress);
    }
  } catch (error) {
    console.error('Error fetching IP geolocation:', error);
    return getDefaultLocationData(ipAddress);
  }
}

/**
 * Fallback location data when geolocation fails
 */
function getDefaultLocationData(ipAddress) {
  return {
    country: 'US', // Default to US for highest CPM
    countryName: 'United States',
    region: '',
    city: '',
    latitude: 0,
    longitude: 0,
    timezone: '',
    isp: '',
    ip: ipAddress
  };
}

/**
 * Parse user agent string to extract device and browser info
 */
export function getUserAgent(userAgentString) {
  try {
    const parser = new UAParser(userAgentString);
    const result = parser.getResult();
    
    return {
      device: getDeviceType(result),
      browser: result.browser.name || 'Unknown',
      browserVersion: result.browser.version || '',
      os: result.os.name || 'Unknown',
      osVersion: result.os.version || '',
      engine: result.engine.name || '',
      userAgent: userAgentString
    };
  } catch (error) {
    console.error('Error parsing user agent:', error);
    return {
      device: 'desktop',
      browser: 'Unknown',
      browserVersion: '',
      os: 'Unknown',
      osVersion: '',
      engine: '',
      userAgent: userAgentString
    };
  }
}

/**
 * Determine device type from parsed user agent
 */
function getDeviceType(parsedUA) {
  if (parsedUA.device.type) {
    switch (parsedUA.device.type) {
      case 'mobile':
        return 'mobile';
      case 'tablet':
        return 'tablet';
      default:
        return 'desktop';
    }
  }
  
  // Fallback detection based on OS
  const os = parsedUA.os.name?.toLowerCase() || '';
  if (os.includes('android') || os.includes('ios')) {
    return 'mobile';
  }
  
  return 'desktop';
}

/**
 * Get device type (legacy function for compatibility)
 */
export function getDevice(userAgentString) {
  return getUserAgent(userAgentString).device;
}

/**
 * Check if IP address is in a high-value country for CPM
 */
export function isHighValueCountry(countryCode) {
  const highValueCountries = [
    'US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'CH',
    'SE', 'NO', 'DK', 'FI', 'AT', 'BE', 'JP', 'KR', 'SG', 'HK'
  ];
  
  return highValueCountries.includes(countryCode?.toUpperCase());
}

/**
 * Get CPM multiplier based on country
 */
export function getCountryCPMMultiplier(countryCode) {
  const multipliers = {
    // Tier 1 countries - Highest CPM
    'US': 2.5,
    'CA': 2.0,
    'GB': 2.0,
    'AU': 1.8,
    'DE': 1.8,
    'CH': 1.8,
    'NO': 1.7,
    'SE': 1.6,
    'DK': 1.6,
    'NL': 1.5,
    'FI': 1.5,
    'AT': 1.4,
    'BE': 1.4,
    'FR': 1.3,
    'IT': 1.2,
    'ES': 1.2,
    'JP': 1.5,
    'KR': 1.3,
    'SG': 1.4,
    'HK': 1.3,
    
    // Tier 2 countries - Medium CPM
    'IE': 1.1,
    'PT': 1.0,
    'GR': 1.0,
    'CZ': 0.9,
    'PL': 0.8,
    'HU': 0.8,
    'SK': 0.8,
    'SI': 0.8,
    'EE': 0.7,
    'LV': 0.7,
    'LT': 0.7,
    'HR': 0.7,
    'BG': 0.6,
    'RO': 0.6,
    'RS': 0.6,
    'MK': 0.5,
    'ME': 0.5,
    'BA': 0.5,
    'AL': 0.4,
    
    // Other developed countries
    'NZ': 1.4,
    'IL': 1.1,
    'AE': 1.0,
    'SA': 0.9,
    'QA': 0.9,
    'KW': 0.9,
    'BH': 0.8,
    'OM': 0.8,
    
    // Asian markets
    'TW': 0.9,
    'MY': 0.7,
    'TH': 0.6,
    'ID': 0.5,
    'PH': 0.5,
    'VN': 0.4,
    'IN': 0.3,
    'PK': 0.2,
    'BD': 0.2,
    'LK': 0.2,
    'CN': 0.8, // Special case - high volume, medium rates
    
    // Latin America
    'BR': 0.4,
    'MX': 0.4,
    'AR': 0.3,
    'CL': 0.3,
    'CO': 0.3,
    'PE': 0.3,
    'UY': 0.3,
    'CR': 0.3,
    'PA': 0.3,
    'EC': 0.2,
    'BO': 0.2,
    'PY': 0.2,
    'VE': 0.2,
    'GT': 0.2,
    'HN': 0.2,
    'NI': 0.2,
    'SV': 0.2,
    'DO': 0.2,
    'CU': 0.2,
    'JM': 0.2,
    'TT': 0.2,
    
    // Africa and others
    'ZA': 0.3,
    'EG': 0.2,
    'MA': 0.2,
    'TN': 0.2,
    'KE': 0.2,
    'GH': 0.2,
    'NG': 0.2,
    'DZ': 0.2,
    'LY': 0.2,
    'ET': 0.1,
    'UG': 0.1,
    'TZ': 0.1,
    'ZW': 0.1,
    'ZM': 0.1,
    'MW': 0.1,
    'MZ': 0.1,
    'AO': 0.1,
    'CD': 0.1,
    'CM': 0.1,
    'CI': 0.1,
    'SN': 0.1,
    'ML': 0.1,
    'BF': 0.1,
    'NE': 0.1,
    'TD': 0.1,
    'CF': 0.1,
    'GN': 0.1,
    'SL': 0.1,
    'LR': 0.1,
    'GM': 0.1,
    'GW': 0.1,
    'CV': 0.1,
    'ST': 0.1,
    'GQ': 0.1,
    'GA': 0.1,
    'CG': 0.1,
    'DJ': 0.1,
    'SO': 0.1,
    'ER': 0.1,
    'SS': 0.1,
    'SD': 0.1,
    'RW': 0.1,
    'BI': 0.1,
    'KM': 0.1,
    'SC': 0.1,
    'MU': 0.1,
    'MG': 0.1,
    'RE': 0.1,
    'YT': 0.1,
    
    // Eastern Europe & CIS
    'RU': 0.4,
    'UA': 0.3,
    'BY': 0.3,
    'MD': 0.2,
    'AM': 0.2,
    'AZ': 0.2,
    'GE': 0.2,
    'KZ': 0.2,
    'KG': 0.1,
    'TJ': 0.1,
    'TM': 0.1,
    'UZ': 0.1,
    'MN': 0.1
  };
  
  return multipliers[countryCode?.toUpperCase()] || 0.1; // Default low multiplier
}

/**
 * Get device CPM multiplier
 */
export function getDeviceCPMMultiplier(deviceType) {
  const multipliers = {
    'mobile': 1.2,    // Mobile typically has higher CPM
    'tablet': 1.1,    // Tablet moderate premium
    'desktop': 1.0    // Desktop baseline
  };
  
  return multipliers[deviceType?.toLowerCase()] || 1.0;
}

/**
 * Get time-based CPM multiplier (higher during business hours)
 */
export function getTimeCPMMultiplier(hour = new Date().getHours()) {
  // Peak hours: 9 AM - 9 PM (business hours + evening)
  if (hour >= 9 && hour <= 21) {
    return 1.3;
  }
  // Late evening: 6 PM - 11 PM (higher engagement)
  if (hour >= 18 && hour <= 23) {
    return 1.5;
  }
  // Early morning/night: lower engagement
  return 0.8;
}

/**
 * Validate IP address format
 */
export function isValidIP(ip) {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}