import type { DeepLinkConfig, IOSDeepLinkConfig } from "../types/DeepLink";

// Constants
export const IOS_APP_URI = "gamisodes://babyeinstein";
export const DEFAULT_IOS_URL = "https://apps.apple.com/us/app/gamisodes/id6691440023?ppid=da6284ac-d8ec-4ba7-9a34-790e29216777";

// Deep Link Configurations
export const IOS_DEEP_LINKS: DeepLinkConfig[] = [
  {
    platform: "EMAIL",
    campaign: "BABY EINSTEIN",
    referralCode: "babyeinsteinE1",
    url: `${DEFAULT_IOS_URL}&referrer=babyeinsteinE1`
  },
  {
    platform: "DEFAULT",
    campaign: "BABY EINSTEIN",
    referralCode: "default",
    url: DEFAULT_IOS_URL
  }
];

// Platform Detection
export const getPlatformFromUserAgent = (userAgent: string): 'ios' | null => {
  console.log('🔍 Analyzing User Agent:', userAgent);
  
  const iosIndicators = ['iPad', 'iPhone', 'iPod', 'iOS', 'Mac OS', 'like Mac OS'];

  const isIOS = iosIndicators.some(indicator => {
    const hasIndicator = userAgent.includes(indicator);
    if (hasIndicator) console.log(`✅ Found iOS indicator: ${indicator}`);
    return hasIndicator;
  });

  if (isIOS && !("MSStream" in window)) {
    console.log('📱 Detected platform: iOS');
    return 'ios';
  }

  console.log('❌ Not an iOS device');
  return null;
};

// Deep Link Handlers
export const getDeepLink = (referralCode: string): IOSDeepLinkConfig => {
  console.log(`🔗 Getting deep link for referral: ${referralCode}`);
  
  const link = IOS_DEEP_LINKS.find(link => link.referralCode === referralCode);
  console.log('📱 iOS deep link found:', link);
  return {
    appUri: IOS_APP_URI,
    storeUrl: link?.url || DEFAULT_IOS_URL
  };
};

export const handleIOSRedirect = (config: IOSDeepLinkConfig): (() => void) => {
  console.log('🔄 Starting iOS redirect with config:', config);
  const start = Date.now();
  window.location.href = config.appUri;

  const timeout = setTimeout(() => {
    if (Date.now() - start < 1500) {
      console.log('⏳ App open timeout, falling back to store URL');
      window.location.href = config.storeUrl || DEFAULT_IOS_URL;
    }
  }, 1000);

  return () => clearTimeout(timeout);
}; 