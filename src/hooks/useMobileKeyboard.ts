import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to detect when the virtual keyboard is open on mobile devices.
 * Returns true when the keyboard is likely open, false otherwise.
 */
export const useMobileKeyboard = () => {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [initialViewportHeight, setInitialViewportHeight] = useState(0);

  const handleViewportChange = useCallback(() => {
    if (!window.visualViewport) return;
    
    // Calculate if keyboard is likely open
    // Keyboard is considered open if viewport height is significantly smaller
    const currentHeight = window.visualViewport.height;
    const heightDifference = initialViewportHeight - currentHeight;
    // Use 25% of initial height as threshold for keyboard detection
    const keyboardThreshold = initialViewportHeight * 0.25;
    
    setIsKeyboardOpen(heightDifference > keyboardThreshold);
  }, [initialViewportHeight]);

  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined' || !window.visualViewport) {
      return;
    }

    // Set initial viewport height
    const initialHeight = window.visualViewport.height;
    setInitialViewportHeight(initialHeight);

    // Listen to visual viewport changes (mobile keyboard events)
    window.visualViewport.addEventListener('resize', handleViewportChange);
    
    // Also check on orientation change
    window.addEventListener('orientationchange', handleViewportChange);
    
    // Cleanup listener on unmount
    return () => {
      window.visualViewport?.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('orientationchange', handleViewportChange);
    };
  }, [handleViewportChange]);

  return { isKeyboardOpen, initialViewportHeight };
};

export default useMobileKeyboard;