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
    // Create input element
    const input = document.createElement('input');
    input.setAttribute('type', 'text');
    input.setAttribute('value', text);
    input.setAttribute('readonly', 'readonly');
    input.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      opacity: 0;
      z-index: 999999;
      font-size: 16px;
      width: 1px;
      height: 1px;
      padding: 0;
      border: 0;
      outline: 0;
      background: transparent;
    `;
    
    document.body.appendChild(input);

    // Simulate iOS touch/click events
    const simulateTouch = () => {
      input.style.opacity = '1';
      input.style.width = '200px';
      input.style.height = '40px';
      input.focus();
      input.setSelectionRange(0, text.length);

      // Create and dispatch touch events
      const touchStart = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      const touchEnd = new TouchEvent('touchend', {
        bubbles: true,
        cancelable: true,
        view: window
      });

      input.dispatchEvent(touchStart);
      input.dispatchEvent(touchEnd);

      // Also try mouse events as fallback
      const mouseDown = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      const mouseUp = new MouseEvent('mouseup', {
        bubbles: true,
        cancelable: true,
        view: window
      });

      input.dispatchEvent(mouseDown);
      input.dispatchEvent(mouseUp);

      // Try select and copy command
      input.select();
      document.execCommand('selectAll');
      document.execCommand('copy');

      // Hide after events
      setTimeout(() => {
        input.style.opacity = '0';
        input.style.width = '1px';
        input.style.height = '1px';
      }, 100);
    };

    // Try multiple times with different delays
    simulateTouch();
    setTimeout(simulateTouch, 300);
    
    // Remove after all attempts
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

      // Add a longer delay before redirect to ensure copy works
      await new Promise(resolve => setTimeout(resolve, 1500));

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
    </div>
  );
};

export default RedirectToAppStore; 