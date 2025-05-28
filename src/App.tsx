import { useEffect, useState } from 'react';
import { MantineProvider, Container, Title, Text, Button } from '@mantine/core';
import { Notifications, notifications } from '@mantine/notifications';
import { useSearchParams } from 'react-router-dom';

const DEFAULT_APP_STORE_URL = 'https://apps.apple.com/us/app/baby-einstein-music-time/id1640670576';

const App = () => {
  const [searchParams] = useSearchParams();
  const [copied, setCopied] = useState(false);
  
  const copyAndRedirect = async () => {
    const referralCode = searchParams.get('ref') || 'default';
    
    try {
      // Try multiple copy methods
      let copySuccess = false;
      
      // Method 1: Clipboard API
      try {
        await navigator.clipboard.writeText(referralCode);
        copySuccess = true;
      } catch (err) {
        console.log('Clipboard API failed:', err);
      }
      
      // Method 2: execCommand with textarea
      if (!copySuccess) {
        const textarea = document.createElement('textarea');
        textarea.value = referralCode;
        textarea.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);opacity:1;z-index:999999;font-size:16px;padding:20px;width:200px;text-align:center;';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        
        try {
          copySuccess = document.execCommand('copy');
          if (copySuccess) {
            console.log('Copied with execCommand');
          }
        } catch (err) {
          console.log('execCommand failed:', err);
        }
        
        document.body.removeChild(textarea);
      }
      
      if (copySuccess) {
        setCopied(true);
        notifications.show({
          title: 'Success!',
          message: 'Referral code copied to clipboard',
          color: 'green',
        });
        
        // Redirect after a short delay
        setTimeout(() => {
          window.location.href = DEFAULT_APP_STORE_URL;
        }, 1000);
      } else {
        notifications.show({
          title: 'Manual Copy Required',
          message: 'Please tap the button to copy the code',
          color: 'yellow',
        });
      }
    } catch (error) {
      console.error('Copy failed:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to copy code. Please try manually.',
        color: 'red',
      });
    }
  };

  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (!isIOS) {
      window.location.href = DEFAULT_APP_STORE_URL;
      return;
    }

    // Try to copy automatically on mount
    const timeouts = [
      setTimeout(copyAndRedirect, 500),
      setTimeout(copyAndRedirect, 1000),
      setTimeout(copyAndRedirect, 1500)
    ];

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, []);

  const referralCode = searchParams.get('ref') || 'default';

  return (
    <MantineProvider>
      <Notifications position="top-center" zIndex={1000} />
      <Container size="sm" style={{ padding: 20, marginTop: 50, textAlign: 'center' }}>
        <Title order={1} style={{ marginBottom: 30 }}>
          {copied ? 'Code Copied!' : 'Copy Referral Code'}
        </Title>
        
        <Text size="xl" style={{ marginBottom: 30, padding: 20, background: '#f8f9fa', borderRadius: 8 }}>
          {referralCode}
        </Text>
        
        <Button
          size="lg"
          fullWidth
          style={{ maxWidth: 300, margin: '0 auto' }}
          onClick={copyAndRedirect}
        >
          {copied ? 'Continue to App Store' : 'Copy Code & Continue'}
        </Button>
        
        <Text size="sm" color="dimmed" style={{ marginTop: 20 }}>
          {copied ? 'Redirecting to App Store...' : 'Tap the button to copy your referral code'}
        </Text>
      </Container>
    </MantineProvider>
  );
};

export default App;
