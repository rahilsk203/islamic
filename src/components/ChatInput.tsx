import { useState } from 'react';
import { SendIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  value?: string;
  onChangeValue?: (value: string) => void;
  autoFocus?: boolean;
}

const ChatInput = ({ onSendMessage, value, onChangeValue, autoFocus }: ChatInputProps) => {
  const [message, setMessage] = useState(value ?? '');

  // Keep internal state in sync when controlled
  if (value !== undefined && value !== message) {
    // Avoid infinite loops by only setting when different
    // eslint-disable-next-line react-hooks/rules-of-hooks
    setMessage(value);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-border bg-chat-bg">
      <div className="max-w-4xl mx-auto p-4">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-end gap-3 bg-white border border-gray-300 rounded-2xl p-1 shadow-sm focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500 transition-all">
            <Textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                onChangeValue?.(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask about Islam, Quran, Hadith, Prayer times, etc..."
              className="flex-1 min-h-[40px] max-h-32 resize-none border-none bg-transparent p-3 text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
              rows={1}
              autoFocus={autoFocus}
            />
            
            <Button
              type="submit"
              size="icon"
              disabled={!message.trim()}
              className="h-10 w-10 m-1 bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:hover:bg-green-600 rounded-full transition-colors"
            >
              <SendIcon className="w-5 h-5" />
            </Button>
          </div>
        </form>
        
        <div className="text-xs text-center text-muted-foreground mt-3">
          IslamicAI can make mistakes. Verify important information.{' '}
          <button className="underline hover:no-underline">
            See Usage Guidelines
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;