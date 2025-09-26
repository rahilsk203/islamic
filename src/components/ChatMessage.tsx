import { 
  CopyIcon, 
  DownloadIcon, 
  RefreshCwIcon, 
  BookOpenIcon,
  UserIcon,
  PencilIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { memo, useCallback } from 'react';
import MarkdownMessage from '@/components/MarkdownMessage';

interface ChatMessageProps {
  message: string;
  isUser?: boolean;
  onRegenerate?: () => void;
  onEditUser?: () => void;
}

const ChatMessageBase = ({ message, isUser = false, onRegenerate, onEditUser }: ChatMessageProps) => {
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message);
    } catch {}
  }, [message]);

  const handleDownload = useCallback(() => {
    try {
      const blob = new Blob([message], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'chat.txt';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {}
  }, [message]);

  return (
    <div className={`group ${isUser ? 'ml-auto' : ''}`}>
      <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          isUser 
            ? 'bg-blue-100 text-blue-600' 
            : 'bg-green-600 text-white'
        }`}>
          {isUser ? (
            <UserIcon className="w-5 h-5" />
          ) : (
            <BookOpenIcon className="w-5 h-5" />
          )}
        </div>
        
        {/* Message Content (minimal, ChatGPT-like: no background bubbles) */}
        <div className="flex-1 max-w-[85%]">
          <div className={isUser ? 'text-gray-900' : 'text-gray-900'}>
            {isUser ? (
              <div className="whitespace-pre-wrap leading-relaxed">{message}</div>
            ) : (
              <MarkdownMessage text={message} />
            )}
          </div>
          
          {/* Action Buttons */}
          {!isUser ? (
            <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button onClick={handleCopy} variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100 text-gray-500 hover:text-gray-700">
                <CopyIcon className="w-4 h-4" />
              </Button>
              <Button onClick={handleDownload} variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100 text-gray-500 hover:text-gray-700">
                <DownloadIcon className="w-4 h-4" />
              </Button>
              <Button onClick={onRegenerate} variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100 text-gray-500 hover:text-gray-700">
                <RefreshCwIcon className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button onClick={onEditUser} variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100 text-gray-500 hover:text-gray-700">
                <PencilIcon className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const areEqual = (prev: ChatMessageProps, next: ChatMessageProps) => {
  return prev.isUser === next.isUser && prev.message === next.message;
};

const ChatMessage = memo(ChatMessageBase, areEqual);

export default ChatMessage;