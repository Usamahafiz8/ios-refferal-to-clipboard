export interface DeepLinkConfig {
  platform: string;
  campaign: string;
  referralCode: string;
  url: string;
  intentUri?: string;
}

export interface AndroidDeepLinkConfig {
  appUri: string;
  storeUrl: string;
  intentUri?: string;
}

export interface IOSDeepLinkConfig {
  appUri: string;
  storeUrl: string;
} 