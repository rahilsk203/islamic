// API utility functions for connecting to the IslamicAI backend
// Enhanced with ultra-advanced session memory and self-learning integration

const API_BASE_URL = 'https://islamicai.sohal70760.workers.dev'; // Local development URL
// const API_BASE_URL = 'https://islamicai.sohal70760.workers.dev'; // Production URL

// 🧠 Advanced frontend session management
let currentSessionAnalytics = null;
let learningInsights = null;
let userPatterns = null;

/**
 * 🚀 Enhanced send message with ultra-advanced backend integration
 * @param {string} sessionId - The session ID for this conversation
 * @param {string} message - The user's message
 * @param {Object} options - Additional options for the request
 * @returns {Promise<Object>} The response from the backend (either direct or streaming)
 */
export const sendMessage = async (sessionId, message, options = {}) => {
  try {
    const {
      enableStreaming = true, // Enable streaming by default
      onStreamChunk = null,   // Callback for streaming chunks
      onStreamStart = null,   // Callback when streaming starts
      onStreamEnd = null,     // Callback when streaming ends
      onStreamError = null,   // Callback for streaming errors
      languageInfo = null,    // Optional language information
      enableLearning = true,  // 🧠 Enable ultra-advanced learning
      enableNewsIntegration = true, // 📰 Enable news integration
      enableMemoryOptimization = true // 🧠 Enable memory optimization
    } = options;
    
    // 📊 Enhanced language detection from recent messages
    const enhancedLanguageInfo = await detectLanguageFromContext(message, languageInfo);
    
    // Prepare request body with all enhanced parameters
    const requestBody = {
      message: message,
      session_id: sessionId,
      language_info: enhancedLanguageInfo,
      streaming_options: {
        enableStreaming: enableStreaming,
        chunkSize: 50, // Increased for better performance
        delay: 30, // Reduced for faster streaming
        includeMetadata: true
      },
      // 🧠 Ultra-advanced features
      advanced_features: {
        enableLearning,
        enableNewsIntegration,
        enableMemoryOptimization,
        intelligenceLevel: 'maximum',
        adaptiveResponse: true
      }
    };
    
    console.log('🚀 Sending enhanced message to backend:', { 
      sessionId, 
      message: message.substring(0, 50) + '...', 
      enableStreaming,
      advancedFeatures: requestBody.advanced_features
    });
    
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('✅ Backend response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Backend error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    // Check if response is streaming or direct
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('text/event-stream') && enableStreaming) {
      console.log('✨ Enhanced streaming response detected');
      
      if (onStreamStart) {
        onStreamStart();
      }
      
      // Handle enhanced streaming response
      return await handleEnhancedStreamingResponse(response, {
        onStreamChunk,
        onStreamEnd,
        onStreamError,
        sessionId
      });
    } else {
      console.log('📄 Enhanced direct response detected');
      
      // Handle direct JSON response with analytics
      const data = await response.json();
      console.log('📊 Backend response data with analytics:', {
        hasReply: !!data.reply,
        sessionId: data.session_id,
        hasAnalytics: !!data.analytics
      });
      
      // Store analytics if available
      if (data.analytics) {
        currentSessionAnalytics = data.analytics;
      }
      
      return {
        type: 'direct',
        reply: data.reply,
        session_id: data.session_id,
        streaming: false,
        analytics: data.analytics,
        ...data
      };
    }
  } catch (error) {
    console.error('❌ Error sending enhanced message to backend:', error);
    throw error;
  }
};

/**
 * 🚀 Enhanced streaming response handler with ultra-advanced features
 * @param {Response} response - The fetch response object
 * @param {Object} callbacks - Streaming callbacks
 * @returns {Promise<Object>} Complete response data with analytics
 */
