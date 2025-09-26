import { 
  CopyIcon, 
  DownloadIcon, 
  RefreshCwIcon, 
  BookOpenIcon,
  UserIcon,
  PencilIcon,
  XIcon,
  SendIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { memo, useCallback, useState, useEffect, useRef } from 'react';
import MarkdownMessage from '@/components/MarkdownMessage';

interface ChatMessageProps {
  message: string;
  isUser?: boolean;
  onRegenerate?: () => void;
  onEditUser?: () => void;
  onCancelEdit?: () => void;
  onSaveEdit?: (newMessage: string) => void;
  isEditing?: boolean;
}

const ChatMessageBase = ({ message, isUser = false, onRegenerate, onEditUser, onCancelEdit, onSaveEdit, isEditing }: ChatMessageProps) => {
  const [editText, setEditText] = useState(message);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  // Auto-resize textarea when editing
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      const el = textareaRef.current;
      // Reset height to get accurate scrollHeight
      el.style.height = 'auto';
      
      // Calculate max height (30% of viewport height or 150px, whichever is smaller)
      const maxHeight = Math.min(150, window.innerHeight * 0.3);
      
      // Set height based on content
      const newHeight = Math.min(el.scrollHeight, maxHeight);
      el.style.height = `${newHeight}px`;
      el.style.overflow = newHeight >= maxHeight ? 'auto' : 'hidden';
    }
  }, [editText, isEditing]);

  // Reset edit text when message changes or editing is canceled
  useEffect(() => {
    if (!isEditing) {
      setEditText(message);
    }
  }, [message, isEditing]);

  const handleSaveEdit = () => {
    if (editText.trim() && onSaveEdit) {
      onSaveEdit(editText.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    }
  };

  return (
    <div className={`group ${isUser ? 'flex justify-end' : 'flex justify-start'}`}>
      <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : ''} ${isUser ? 'w-auto' : 'max-w-[85%] w-full'}`}>
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
        
        {/* Message Content */}
        <div className={isUser ? 'flex-shrink' : 'flex-1'}>
          {isEditing && isUser ? (
            // Edit mode for user messages
            <div className="message-user inline-block w-full max-w-full">
              <div className="flex flex-col gap-2 bg-transparent">
                <Textarea
                  ref={textareaRef}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Edit your message..."
                  className="min-h-[40px] max-h-[150px] resize-none border-none bg-transparent p-2 text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 w-full"
                  autoFocus
                />
                <div className="flex gap-1 justify-end">
                  <Button
                    onClick={onCancelEdit}
                    size="sm"
                    variant="ghost"
                    className="h-8 px-3 hover:bg-gray-200 text-gray-500 hover:text-gray-700"
                  >
                    <XIcon className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveEdit}
                    size="sm"
                    disabled={!editText.trim()}
                    className="h-8 px-3 bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:hover:bg-green-600 rounded-full"
                  >
                    <SendIcon className="w-4 h-4 mr-1" />
                    Send
                  </Button>
                </div>
              </div>
            </div>
          ) : isUser ? (
            // Display mode for user messages
            <div className="message-user inline-block max-w-full">
              <div className="whitespace-pre-wrap leading-relaxed break-words">{message}</div>
            </div>
          ) : (
            // Display mode for bot messages
            <div className="max-w-full">
              <MarkdownMessage text={message} />
            </div>
          )}
          
          {/* Action Buttons */}
          {!isEditing && (
            <div className={`flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity ${isUser ? 'justify-end' : 'justify-start'}`}>
              {!isUser ? (
                <>
                  <Button onClick={handleCopy} variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100 text-gray-500 hover:text-gray-700">
                    <CopyIcon className="w-4 h-4" />
                  </Button>
                  <Button onClick={handleDownload} variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100 text-gray-500 hover:text-gray-700">
                    <DownloadIcon className="w-4 h-4" />
                  </Button>
                  <Button onClick={onRegenerate} variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100 text-gray-500 hover:text-gray-700">
                    <RefreshCwIcon className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <Button onClick={onEditUser} variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100 text-gray-500 hover:text-gray-700">
                  <PencilIcon className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const areEqual = (prev: ChatMessageProps, next: ChatMessageProps) => {
  return prev.isUser === next.isUser && 
         prev.message === next.message && 
         prev.isEditing === next.isEditing;
};

const ChatMessage = memo(ChatMessageBase, areEqual);

export default ChatMessage;