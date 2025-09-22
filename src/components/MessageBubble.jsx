import { useState, useEffect } from 'react';
import { formatTimestamp } from '../utils/timestamp';

const MessageBubble = ({ message, isStreaming = false }) => {
  const [displayedContent, setDisplayedContent] = useState('');

  useEffect(() => {
    if (isStreaming && message.sender === 'ai') {
      setDisplayedContent(message.content || '');
    } else {
      setDisplayedContent(message.content || '');
    }
  }, [message.content, isStreaming, message.sender]);

  // Simple formatting for line breaks
  const formatContent = (content) => {
    return content.split('\n').map((line, index) => (
      <div key={index} className="mb-2 last:mb-0">
        {line}
      </div>
    ));
  };

  return (
    <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} max-w-full w-full`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${message.sender === 'user' ? 'ml-3' : 'mr-3'}`}>
          <div className={`w-6 h-6 rounded-sm flex items-center justify-center ${
            message.sender === 'user' 
              ? 'bg-black text-white' 
              : 'bg-green-500 text-white'
          }`}>
            {message.sender === 'user' ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 9V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
              </svg>
            )}
          </div>
        </div>
        
        {/* Message Content */}
        <div className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'} flex-1 min-w-0`}>
          <div className="flex items-center mb-1">
            <span className="text-xs font-semibold text-gray-700">
              {message.sender === 'user' ? 'You' : 'IslamicAI'}
            </span>
          </div>
          
          <div className={`rounded-lg px-3 py-2 max-w-full break-words ${
            message.sender === 'user'
              ? 'bg-gray-100 text-gray-800'
              : 'bg-white text-gray-800 border border-gray-200'
          }`}>
            <div className="whitespace-pre-wrap leading-relaxed text-sm">
              {isStreaming && message.sender === 'ai' && (!message.content || message.content === "") ? (
                <div className="flex items-center">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </div>
              ) : (
                <>
                  {formatContent(displayedContent)}
                  {isStreaming && message.sender === 'ai' && (
                    <span className="ml-1 animate-pulse">▌</span>
                  )}
                </>
              )}
            </div>
          </div>
          
          <div className="mt-1 text-xs text-gray-500">
            {formatTimestamp(message.timestamp)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;