const handleEnhancedStreamingResponse = async (response, callbacks = {}) => {
  const { onStreamChunk, onStreamEnd, onStreamError, sessionId, onNewsSearchStart, onNewsSearchProgress, onNewsSearchEnd } = callbacks;
  
  try {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    let chunkCount = 0;
    let responseAnalytics = null;
    let learningData = null;
    let newsIntegrationData = null;
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        console.log('✅ Enhanced streaming completed with analytics');
        if (onStreamEnd) {
          onStreamEnd(fullResponse, {
            analytics: responseAnalytics,
            learning: learningData,
            newsIntegration: newsIntegrationData,
            chunkCount
          });
        }
        break;
      }
      
      const chunk = decoder.decode(value);
      chunkCount++;
      
      // Parse Server-Sent Events format with enhanced data handling
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const chunkData = JSON.parse(line.substring(6));
            
            if (chunkData.type === 'content' && chunkData.content) {
              fullResponse += chunkData.content;
              
              if (onStreamChunk) {
                onStreamChunk(chunkData.content, fullResponse, chunkData);
              }
            } else if (chunkData.type === 'analytics') {
              // 📊 Store analytics data from ultra-advanced session memory
              responseAnalytics = chunkData.data;
              console.log('📊 Received session analytics:', responseAnalytics);
            } else if (chunkData.type === 'learning_insights') {
              // 🧠 Store learning insights from self-learning engine
              learningData = chunkData.data;
              console.log('🧠 Received learning insights:', learningData);
            } else if (chunkData.type === 'news_integration') {
              // 📰 Store news integration data
              newsIntegrationData = chunkData.data;
              console.log('📰 Received news integration data:', newsIntegrationData);
            } else if (chunkData.type === 'news_search_start') {
              // 🔍 Backend started news search
              console.log('🔍 Backend news search started');
              if (onNewsSearchStart) {
                onNewsSearchStart(chunkData.data);
              }
            } else if (chunkData.type === 'news_search_progress') {
              // 📈 Backend news search progress update
              console.log('📈 Backend news search progress:', chunkData.data);
              if (onNewsSearchProgress) {
                onNewsSearchProgress(chunkData.data);
              }
            } else if (chunkData.type === 'news_search_end') {
              // ✅ Backend news search completed
              console.log('✅ Backend news search completed');
              if (onNewsSearchEnd) {
                onNewsSearchEnd(chunkData.data);
              }
            } else if (chunkData.type === 'internet_search_start') {
              // 🌐 Backend started internet search
              console.log('🌐 Backend internet search started');
              if (onNewsSearchStart) {
                onNewsSearchStart({ ...chunkData.data, searchType: 'internet' });
              }
            } else if (chunkData.type === 'internet_search_progress') {
              // 📉 Backend internet search progress
              console.log('📉 Backend internet search progress:', chunkData.data);
              if (onNewsSearchProgress) {
                onNewsSearchProgress({ ...chunkData.data, searchType: 'internet' });
              }
            } else if (chunkData.type === 'internet_search_end') {
              // ✅ Backend internet search completed
              console.log('✅ Backend internet search completed');
              if (onNewsSearchEnd) {
                onNewsSearchEnd({ ...chunkData.data, searchType: 'internet' });
              }
            } else if (chunkData.type === 'error') {
              console.error('Stream error:', chunkData.content);
              if (onStreamError) {
                onStreamError(chunkData.content);
              }
            } else if (chunkData.type === 'start') {
              console.log('📡 Enhanced stream started:', chunkData.metadata);
            } else if (chunkData.type === 'end') {
              console.log('🏁 Enhanced stream ended:', chunkData.metadata);
            }
          } catch (parseError) {
            console.warn('Failed to parse enhanced chunk:', line);
          }
        }
      }
    }
    
    // Store analytics globally for frontend access
    if (responseAnalytics) {
      currentSessionAnalytics = responseAnalytics;
    }
    if (learningData) {
      learningInsights = learningData;
    }
    
    return {
      type: 'streaming',
      reply: fullResponse,
      streaming: true,
      chunkCount: chunkCount,
      success: true,
      analytics: responseAnalytics,
      learningInsights: learningData,
      newsIntegration: newsIntegrationData
    };
    
  } catch (error) {
    console.error('Enhanced streaming error:', error);
    if (onStreamError) {
      onStreamError(error.message);
    }
    throw error;
  }
};

/**
 * Handle standard streaming response (for backward compatibility)
 * @param {Response} response - The fetch response object
 * @param {Object} callbacks - Streaming callbacks
 * @returns {Promise<Object>} Complete response data
 */
const handleStreamingResponse = async (response, callbacks = {}) => {
  // Use enhanced handler for better performance
  return await handleEnhancedStreamingResponse(response, callbacks);
};

/**
 * Send a message with direct response (no streaming)
 * @param {string} sessionId - The session ID
 * @param {string} message - The user's message
 * @returns {Promise<Object>} Direct response from backend
 */
