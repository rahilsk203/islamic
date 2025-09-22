import { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';

const ChatInterface = ({ messages, onSendMessage, isLoading, currentSessionId, isNewsSearching: propsNewsSearching, newsSearchProgress: propsSearchProgress, newsSearchType: propsSearchType }) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      if (value.trim().length === 0) {
        textareaRef.current.style.height = '24px';
        textareaRef.current.style.whiteSpace = 'nowrap';
        textareaRef.current.style.overflow = 'hidden';
      } else {
        textareaRef.current.style.whiteSpace = 'normal';
        textareaRef.current.style.overflow = 'hidden';
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async () => {
    // Validate input and check if loading
    if (!inputValue || typeof inputValue !== 'string' || isLoading) {
      return;
    }

    const trimmedValue = inputValue.trim();
    if (!trimmedValue) {
      return;
    }

    // Clear input and reset textarea height
    setInputValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = '24px';
      textareaRef.current.style.whiteSpace = 'nowrap';
      textareaRef.current.style.overflow = 'hidden';
    }

    // Add user message
    onSendMessage(trimmedValue, 'user');
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* News Search Indicator */}
      {propsNewsSearching && (
        <div className="bg-gray-100 border-b border-gray-200 p-3">
          <div className="max-w-4xl mx-auto flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            <span className="text-sm text-gray-600">
              Searching {propsSearchType === 'internet' ? 'internet' : 'news'}...
            </span>
            <div className="ml-2 w-20 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 rounded-full transition-all duration-300"
                style={{ width: `${propsSearchProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
      
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto relative">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {messages.map((message, index) => (
            <div key={message.id} className="mb-6">
              <MessageBubble 
                message={message} 
                isStreaming={message.isStreaming || (message.sender === 'ai' && isLoading && messages[messages.length - 1].id === message.id)}
                isNewsSearching={propsNewsSearching}
              />
            </div>
          ))}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - ChatGPT Style */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto p-4">
          <div className="relative flex items-end space-x-3">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Message IslamicAI..."
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-0 focus:outline-none resize-none transition-all duration-200 text-gray-900 placeholder-gray-500 text-base max-h-32"
                rows="1"
                disabled={isLoading}
                maxLength={2000}
                style={{ minHeight: '56px' }}
              />
            </div>
            
            <button
              onClick={handleSend}
              disabled={!inputValue?.trim() || isLoading}
              className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ${
                inputValue?.trim() && !isLoading
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          </div>
          
          <div className="mt-3 text-center text-xs text-gray-500">
            IslamicAI can make mistakes. Consider checking important information.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;