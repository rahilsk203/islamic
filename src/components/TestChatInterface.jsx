import React, { useState } from 'react';
import ChatInterface from './ChatInterface';

const TestChatInterface = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      content: "Assalamu Alaikum! 👋\n\nI'm IslamicAI, your Islamic Scholar AI assistant. How can I help you today?",
      timestamp: new Date(),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = (content, sender = 'user') => {
    const newMessage = {
      id: Date.now(),
      sender,
      content: content.trim(),
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Simulate AI response
    if (sender === 'user') {
      setIsLoading(true);
      setTimeout(() => {
        const aiMessage = {
          id: Date.now() + 1,
          sender: 'ai',
          content: "Thank you for your question. This is a simulated response from IslamicAI. In a real implementation, this would connect to your backend API.",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
      }, 1000);
    }
  };

  return (
    <div className="flex h-screen bg-white">
      <div className="flex-1 flex flex-col">
        <ChatInterface 
          messages={messages} 
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          currentSessionId="test-session"
          isNewsSearching={false}
          newsSearchProgress={0}
          newsSearchType="news"
        />
      </div>
    </div>
  );
};

export default TestChatInterface;