export const sendMessageDirect = async (sessionId, message) => {
  return await sendMessage(sessionId, message, {
    enableStreaming: false
  });
};

/**
 * Send a message with streaming enabled
 * @param {string} sessionId - The session ID
 * @param {string} message - The user's message
 * @param {Object} streamingCallbacks - Streaming event callbacks
 * @returns {Promise<Object>} Streaming response from backend
 */
export const sendMessageStreaming = async (sessionId, message, streamingCallbacks = {}) => {
  return await sendMessage(sessionId, message, {
    enableStreaming: true,
    ...streamingCallbacks
  });
};

/**
 * Start a new chat session
 * @returns {string} A new session ID
 */
export const createNewSession = () => {
  return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
};

/**
 * Memory Management System for Frontend Chat History
 */

/**
 * Normalize timestamp to ensure it's a valid Date object
 * @param {Date|string|number} timestamp - Timestamp to normalize
 * @returns {Date} Normalized Date object
 */
const normalizeTimestamp = (timestamp) => {
  if (timestamp instanceof Date) {
    return timestamp;
  }
  if (typeof timestamp === 'string' || typeof timestamp === 'number') {
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? new Date() : date;
  }
  return new Date();
};

/**
 * Get all stored chat sessions from localStorage
 * @returns {Array} Array of chat session objects
 */
export const getAllChatSessions = () => {
  try {
    const sessions = localStorage.getItem('islamicAI_chatSessions');
    return sessions ? JSON.parse(sessions) : [];
  } catch (error) {
    console.error('Error getting chat sessions:', error);
    return [];
  }
};

/**
 * Get a specific chat session by ID
 * @param {string} sessionId - The session ID to retrieve
 * @returns {Object|null} The chat session object or null if not found
 */
export const getChatSession = (sessionId) => {
  try {
    const sessions = getAllChatSessions();
    const session = sessions.find(session => session.id === sessionId);
    
    if (session) {
      // Normalize message timestamps to Date objects for consistency
      const normalizedSession = {
        ...session,
        messages: session.messages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp)
        }))
      };
      return normalizedSession;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting chat session:', error);
    return null;
  }
};

/**
 * Save or update a complete chat session
 * @param {string} sessionId - The session ID
 * @param {Array} messages - Array of all messages in the session
 * @param {string} title - Auto-generated title from first user message
 */
export const saveChatSession = (sessionId, messages, title = null) => {
  try {
    const sessions = getAllChatSessions();
    
    // Auto-generate title from first user message if not provided
    const autoTitle = title || generateChatTitle(messages);
    
    // Ensure timestamps are ISO strings for consistent storage
    const normalizedMessages = messages.map(msg => ({
      ...msg,
      timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp
    }));
    
    // Find existing session or create new one
    const existingIndex = sessions.findIndex(session => session.id === sessionId);
    
    const sessionData = {
      id: sessionId,
      title: autoTitle,
      messages: normalizedMessages,
      lastUpdated: new Date().toISOString(),
      messageCount: normalizedMessages.length,
      preview: generatePreview(normalizedMessages)
    };
    
    if (existingIndex >= 0) {
      // Update existing session
      sessions[existingIndex] = sessionData;
    } else {
      // Add new session to beginning
      sessions.unshift(sessionData);
    }
    
    // Keep only last 50 sessions to prevent storage overflow
    if (sessions.length > 50) {
      sessions.splice(50);
    }
    
    localStorage.setItem('islamicAI_chatSessions', JSON.stringify(sessions));
    
    return sessionData;
  } catch (error) {
    console.error('Error saving chat session:', error);
    return null;
  }
};

/**
 * Delete a chat session
 * @param {string} sessionId - The session ID to delete
 */
export const deleteChatSession = (sessionId) => {
  try {
    const sessions = getAllChatSessions();
    const filteredSessions = sessions.filter(session => session.id !== sessionId);
    localStorage.setItem('islamicAI_chatSessions', JSON.stringify(filteredSessions));
    return true;
  } catch (error) {
    console.error('Error deleting chat session:', error);
    return false;
  }
};

/**
 * Generate a title from the first user message
 * @param {Array} messages - Array of messages
 * @returns {string} Generated title
 */
