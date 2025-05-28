import { Title, Text, Button, Container, Space } from "@mantine/core";
import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  DEFAULT_IOS_URL,
  IOS_DEEP_LINKS,
  getPlatformFromUserAgent,
} from "./DeepLinkHandler";

const RedirectToAppStore = () => {
  const location = useLocation();
  const [referralCode, setReferralCode] = useState("");
  const [copied, setCopied] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const getReferralCode = () => {
    const queryParams = new URLSearchParams(location.search);
    const queryReferral = queryParams.get("ref");
    return queryReferral || "default";
  };

  const getStoreUrl = (referralCode: string) => {
    const link = IOS_DEEP_LINKS.find(
      (link) => link.referralCode === referralCode
    );
    return link?.url || DEFAULT_IOS_URL;
  };

  const copyToClipboard = async (text: string) => {
    try {
      // Try using the Clipboard API
      await navigator.clipboard.writeText(text);
      console.log('Copied using Clipboard API');
      return true;
    } catch (err) {
      console.error('Clipboard API failed:', err);
      
      try {
        // Fallback to execCommand
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.cssText = 'position:fixed;left:0;top:0;opacity:0;';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        
        if (success) {
          console.log('Copied using execCommand');
          return true;
        }
      } catch (err) {
        console.error('execCommand failed:', err);
      }
    }
    return false;
  };

  const handleCopyClick = async () => {
    const success = await copyToClipboard(referralCode);
    if (success) {
      setCopied(true);
      // Redirect after successful copy
      setTimeout(() => {
        window.location.href = getStoreUrl(referralCode);
      }, 500);
    }
  };

  const triggerAutomaticCopy = () => {
    if (buttonRef.current) {
      const button = buttonRef.current;
      
      // Make button briefly visible
      button.style.opacity = '1';
      button.style.pointerEvents = 'auto';
      button.style.position = 'fixed';
      button.style.top = '50%';
      button.style.left = '50%';
      button.style.transform = 'translate(-50%, -50%)';
      button.style.zIndex = '999999';
      
      // Focus and click
      button.focus();
      button.click();
      
      // Hide after a short delay
      setTimeout(() => {
        button.style.opacity = '0';
        button.style.pointerEvents = 'none';
      }, 100);
    }
  };

  useEffect(() => {
    const code = getReferralCode();
    setReferralCode(code);
    
    const userAgent = navigator.userAgent || navigator.vendor || "";
    const platform = getPlatformFromUserAgent(userAgent);
    
    if (platform === 'ios') {
      // Try multiple times with increasing delays
      setTimeout(triggerAutomaticCopy, 300);
      setTimeout(triggerAutomaticCopy, 800);
      setTimeout(triggerAutomaticCopy, 1300);
    } else {
      window.location.href = getStoreUrl(code);
    }
  }, [location]);

  const storeUrl = getStoreUrl(referralCode);

  return (
    <Container size="sm" style={{ padding: "20px", marginTop: "50px" }}>
      <div style={{ textAlign: "center" }}>
        <Title>Redirecting to App Store...</Title>
        
        <Space h="xl" />
        
        <Text size="lg" style={{ maxWidth: "400px", margin: "0 auto" }}>
          {copied ? "Code copied! Redirecting..." : "Copying referral code..."}
        </Text>

        <Space h="xl" />

        {/* Hidden button for automatic copy */}
        <button
          ref={buttonRef}
          onClick={handleCopyClick}
          style={{
            opacity: 0,
            pointerEvents: 'none',
            position: 'fixed',
            padding: '20px 40px',
            fontSize: '16px',
            border: 'none',
            background: '#228be6',
            color: 'white',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Copy Code
        </button>

        <Button
          size="lg"
          fullWidth
          style={{ maxWidth: "300px" }}
          onClick={() => window.location.href = storeUrl}
        >
          Continue to App Store
        </Button>

        <Space h="md" />

        <Text size="sm" color="dimmed">
          If not redirected automatically, tap the button above
        </Text>
      </div>
    </Container>
  );
};

export default RedirectToAppStore; 