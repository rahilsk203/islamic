import { useState, useEffect } from 'react';
import './App.css';
import ChatInterface from './components/ChatInterface';
import Sidebar from './components/Sidebar';
import { sendMessage, sendMessageStreaming } from './utils/api';
import { useChatMemory, useAutoSave, useSessionManager } from './hooks/useChatMemory';

function App() {
  // Use custom hooks for better memory management
  const { recentChats, saveChat, loadChat, refreshChats } = useChatMemory();
  const { currentSessionId, sessionTitle, setSessionTitle, createNewSession, switchToSession } = useSessionManager();
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      content: "Assalamu Alaikum! 👋\n\nI'm IslamicAI, your Islamic Scholar AI assistant. How can I help you today?",
      timestamp: new Date(),
      isStreaming: false
    }
  ]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isNewsSearching, setIsNewsSearching] = useState(false);
  const [newsSearchProgress, setNewsSearchProgress] = useState(0);
  const [newsSearchType, setNewsSearchType] = useState('news');

  // Auto-save functionality
  useAutoSave(currentSessionId, messages, async (sessionId, msgs) => {
    const userMessages = msgs.filter(msg => msg.sender === 'user');
    const aiMessages = msgs.filter(msg => msg.sender === 'ai');
    
    if (userMessages.length > 0 && aiMessages.length > 1) {
      const savedSession = await saveChat(sessionId, msgs);
      if (savedSession) {
        setSessionTitle(savedSession.title);
      }
    }
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const startNewChat = () => {
    const newSessionId = createNewSession();
    
    setMessages([
      {
        id: Date.now(),
        sender: 'ai',
        content: "Assalamu Alaikum! 👋\n\nI'm IslamicAI, your Islamic Scholar AI assistant. How can I help you today?",
        timestamp: new Date(),
        isStreaming: false
      }
    ]);
    
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const loadChatSession = (chatSessionId) => {
    const session = loadChat(chatSessionId);
    if (session) {
      switchToSession(session.id, session.title);
      const updatedMessages = session.messages.map(msg => ({
        ...msg,
        isStreaming: false
      }));
      setMessages(updatedMessages);
      
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    }
  };

  const updateStreamingMessage = (messageId, content, isComplete = false) => {
    setMessages(prev => {
      return prev.map(msg => {
        if (msg.id === messageId) {
          return {
            ...msg,
            content: content,
            isStreaming: !isComplete
          };
        }
        return msg;
      });
    });
  };

  const addMessage = async (content, sender = 'user') => {
    // Validate input
    if (!content || typeof content !== 'string') {
      return;
    }

    const newMessage = {
      id: Date.now(),
      sender,
      content: content.trim(),
      timestamp: new Date(),
      isStreaming: false
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // If it's a user message, get response from backend with streaming
    if (sender === 'user') {
      setIsLoading(true);
      
      // Create placeholder AI message for streaming
      const aiMessageId = Date.now() + 1;
      const aiMessage = {
        id: aiMessageId,
        sender: 'ai',
        content: '',
        timestamp: new Date(),
        isStreaming: true
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      try {
        const response = await sendMessageStreaming(currentSessionId, content.trim(), {
          onStreamStart: () => {},
          onStreamChunk: (chunk, fullContent, chunkData) => {
            updateStreamingMessage(aiMessageId, fullContent, false);
          },
          onNewsSearchStart: (searchData) => {
            setIsNewsSearching(true);
            setNewsSearchProgress(0);
            setNewsSearchType(searchData?.searchType || 'news');
          },
          onNewsSearchProgress: (progressData) => {
            if (progressData?.progress !== undefined) {
              setNewsSearchProgress(progressData.progress);
            }
          },
          onNewsSearchEnd: (searchResult) => {
            setIsNewsSearching(false);
            setNewsSearchProgress(100);
            setTimeout(() => {
              setNewsSearchProgress(0);
            }, 1500);
          },
          onStreamEnd: (fullContent, enhancedData) => {
            updateStreamingMessage(aiMessageId, fullContent, true);
            setIsLoading(false);
            
            if (isNewsSearching) {
              setIsNewsSearching(false);
              setNewsSearchProgress(0);
            }
          },
          onStreamError: (error) => {
            updateStreamingMessage(aiMessageId, `Sorry, I encountered an error: ${error}`, true);
            setIsLoading(false);
            setIsNewsSearching(false);
            setNewsSearchProgress(0);
          }
        });
        
      } catch (error) {
        updateStreamingMessage(aiMessageId, "Sorry, I encountered an error connecting to the backend.", true);
        setIsLoading(false);
        setIsNewsSearching(false);
        setNewsSearchProgress(0);
      }
    }
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar}
        recentChats={recentChats}
        startNewChat={startNewChat}
        loadChatSession={loadChatSession}
        currentSessionId={currentSessionId}
      />

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-gray-200 px-3 py-2.5 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded mr-1"
              aria-label="Toggle sidebar"
              type="button"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            <div className="flex items-center">
              <div className="w-7 h-7 rounded-sm bg-green-500 flex items-center justify-center mr-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="2"/>
                  <path d="M12 16V12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="12" cy="8" r="1" fill="white"/>
                </svg>
              </div>
              <h1 className="text-base font-semibold text-gray-900">IslamicAI</h1>
            </div>
          </div>
          <button
            onClick={startNewChat}
            className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
            title="New Chat"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <ChatInterface 
          messages={messages} 
          onSendMessage={addMessage}
          isLoading={isLoading}
          currentSessionId={currentSessionId}
          isNewsSearching={isNewsSearching}
          newsSearchProgress={newsSearchProgress}
          newsSearchType={newsSearchType}
        />
      </main>
    </div>
  );
}

export default App;