const generateChatTitle = (messages) => {
  const firstUserMessage = messages.find(msg => msg.sender === 'user');
  if (firstUserMessage) {
    let title = firstUserMessage.content.trim();
    // Take first 30 characters and clean up
    title = title.substring(0, 30);
    // If it ends mid-word, try to end at last complete word
    if (title.length === 30) {
      const lastSpace = title.lastIndexOf(' ');
      if (lastSpace > 15) {
        title = title.substring(0, lastSpace);
      }
      title += '...';
    }
    return title;
  }
  return 'New Chat';
};

/**
 * Generate a preview from the conversation
 * @param {Array} messages - Array of messages
 * @returns {string} Generated preview
 */
const generatePreview = (messages) => {
  const firstUserMessage = messages.find(msg => msg.sender === 'user');
  if (firstUserMessage) {
    let preview = firstUserMessage.content.trim();
    return preview.length > 50 ? preview.substring(0, 47) + '...' : preview;
  }
  return 'No messages yet';
};

/**
 * Get recent chats (for backward compatibility)
 * @returns {Array} Array of recent chat objects
 */
export const getRecentChats = () => {
  const sessions = getAllChatSessions();
  return sessions.slice(0, 10).map(session => ({
    id: session.id,
    title: session.title,
    preview: session.preview,
    timestamp: session.lastUpdated,
    messageCount: session.messageCount
  }));
};

/**
 * Save a chat (for backward compatibility)
 * @param {string} sessionId - The session ID
 * @param {string} title - The chat title
 * @param {string} preview - A preview of the chat
 */
export const saveChat = (sessionId, title, preview) => {
  // This is now handled by saveChatSession, keeping for compatibility
  console.log('saveChat called - using new saveChatSession system');
};

/**
 * Search through chat history
 * @param {string} query - Search query
 * @returns {Array} Array of matching chat sessions
 */
export const searchChatHistory = (query) => {
  try {
    const sessions = getAllChatSessions();
    const lowerQuery = query.toLowerCase();
    
    return sessions.filter(session => {
      // Search in title
      if (session.title.toLowerCase().includes(lowerQuery)) {
        return true;
      }
      
      // Search in messages
      return session.messages.some(message => 
        message.content.toLowerCase().includes(lowerQuery)
      );
    });
  } catch (error) {
    console.error('Error searching chat history:', error);
    return [];
  }
};

/**
 * Get chat statistics
 * @returns {Object} Statistics about chat usage
 */
export const getChatStatistics = () => {
  try {
    const sessions = getAllChatSessions();
    
    return {
      totalSessions: sessions.length,
      totalMessages: sessions.reduce((sum, session) => sum + session.messageCount, 0),
      oldestChat: sessions.length > 0 ? sessions[sessions.length - 1].lastUpdated : null,
      newestChat: sessions.length > 0 ? sessions[0].lastUpdated : null,
      averageMessagesPerSession: sessions.length > 0 ? 
        Math.round(sessions.reduce((sum, session) => sum + session.messageCount, 0) / sessions.length) : 0
    };
  } catch (error) {
    console.error('Error getting chat statistics:', error);
    return {
      totalSessions: 0,
      totalMessages: 0,
      oldestChat: null,
      newestChat: null,
      averageMessagesPerSession: 0
    };
  }
};

/**
 * Get UI text based on language (simplified for backend-driven detection)
 * @param {string} language - The language code
 * @returns {Object} UI text object for the language
 */
