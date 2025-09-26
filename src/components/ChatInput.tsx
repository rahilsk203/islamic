import { useEffect, useRef, useState } from 'react';
import { SendIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useMobileKeyboard } from '@/hooks';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  value?: string;
  onChangeValue?: (value: string) => void;
  autoFocus?: boolean;
}

const ChatInput = ({ onSendMessage, value, onChangeValue, autoFocus }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const { isKeyboardOpen, initialViewportHeight } = useMobileKeyboard();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const wasKeyboardOpenRef = useRef(false);

  // Check if device is mobile
  const isMobile = () => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  const autoresizeTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;
    
    // Reset height to get accurate scrollHeight
    el.style.height = 'auto';
    
    // Calculate max height based on viewport - only apply mobile-specific limits on mobile
    const maxHeight = isMobile() && isKeyboardOpen 
      ? Math.min(150, window.innerHeight * 0.3) 
      : isMobile()
      ? Math.min(150, window.innerHeight * 0.2)
      : 150; // Fixed max height for desktop
    
    // Set height based on content
    const newHeight = Math.min(el.scrollHeight, maxHeight);
    el.style.height = `${newHeight}px`;
    el.style.overflow = newHeight >= maxHeight ? 'auto' : 'hidden';
  };

  // Keep internal state in sync when controlled
  useEffect(() => {
    if (value !== undefined) {
      setMessage(value);
    }
  }, [value]);

  useEffect(() => {
    autoresizeTextarea();
  }, []);

  useEffect(() => {
    autoresizeTextarea();
  }, [message, isKeyboardOpen]);

  // Additional effect to handle mobile keyboard changes
  useEffect(() => {
    // Only apply on mobile devices
    if (!isMobile()) return;
    
    // Detect keyboard state changes
    if (wasKeyboardOpenRef.current !== isKeyboardOpen) {
      wasKeyboardOpenRef.current = isKeyboardOpen;
      
      if (isKeyboardOpen && containerRef.current) {
        // Scroll to input when keyboard opens to ensure it's visible
        setTimeout(() => {
          containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
      
      // Force re-render by updating state if needed
      if (textareaRef.current) {
        // Trigger a small re-render to ensure UI updates
        textareaRef.current.style.transition = 'all 0.1s ease';
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.style.transition = '';
          }
        }, 100);
      }
    }
  }, [isKeyboardOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage(''); // Always clear the input after sending
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`border-t border-border bg-chat-bg transition-all duration-300 ${
        isMobile() && isKeyboardOpen ? 'fixed inset-x-0 bottom-0 pb-2 safe-bottom-padding keyboard-visible' : ''
      }`}
    >
      <div className={`max-w-4xl mx-auto p-4 ${isMobile() && isKeyboardOpen ? 'pb-2' : ''}`}>
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-end gap-3 bg-white border border-gray-300 rounded-2xl p-1 shadow-sm focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500 transition-all">
            <Textarea
              ref={textareaRef as any}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                onChangeValue?.(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask about Islam, Quran, etc..."
              className="flex-1 min-h-[40px] max-h-[150px] resize-none border-none bg-transparent p-3 text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 mobile-transition"
              rows={1}
              autoFocus={autoFocus}
            />
            
            <Button
              type="submit"
              size="icon"
              disabled={!message.trim()}
              className="h-10 w-10 m-1 bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:hover:bg-green-600 rounded-full transition-colors flex-shrink-0"
            >
              <SendIcon className="w-5 h-5" />
            </Button>
          </div>
        </form>
        
        {!isKeyboardOpen && (
          <div className="text-xs text-center text-muted-foreground mt-3">
            IslamicAI can make mistakes. Verify important information.{' '}
            <button className="underline hover:no-underline">
              See Usage Guidelines
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInput;