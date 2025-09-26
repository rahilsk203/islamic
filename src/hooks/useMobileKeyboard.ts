import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to detect when the virtual keyboard is open on mobile devices.
 * Returns true when the keyboard is likely open, false otherwise.
 */
export const useMobileKeyboard = () => {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [initialViewportHeight, setInitialViewportHeight] = useState(0);
  const [previousHeight, setPreviousHeight] = useState(0);
  const [hasFocus, setHasFocus] = useState(false);

  const handleViewportChange = useCallback(() => {
    if (!window.visualViewport) return;
    
    // Get current viewport dimensions
    const currentHeight = window.visualViewport.height;
    const currentWidth = window.visualViewport.width;
    
    // Set initial viewport height if not set
    if (initialViewportHeight === 0) {
      setInitialViewportHeight(currentHeight);
    }
    
    // Calculate if keyboard is likely open
    // Keyboard is considered open if viewport height is significantly smaller
    const heightDifference = initialViewportHeight - currentHeight;
    // Use 20% of initial height as threshold for keyboard detection (more sensitive)
    const keyboardThreshold = initialViewportHeight * 0.20;
    
    // Additional check: if height changed significantly and width stayed the same, 
    // it's likely the keyboard opening/closing
    const widthChanged = Math.abs(currentWidth - (window.visualViewport?.width || currentWidth)) > 10;
    
    // Only update if there's a significant height change and width hasn't changed much
    if (!widthChanged && Math.abs(currentHeight - previousHeight) > 10) {
      const keyboardState = heightDifference > keyboardThreshold;
      setIsKeyboardOpen(keyboardState);
      setPreviousHeight(currentHeight);
    }
    
    // If there's a large increase in height and we had focus, keyboard likely closed
    if (hasFocus && (currentHeight - previousHeight) > 100) {
      setIsKeyboardOpen(false);
      setPreviousHeight(currentHeight);
    }
  }, [initialViewportHeight, previousHeight, hasFocus]);

  // Fallback method using focus/blur events
  const handleInputFocus = useCallback(() => {
    setHasFocus(true);
    // When an input is focused, keyboard is likely open
    setIsKeyboardOpen(true);
  }, []);

  const handleInputBlur = useCallback(() => {
    setHasFocus(false);
    // When an input is blurred, keyboard is likely closed
    // But we need to be careful as blur can happen for other reasons
    setTimeout(() => {
      // Only set to false if viewport hasn't changed significantly
      if (window.visualViewport) {
        const currentHeight = window.visualViewport.height;
        const heightDifference = Math.abs(currentHeight - previousHeight);
        if (heightDifference < 50) { // Less than 50px difference
          setIsKeyboardOpen(false);
        }
      }
    }, 300); // Small delay to allow for viewport updates
  }, [previousHeight]);

  // Handle back button press (Android) or other navigation events
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      // Page is hidden, keyboard likely closed
      setIsKeyboardOpen(false);
      setHasFocus(false);
    }
  }, []);

  // Handle page blur/focus events
  const handlePageBlur = useCallback(() => {
    // When page loses focus, keyboard likely closed
    setIsKeyboardOpen(false);
    setHasFocus(false);
  }, []);

  const handlePageFocus = useCallback(() => {
    // When page regains focus, check if input still has focus
    setTimeout(() => {
      if (document.activeElement && 
          (document.activeElement.tagName === 'INPUT' || 
           document.activeElement.tagName === 'TEXTAREA')) {
        setHasFocus(true);
        // Don't automatically set keyboard open here as it might not be
      } else {
        setIsKeyboardOpen(false);
        setHasFocus(false);
      }
    }, 100);
  }, []);

  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined' || !window.visualViewport) {
      return;
    }

    // Set initial viewport height
    const initialHeight = window.visualViewport.height;
    setInitialViewportHeight(initialHeight);
    setPreviousHeight(initialHeight);

    // Listen to visual viewport changes (mobile keyboard events)
    window.visualViewport.addEventListener('resize', handleViewportChange);
    
    // Also check on orientation change
    const handleOrientationChange = () => {
      // Reset initial height after orientation change
      setTimeout(() => {
        if (window.visualViewport) {
          setInitialViewportHeight(window.visualViewport.height);
          setPreviousHeight(window.visualViewport.height);
          // Reset keyboard state after orientation change
          setIsKeyboardOpen(false);
          setHasFocus(false);
        }
      }, 500); // Longer delay to ensure orientation change is complete
    };
    
    window.addEventListener('orientationchange', handleOrientationChange);
    
    // Fallback method: listen to focus/blur events on input elements
    document.addEventListener('focusin', handleInputFocus);
    document.addEventListener('focusout', handleInputBlur);
    
    // Handle visibility change (back button, app switch, etc.)
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Handle page blur/focus events
    window.addEventListener('blur', handlePageBlur);
    window.addEventListener('focus', handlePageFocus);
    
    // Cleanup listener on unmount
    return () => {
      window.visualViewport?.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
      document.removeEventListener('focusin', handleInputFocus);
      document.removeEventListener('focusout', handleInputBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handlePageBlur);
      window.removeEventListener('focus', handlePageFocus);
    };
  }, [
    handleViewportChange, 
    handleInputFocus, 
    handleInputBlur, 
    handleVisibilityChange,
    handlePageBlur,
    handlePageFocus
  ]);

  return { isKeyboardOpen, initialViewportHeight };
};

export default useMobileKeyboard;