export const getLanguageUIText = (language) => {
  const uiTexts = {
    english: {
      placeholder: 'Ask about Qur\'an, Hadith, Fiqh, Seerah, or any Islamic topic...',
      sendButton: 'Send',
      newChat: 'New Chat',
      recentChats: 'Recent Chats',
      settings: 'Settings',
      loading: 'IslamicAI is thinking...',
      error: 'Sorry, there was an error. Please try again.',
      welcome: 'Welcome to IslamicAI! How can I help you today?'
    },
    hindi: {
      placeholder: 'कुरान, हदीस, फ़िक़्ह, सीरा या किसी भी इस्लामी विषय के बारे में पूछें...',
      sendButton: 'भेजें',
      newChat: 'नई चैट',
      recentChats: 'हाल की चैट्स',
      settings: 'सेटिंग्स',
      loading: 'इस्लामिकएआई सोच रहा है...',
      error: 'क्षमा करें, कोई त्रुटि हुई। कृपया पुनः प्रयास करें।',
      welcome: 'इस्लामिकएआई में आपका स्वागत है! आज मैं आपकी कैसे मदद कर सकता हूं?'
    },
    urdu: {
      placeholder: 'قرآن، حدیث، فقہ، سیرت یا کسی بھی اسلامی موضوع کے بارے میں پوچھیں...',
      sendButton: 'بھیجیں',
      newChat: 'نیا چیٹ',
      recentChats: 'حالیہ چیٹس',
      settings: 'سیٹنگز',
      loading: 'اسلامک اے آئی سوچ رہا ہے...',
      error: 'معذرت، کوئی خرابی ہوئی۔ براہ کرم دوبارہ کوشش کریں۔',
      welcome: 'اسلامک اے آئی میں خوش آمدید! آج میں آپ کی کیسے مدد کر سکتا ہوں؟'
    },
    arabic: {
      placeholder: 'اسأل عن القرآن والحديث والفقه والسيرة أو أي موضوع إسلامي...',
      sendButton: 'إرسال',
      newChat: 'محادثة جديدة',
      recentChats: 'المحادثات الأخيرة',
      settings: 'الإعدادات',
      loading: 'الذكاء الاصطناعي الإسلامي يفكر...',
      error: 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.',
      welcome: 'مرحباً بك في الذكاء الاصطناعي الإسلامي! كيف يمكنني مساعدتك اليوم؟'
    },
    hinglish: {
      placeholder: 'Qur\'an, Hadith, Fiqh, Seerah ya koi bhi Islamic topic ke baare mein pucho...',
      sendButton: 'Bhejo',
      newChat: 'Nayi Chat',
      recentChats: 'Recent Chats',
      settings: 'Settings',
      loading: 'IslamicAI soch raha hai...',
      error: 'Sorry, koi error aaya. Phir se try karo.',
      welcome: 'IslamicAI mein aapka swagat hai! Aaj main aapki kaise madad kar sakta hun?'
    }
  };

  return uiTexts[language] || uiTexts.english;
};

// 🧠 ULTRA-ADVANCED SESSION MEMORY & ANALYTICS API

/**
 * Get current session analytics and learning insights
 * @returns {Object} Session analytics data
 */
export const getSessionAnalytics = () => {
  return {
    analytics: currentSessionAnalytics,
    learningInsights: learningInsights,
    userPatterns: userPatterns
  };
};

/**
 * Get learning insights with intelligence metrics
 * @returns {Object} Learning insights data
 */
export const getLearningInsights = () => {
  return learningInsights || {
    intelligenceGain: 0,
    patternRecognitionAccuracy: 0,
    adaptiveResponseScore: 0,
    learningProgressMetrics: {},
    userSatisfactionIndex: 0
  };
};

/**
 * Get advanced session memory statistics
 * @param {string} sessionId - Session ID
 * @returns {Object} Session memory statistics
 */
export const getSessionMemoryStats = (sessionId) => {
  const sessions = getAllChatSessions();
  const currentSession = sessions.find(session => session.id === sessionId);
  
  if (!currentSession) {
    return {
      messageCount: 0,
      conversationLength: 0,
      averageResponseTime: 0,
      topicDiversity: 0,
      learningProgress: 0
    };
  }
  
  const messageCount = currentSession.messageCount || 0;
  const userMessages = currentSession.messages?.filter(msg => msg.sender === 'user') || [];
  const aiMessages = currentSession.messages?.filter(msg => msg.sender === 'ai') || [];
  
  // Calculate conversation metrics
  const conversationLength = Math.floor(
    (new Date() - new Date(currentSession.messages?.[0]?.timestamp || new Date())) / 60000
  ); // in minutes
  
  const averageResponseTime = aiMessages.length > 0 ? 
    aiMessages.reduce((sum, msg, index) => {
      if (index > 0) {
        const prevMsg = currentSession.messages[currentSession.messages.indexOf(msg) - 1];
        if (prevMsg && prevMsg.sender === 'user') {
          return sum + (new Date(msg.timestamp) - new Date(prevMsg.timestamp));
        }
      }
      return sum;
    }, 0) / Math.max(aiMessages.length - 1, 1) / 1000 : 0; // in seconds
  
  // Calculate topic diversity (simplified)
  const uniqueTopics = new Set();
  userMessages.forEach(msg => {
    const words = msg.content.toLowerCase().split(' ');
    const islamicTerms = ['quran', 'hadith', 'islam', 'allah', 'prophet', 'salah', 'fiqh', 'seerah'];
    islamicTerms.forEach(term => {
      if (words.some(word => word.includes(term))) {
        uniqueTopics.add(term);
      }
    });
  });
  
  return {
    messageCount,
    conversationLength,
    averageResponseTime: Math.round(averageResponseTime),
    topicDiversity: uniqueTopics.size,
    learningProgress: Math.min(100, messageCount * 2), // Simplified learning progress
    sessionStartTime: currentSession.messages?.[0]?.timestamp,
    lastActivity: currentSession.lastUpdated
  };
};

