import { notifications } from '@mantine/notifications';

export const copyToIOSClipboard = async (text: string): Promise<boolean> => {
  try {
    // Check if the device is iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    if (isIOS) {
      // Try multiple clipboard methods
      try {
        // Method 1: Modern Clipboard API
        await navigator.clipboard.writeText(text);
      } catch (e) {
        // Method 2: Create temporary textarea
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          // Execute copy command
          document.execCommand('copy');
          textArea.remove();
        } catch (err) {
          textArea.remove();
          throw new Error('Failed to copy');
        }
      }

      console.log('📋 Successfully copied to iOS clipboard:', text);
      
      // Show success notification
      notifications.show({
        title: 'Copied to Clipboard!',
        message: `Referral code "${text}" has been copied to your clipboard`,
        color: 'green',
        autoClose: 3000,
      });
      
      return true;
    }
    
    console.log('📱 Not an iOS device, skipping clipboard operation');
    return false;
  } catch (error) {
    console.error('❌ Error copying to clipboard:', error);
    
    // Show error notification
    notifications.show({
      title: 'Failed to Copy',
      message: 'Could not copy the referral code to clipboard. Please try again.',
      color: 'red',
      autoClose: 3000,
    });
    
    return false;
  }
}; 