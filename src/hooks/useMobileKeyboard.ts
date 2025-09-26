import { useState, useEffect } from 'react';

/**
 * Custom hook to detect when the virtual keyboard is open on mobile devices.
 * Returns true when the keyboard is likely open, false otherwise.
 */
export const useMobileKeyboard = () => {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [initialViewportHeight, setInitialViewportHeight] = useState(0);

  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined' || !window.visualViewport) {
      return;
    }

    // Set initial viewport height
    const initialHeight = window.visualViewport.height;
    setInitialViewportHeight(initialHeight);

    const handleViewportChange = () => {
      if (!window.visualViewport) return;
      
      // Calculate if keyboard is likely open
      // Keyboard is considered open if viewport height is significantly smaller
      const currentHeight = window.visualViewport.height;
      const heightDifference = initialHeight - currentHeight;
      // Use 25% of initial height as threshold for keyboard detection
      const keyboardThreshold = initialHeight * 0.25;
      
      setIsKeyboardOpen(heightDifference > keyboardThreshold);
    };

    // Listen to visual viewport changes (mobile keyboard events)
    window.visualViewport.addEventListener('resize', handleViewportChange);
    
    // Cleanup listener on unmount
    return () => {
      window.visualViewport?.removeEventListener('resize', handleViewportChange);
    };
  }, []);

  return { isKeyboardOpen, initialViewportHeight };
};

export default useMobileKeyboard;