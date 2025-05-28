export const copyToIOSClipboard = async (text: string): Promise<boolean> => {
  try {
    // Check if the device is iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    if (isIOS) {
      await navigator.clipboard.writeText(text);
      console.log('📋 Successfully copied to iOS clipboard:', text);
      return true;
    }
    
    console.log('📱 Not an iOS device, skipping clipboard operation');
    return false;
  } catch (error) {
    console.error('❌ Error copying to clipboard:', error);
    return false;
  }
}; 