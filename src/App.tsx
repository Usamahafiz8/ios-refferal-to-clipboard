import { useEffect, useState } from 'react';
import { Container, Title, Text, Button, LoadingOverlay } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useSearchParams } from 'react-router-dom';

const DEFAULT_APP_STORE_URL = 'https://apps.apple.com/us/app/baby-einstein-music-time/id1640670576';

const App = () => {
  const [searchParams] = useSearchParams();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  
  const copyAndRedirect = async () => {
    const referralCode = searchParams.get('ref') || 'default';
    
    try {
      setLoading(true);
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
        
        // Set redirecting state before redirect
        setRedirecting(true);
        
        // Redirect after a short delay
        setTimeout(() => {
          window.location.href = DEFAULT_APP_STORE_URL;
        }, 1500);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Show content immediately
    setLoading(false);
    
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (!isIOS) {
      setRedirecting(true);
      setTimeout(() => {
        window.location.href = DEFAULT_APP_STORE_URL;
      }, 500);
      return;
    }

    // Try to copy automatically on mount with delays
    const timeouts = [
      setTimeout(() => {
        if (!copied && !redirecting) copyAndRedirect();
      }, 800),
      setTimeout(() => {
        if (!copied && !redirecting) copyAndRedirect();
      }, 1600),
      setTimeout(() => {
        if (!copied && !redirecting) copyAndRedirect();
      }, 2400)
    ];

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, []);

  const referralCode = searchParams.get('ref') || 'default';

  return (
    <Container size="sm" style={{ 
      padding: 20, 
      marginTop: 50, 
      textAlign: 'center',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      background: '#fff'
    }}>
      <LoadingOverlay visible={loading} overlayProps={{ blur: 2 }} />
      
      <Title order={1} style={{ marginBottom: 30, color: '#1a1b1e' }}>
        {redirecting ? 'Redirecting...' : (copied ? 'Code Copied!' : 'Copy Referral Code')}
      </Title>
      
      <Text size="xl" style={{ 
        marginBottom: 30, 
        padding: 20, 
        background: '#f8f9fa', 
        borderRadius: 8,
        border: '1px solid #e9ecef',
        fontWeight: 500
      }}>
        {referralCode}
      </Text>
      
      <Button
        size="lg"
        fullWidth
        loading={loading}
        style={{ 
          maxWidth: 300, 
          margin: '0 auto',
          height: 50,
          fontSize: 16
        }}
        onClick={copyAndRedirect}
      >
        {redirecting ? 'Opening App Store...' : (copied ? 'Continue to App Store' : 'Copy Code & Continue')}
      </Button>
      
      <Text size="sm" color="dimmed" style={{ marginTop: 20 }}>
        {redirecting 
          ? 'Opening the App Store...' 
          : (copied 
            ? 'Your code is copied and ready to use' 
            : 'Tap the button to copy your referral code')}
      </Text>
    </Container>
  );
};

export default App;
