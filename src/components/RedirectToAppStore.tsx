import { Title } from "@mantine/core";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { copyToIOSClipboard } from "../utils/ClipboardHandler";
import { CopyModal } from "./CopyModal";
import {
  DEFAULT_IOS_URL,
  IOS_DEEP_LINKS,
  getPlatformFromUserAgent,
  getDeepLink,
  handleIOSRedirect,
} from "./DeepLinkHandler";

const RedirectToAppStore = () => {
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);

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

  const isSafari = () => {
    const ua = navigator.userAgent.toLowerCase();
    return ua.includes('safari') && !ua.includes('chrome');
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

      // For iOS devices, try to copy the referral code
      if (isSafari()) {
        // Show modal for Safari users
        setShowModal(true);
      } else {
        // Try automatic copy for non-Safari browsers
        await copyToIOSClipboard(referralCode);
      }

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
    <>
      <div style={{ textAlign: "center", paddingTop: "100px" }}>
        <Title>Redirecting you to the App Store...</Title>
        <Title size="sm" style={{ marginTop: 16 }}>
          If not redirected, <a href={storeUrl}>click here</a>
        </Title>
      </div>

      <CopyModal
        opened={showModal}
        onClose={() => setShowModal(false)}
        referralCode={referralCode}
      />
    </>
  );
};

export default RedirectToAppStore; 