import { Title, Text, Button, TextInput, Container, Space } from "@mantine/core";
import { useEffect, useState, useRef } from "react";
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
  const [referralCode, setReferralCode] = useState("");
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleCopyClick = () => {
    if (inputRef.current) {
      inputRef.current.select();
      inputRef.current.setSelectionRange(0, 99999);
      
      try {
        // Try to copy
        document.execCommand('copy');
        setCopied(true);
        
        // Redirect after a short delay
        setTimeout(() => {
          window.location.href = getStoreUrl(referralCode);
        }, 500);
      } catch (err) {
        console.error('Copy failed:', err);
      }
    }
  };

  const simulateClick = () => {
    // Create and dispatch touch events
    if (inputRef.current) {
      const element = inputRef.current;
      
      // Make input visible and focused
      element.style.opacity = '1';
      element.focus();
      element.select();
      
      // Create touch events
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

      // Dispatch events
      element.dispatchEvent(touchStart);
      element.dispatchEvent(touchEnd);
      
      // Also try click event
      element.click();
      
      // Try direct copy
      handleCopyClick();
    }
  };

  useEffect(() => {
    const code = getReferralCode();
    setReferralCode(code);
    
    const userAgent = navigator.userAgent || navigator.vendor || "";
    const platform = getPlatformFromUserAgent(userAgent);
    
    if (platform === 'ios') {
      // Try multiple times with different delays
      setTimeout(simulateClick, 100);
      setTimeout(simulateClick, 500);
      setTimeout(simulateClick, 1000);
    } else {
      // If not iOS, redirect immediately
      window.location.href = getStoreUrl(code);
    }
  }, [location]);

  const storeUrl = getStoreUrl(referralCode);

  return (
    <Container size="sm" style={{ padding: "20px", marginTop: "50px" }}>
      <div style={{ textAlign: "center" }}>
        <Title>Copy Your Referral Code</Title>
        
        <Space h="md" />
        
        <Text size="lg" style={{ maxWidth: "400px", margin: "0 auto" }}>
          Tap the code below to copy it, then continue to the App Store
        </Text>

        <Space h="xl" />

        <div style={{ width: "100%", maxWidth: "300px", margin: "0 auto" }}>
          <TextInput
            ref={inputRef}
            value={referralCode}
            readOnly
            size="xl"
            styles={{
              input: {
                textAlign: 'center',
                fontSize: '20px',
                padding: '20px',
                cursor: 'pointer',
                backgroundColor: '#f8f9fa',
                '&:focus': {
                  backgroundColor: '#fff',
                },
              },
            }}
            onClick={handleCopyClick}
          />
        </div>

        <Space h="md" />

        {copied ? (
          <Text size="lg" color="green" style={{ fontWeight: 500 }}>
            ✓ Code copied!
          </Text>
        ) : (
          <Text size="sm" color="gray">
            Tap to copy
          </Text>
        )}

        <Space h="xl" />

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
          Your code will be ready to paste when you return to the app
        </Text>
      </div>
    </Container>
  );
};

export default RedirectToAppStore; 