/**
 * Enhanced language detection from recent messages with context analysis
 * @param {string} currentMessage - The current message
 * @param {Object} languageInfo - Existing language information
 * @returns {Object} Enhanced language information with context
 */
const detectLanguageFromContext = async (currentMessage, languageInfo = null) => {
  // Advanced language detection with context analysis
  let detectedLanguage = 'english';
  let confidence = 0.5;
  
  if (!currentMessage) {
    return languageInfo || { language: 'english', confidence: 0.5 };
  }
  
  const text = currentMessage.toLowerCase();
  
  // Enhanced Hinglish patterns detection
  const hinglishPatterns = [
    'tuu', 'kasa', 'kon', 'kaya', 'saktaa', 'hoon', 'hai', 'hain', 'hun',
    'kar', 'koo', 'maa', 'yaar', 'bhai', 'dude', 'yahan', 'wahan', 'kahan',
    'kya', 'kaun', 'kaise', 'kyun', 'kab', 'aur', 'main', 'mera', 'tera',
    'uska', 'humara', 'tumhara', 'unka', 'isme', 'usme', 'jisme'
  ];
  
  const hinglishCount = hinglishPatterns.filter(pattern => text.includes(pattern)).length;
  
  if (hinglishCount >= 2) {
    detectedLanguage = 'hinglish';
    confidence = Math.min(0.95, 0.7 + (hinglishCount * 0.05));
  }
  // Check for Hindi (Devanagari script)
  else if (/[\u0900-\u097F]/.test(currentMessage)) {
    detectedLanguage = 'hindi';
    confidence = 0.9;
  }
  // Check for Urdu/Arabic script
  else if (/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(currentMessage)) {
    detectedLanguage = 'urdu';
    confidence = 0.9;
  }
  // Enhanced English detection
  else {
    const englishWords = text.split(' ').filter(word => 
      /^[a-zA-Z]+$/.test(word) && word.length > 2
    ).length;
    if (englishWords > 3) {
      detectedLanguage = 'english';
      confidence = 0.8;
    }
  }
  
  // Context analysis from recent messages
  const recentContext = window.recentMessages ? window.recentMessages.slice(-5) : [];
  const recentLanguages = recentContext
    .filter(msg => msg.sender === 'user')
    .map(msg => detectSimpleLanguage(msg.content));
  
  // Adjust confidence based on conversation consistency
  if (recentLanguages.length > 0) {
    const consistentLanguage = recentLanguages.filter(lang => lang === detectedLanguage).length;
    if (consistentLanguage >= 2) {
      confidence = Math.min(0.95, confidence + 0.1);
    }
  }
  
  return {
    language: detectedLanguage,
    confidence: confidence,
    script: detectedLanguage,
    recentContext: recentContext,
    contextualClues: {
      hinglishPatterns: hinglishCount,
      hasDevanagari: /[\u0900-\u097F]/.test(currentMessage),
      hasArabicScript: /[\u0600-\u06FF]/.test(currentMessage),
      conversationConsistency: recentLanguages
    }
  };
};

/**
 * Simple language detection helper
 * @param {string} text - Text to analyze
 * @returns {string} Detected language
 */
const detectSimpleLanguage = (text) => {
  if (!text) return 'english';
  
  const lowerText = text.toLowerCase();
  
  if (/[\u0900-\u097F]/.test(text)) return 'hindi';
  if (/[\u0600-\u06FF]/.test(text)) return 'urdu';
  if (lowerText.includes('hai') || lowerText.includes('kar') || lowerText.includes('kya')) return 'hinglish';
  
  return 'english';
};