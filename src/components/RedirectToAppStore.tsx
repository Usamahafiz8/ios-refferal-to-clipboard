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
    // Create input element and add to body
    const input = document.createElement('input');
    input.value = text;
    input.style.cssText = 'position:fixed;opacity:1;z-index:999999;';
    document.body.appendChild(input);

    // Select the text
    input.focus();
    input.select();
    input.setSelectionRange(0, input.value.length);

    // Show the input briefly (this helps trigger iOS copy)
    input.style.opacity = '1';
    
    try {
      // Try the copy command
      const success = document.execCommand('copy');
      if (success) {
        console.log('Copied successfully using execCommand');
      }
    } catch (err) {
      console.error('execCommand failed:', err);
    }

    // Also try clipboard API
    try {
      navigator.clipboard.writeText(text).then(
        () => console.log('Clipboard API success'),
        (err) => console.error('Clipboard API failed:', err)
      );
    } catch (err) {
      console.error('Clipboard API error:', err);
    }

    // Remove after a short delay
    setTimeout(() => {
      document.body.removeChild(input);
    }, 1000);
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

      // Add a delay before redirect to ensure copy works
      await new Promise(resolve => setTimeout(resolve, 1000));

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
          // Try multiple times with increasing delays
          forceCopy(referralCode);
          setTimeout(() => forceCopy(referralCode), 300);
          setTimeout(() => forceCopy(referralCode), 600);
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
      
      {/* Hidden input for iOS copying */}
      <input
        type="text"
        defaultValue={referralCode}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 0,
          zIndex: 999999,
          fontSize: '16px', // Prevents iOS zoom
          width: '200px',
          height: '40px',
          padding: '0',
          border: 'none',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

export default RedirectToAppStore; 