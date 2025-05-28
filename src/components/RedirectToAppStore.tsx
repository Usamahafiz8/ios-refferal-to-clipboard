import { Title, Button } from "@mantine/core";
import { useEffect, useState } from "react";
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
  const [showCopyButton, setShowCopyButton] = useState(false);
  const [referralCode, setReferralCode] = useState("");

  const getReferralCode = () => {
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

  const copyToClipboard = async (text: string) => {
    try {
      // Try using Clipboard API first
      await navigator.clipboard.writeText(text);
      console.log("✅ Copied using Clipboard API");
      return true;
    } catch (err) {
      console.error("❌ Clipboard API failed:", err);
      
      try {
        // Fallback to execCommand
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "0";
        textArea.style.top = "0";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const success = document.execCommand("copy");
        document.body.removeChild(textArea);
        
        if (success) {
          console.log("✅ Copied using execCommand");
          return true;
        }
      } catch (err) {
        console.error("❌ execCommand failed:", err);
      }
      
      // If both methods fail, show the button
      setShowCopyButton(true);
      return false;
    }
  };

  const handleManualCopy = async () => {
    await copyToClipboard(referralCode);
    window.location.href = getStoreUrl(referralCode);
  };

  const handleRedirect = async (platform: 'ios' | null, referralCode: string) => {
    try {
      if (!platform) {
        console.log("⚠️ Not an iOS device, redirecting to App Store");
        const storeUrl = getStoreUrl(referralCode);
        window.location.href = storeUrl;
        return;
      }

      // Try to copy to clipboard
      const copySuccess = await copyToClipboard(referralCode);
      
      // If copy succeeded, proceed with redirect
      if (copySuccess) {
        const config = getDeepLink(referralCode);
        console.log("🔗 Using config:", config);

        // Short delay before redirect
        await new Promise(resolve => setTimeout(resolve, 500));

        const isEC2 =
          window.location.hostname.includes("ec2") ||
          window.location.hostname.includes("amazonaws.com");

        if (isEC2) {
          console.log("🖥️ Running on EC2, redirecting to store");
          window.location.href = getStoreUrl(referralCode);
          return;
        }

        const cleanup = handleIOSRedirect(config);
        return cleanup;
      }
      
      // If copy failed, the button will be shown
      // Don't redirect automatically
      
    } catch (error) {
      console.error("❌ Error during redirect:", error);
      setShowCopyButton(true);
    }
  };

  useEffect(() => {
    const initializeRedirect = async () => {
      try {
        const userAgent = navigator.userAgent || navigator.vendor || "";
        const platform = getPlatformFromUserAgent(userAgent);
        console.log("📱 Platform:", platform, "User Agent:", userAgent);
        
        const code = getReferralCode();
        setReferralCode(code);
        
        if (platform === 'ios') {
          await handleRedirect(platform, code);
        } else {
          window.location.href = getStoreUrl(code);
        }
      } catch (error) {
        console.error("❌ Critical error:", error);
        setShowCopyButton(true);
      }
    };

    initializeRedirect();
  }, [location]);

  const storeUrl = getStoreUrl(referralCode);

  return (
    <div style={{ textAlign: "center", paddingTop: "100px" }}>
      <Title>Redirecting you to the App Store...</Title>
      {showCopyButton ? (
        <div style={{ marginTop: "20px" }}>
          <Button
            size="lg"
            onClick={handleManualCopy}
            style={{ marginBottom: "20px" }}
          >
            Copy Code & Continue to App Store
          </Button>
          <br />
          <Title size="sm" style={{ marginTop: 16 }}>
            Or <a href={storeUrl}>continue without copying</a>
          </Title>
        </div>
      ) : (
        <Title size="sm" style={{ marginTop: 16 }}>
          If not redirected, <a href={storeUrl}>click here</a>
        </Title>
      )}
    </div>
  );
};

export default RedirectToAppStore; 