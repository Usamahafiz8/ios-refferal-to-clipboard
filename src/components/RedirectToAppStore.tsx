import { Title } from "@mantine/core";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  DEFAULT_IOS_URL,
  IOS_DEEP_LINKS,
  getPlatformFromUserAgent,
  getDeepLink,
  handleIOSRedirect,
} from "./DeepLinkHandler";

const RedirectToAppStore = () => {
  const location = useLocation();

  const getReferralCode = () => {
    // Get referral from query parameter
    const queryParams = new URLSearchParams(location.search);
    const queryReferral = queryParams.get("ref");

    console.log("🔍 Found referral code from URL:", queryReferral);

    if (queryReferral) {
      console.log("✅ Using referral from URL:", queryReferral);
      return queryReferral;
    }

    console.log("⚠️ No referral found, using default");
    return "default";
  };

  const getStoreUrl = (referralCode: string) => {
    const link = IOS_DEEP_LINKS.find(
      (link) => link.referralCode === referralCode
    );
    return link?.url || DEFAULT_IOS_URL;
  };

  const forceCopy = (text: string) => {
    // Method 1: Create input and force select
    const el = document.createElement('textarea');
    el.value = text;
    el.setAttribute('readonly', '');
    el.style.position = 'fixed';
    el.style.left = '0';
    el.style.top = '0';
    el.style.opacity = '0';
    document.body.appendChild(el);
    
    // iOS specific focus and select
    el.contentEditable = 'true';
    el.readOnly = false;
    
    // Create selection range
    const range = document.createRange();
    range.selectNodeContents(el);
    
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
    
    el.setSelectionRange(0, 999999);
    el.readOnly = true;
    
    // Trigger copy
    document.execCommand('copy');
    document.body.removeChild(el);

    // Method 2: Try clipboard API
    try {
      navigator.clipboard.writeText(text);
    } catch (e) {
      console.log('Clipboard API failed, but execCommand might have worked');
    }
  };

  const handleRedirect = async (platform: 'ios' | null, referralCode: string) => {
    try {
      if (!platform) {
        console.log("⚠️ Not an iOS device, redirecting to App Store");
        const storeUrl = getStoreUrl(referralCode);
        console.log("🔄 Redirecting to:", storeUrl);
        window.location.href = storeUrl;
        return;
      }

      // Force copy immediately for iOS
      forceCopy(referralCode);

      // Get deep link config
      const config = getDeepLink(referralCode);
      console.log("🔗 Using config:", config);

      // Check if we're on EC2 or production environment
      const isEC2 =
        window.location.hostname.includes("ec2") ||
        window.location.hostname.includes("amazonaws.com");

      if (isEC2) {
        console.log("🖥️ Running on EC2, skipping app URI redirect");
        const storeUrl = getStoreUrl(referralCode);
        console.log("🔄 EC2: Redirecting directly to store:", storeUrl);
        window.location.href = storeUrl;
        return;
      }

      // Handle iOS redirect
      const cleanup = handleIOSRedirect(config);
      return cleanup;
    } catch (error) {
      console.error("❌ Error during redirect:", error);
      const storeUrl = getStoreUrl(referralCode);
      console.log("🔄 Error fallback redirect to:", storeUrl);
      window.location.href = storeUrl;
    }
  };

  useEffect(() => {
    const initializeRedirect = async () => {
      try {
        const userAgent = navigator.userAgent || navigator.vendor || "";
        const platform = getPlatformFromUserAgent(userAgent);
        console.log("📱 Platform:", platform, "User Agent:", userAgent);
        console.log("🌐 Current hostname:", window.location.hostname);

        const referralCode = getReferralCode();
        console.log("🔗 Using referral code:", referralCode);

        // Try to copy immediately on mount for iOS
        if (platform === 'ios') {
          forceCopy(referralCode);
          // Try multiple times to ensure it works
          setTimeout(() => forceCopy(referralCode), 100);
          setTimeout(() => forceCopy(referralCode), 500);
        }

        await handleRedirect(platform, referralCode);
      } catch (error) {
        console.error("❌ Critical error during redirect setup:", error);
        window.location.href = DEFAULT_IOS_URL;
      }
    };

    initializeRedirect();
  }, [location]);

  const referralCode = getReferralCode();
  const storeUrl = getStoreUrl(referralCode);

  return (
    <div style={{ textAlign: "center", paddingTop: "100px" }}>
      <Title>Redirecting you to the App Store...</Title>
      <Title size="sm" style={{ marginTop: 16 }}>
        If not redirected, <a href={storeUrl}>click here</a>
      </Title>
      
      {/* Hidden text element to help with iOS copying */}
      <textarea
        value={referralCode}
        readOnly
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          opacity: 0,
          height: '1px',
          width: '1px',
          padding: 0,
          border: 'none',
          margin: 0,
          zIndex: -1,
        }}
      />
    </div>
  );
};

export default RedirectToAppStore; 