/**
 * Utility functions for mobile device detection and optimization
 */

// Check if device is mobile
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Check if device is iOS
export const isIOS = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

// Check if device is Android
export const isAndroid = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Android/.test(navigator.userAgent);
};

// Get mobile OS
export const getMobileOS = (): 'ios' | 'android' | 'other' | null => {
  if (!isMobileDevice()) return null;
  if (isIOS()) return 'ios';
  if (isAndroid()) return 'android';
  return 'other';
};

// Prevent iOS zoom on input focus
export const preventIOSZoom = (): void => {
  if (!isIOS()) return;
  
  const viewport = document.querySelector('meta[name=viewport]');
  if (viewport) {
    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
  }
};

// Restore iOS zoom
export const restoreIOSZoom = (): void => {
  if (!isIOS()) return;
  
  const viewport = document.querySelector('meta[name=viewport]');
  if (viewport) {
    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
  }
};

// Scroll to element with mobile keyboard consideration
export const scrollToElementWithKeyboard = (element: HTMLElement, keyboardOpen: boolean = false): void => {
  if (!element) return;
  
  if (keyboardOpen && isMobileDevice()) {
    // On mobile with keyboard open, scroll element into view with offset
    const rect = element.getBoundingClientRect();
    const offset = 100; // Offset to ensure element is visible above keyboard
    
    if (rect.top < offset) {
      window.scrollBy(0, rect.top - offset);
    }
  } else {
    // Normal scroll behavior
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
};