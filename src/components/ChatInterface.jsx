import { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import { getLanguageUIText, getSessionAnalytics, getLearningInsights, getSessionMemoryStats } from '../utils/api.js';

const ChatInterface = ({ messages, onSendMessage, isLoading, currentSessionId }) => {
  const [inputValue, setInputValue] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState('english');
  const [uiText, setUiText] = useState(getLanguageUIText('english'));
  const [screenSize, setScreenSize] = useState('desktop');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [sessionAnalytics, setSessionAnalytics] = useState(null);
  const [learningInsights, setLearningInsights] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Function to get responsive placeholder based on screen size
  const getResponsivePlaceholder = (originalPlaceholder) => {
    if (screenSize === 'mobile') {
      // Short placeholder for mobile
      if (currentLanguage === 'hindi') {
        return 'कुरान, हदीस या इस्लामी विषय पूछें...';
      } else if (currentLanguage === 'urdu') {
        return 'قرآن، حدیث یا اسلامی موضوع پوچھیں...';
      } else if (currentLanguage === 'arabic') {
        return 'اسأل عن القرآن والحديث...';
      } else if (currentLanguage === 'hinglish') {
        return 'Qur\'an, Hadith ya Islamic topic pucho...';
      } else {
        return 'Ask about Islamic topics...';
      }
    } else if (screenSize === 'tablet') {
      // Medium placeholder for tablet
      if (currentLanguage === 'hindi') {
        return 'कुरान, हदीस, फ़िक़्ह या सीरा के बारे में पूछें...';
      } else if (currentLanguage === 'urdu') {
        return 'قرآن، حدیث، فقہ یا سیرت کے بارے میں پوچھیں...';
      } else if (currentLanguage === 'arabic') {
        return 'اسأل عن القرآن والحديث والفقه والسيرة...';
      } else if (currentLanguage === 'hinglish') {
        return 'Qur\'an, Hadith, Fiqh ya Seerah ke baare mein pucho...';
      } else {
        return 'Ask about Qur\'an, Hadith, Fiqh, or Seerah...';
      }
    } else {
      // Full placeholder for desktop
      return originalPlaceholder;
    }
  };

  // Update screen size on resize
  useEffect(() => {
    const updateScreenSize = () => {
      if (window.innerWidth < 640) {
        setScreenSize('mobile');
      } else if (window.innerWidth < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  // Simple language detection from last user message
  const detectLanguageFromMessage = (message) => {
    if (!message) return 'english';
    
    const text = message.toLowerCase();
    
    // Check for Hinglish patterns
    if (text.includes('tuu') || text.includes('kasa') || text.includes('kon') || 
        text.includes('kaya') || text.includes('saktaa') || text.includes('hoon') ||
        text.includes('hai') || text.includes('hain') || text.includes('hun')) {
      return 'hinglish';
    }
    
    // Check for Hindi (Devanagari script)
    if (/[\u0900-\u097F]/.test(message)) {
      return 'hindi';
    }
    
    // Check for Urdu/Arabic script
    if (/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(message)) {
      return 'urdu';
    }
    
    return 'english';
  };

  // Update language when messages change
  useEffect(() => {
    if (messages.length > 0) {
      const lastUserMessage = messages.filter(msg => msg.sender === 'user').pop();
      if (lastUserMessage) {
        const detectedLang = detectLanguageFromMessage(lastUserMessage.content || lastUserMessage.text);
        if (detectedLang !== currentLanguage) {
          setCurrentLanguage(detectedLang);
          setUiText(getLanguageUIText(detectedLang));
        }
      }
    }
  }, [messages, currentLanguage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Auto-resize textarea - but keep it single line for placeholder
    if (textareaRef.current) {
      if (value.trim().length === 0) {
        // When empty, keep single line height
        textareaRef.current.style.height = '44px';
        textareaRef.current.style.whiteSpace = 'nowrap';
        textareaRef.current.style.overflow = 'hidden';
      } else {
        // When user types, allow multi-line
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
    // Validate input
    if (!inputValue || typeof inputValue !== 'string' || isLoading) {
      console.log('Send button disabled - invalid input or loading');
      return;
    }

    const trimmedValue = inputValue.trim();
    if (!trimmedValue) {
      console.log('Send button disabled - empty message');
      return;
    }

    console.log('Sending message:', trimmedValue);
    
    // Clear input and reset textarea height
    setInputValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = '44px';
      textareaRef.current.style.whiteSpace = 'nowrap';
      textareaRef.current.style.overflow = 'hidden';
    }

    // Add user message
    onSendMessage(trimmedValue, 'user');
  };

  const handleQuickPrompt = (prompt) => {
    if (typeof prompt === 'string' && prompt.trim()) {
      setInputValue(prompt);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  const welcomeActions = [
    { 
      id: 1, 
      text: "Five Pillars of Islam", 
      icon: "fas fa-star", 
      prompt: "Tell me about the five pillars of Islam in detail",
      color: "from-emerald-500 to-teal-600",
      bgColor: "bg-gradient-to-br from-emerald-50 to-teal-50",
      borderColor: "border-emerald-300",
      hoverColor: "hover:from-emerald-100 hover:to-teal-100"
    },
    { 
      id: 2, 
      text: "Kindness to Parents", 
      icon: "fas fa-heart", 
      prompt: "What does Islam say about kindness and respect to parents?",
      color: "from-rose-500 to-pink-600",
      bgColor: "bg-gradient-to-br from-rose-50 to-pink-50",
      borderColor: "border-rose-300",
      hoverColor: "hover:from-rose-100 hover:to-pink-100"
    },
    { 
      id: 3, 
      text: "Concept of Tawheed", 
      icon: "fas fa-lightbulb", 
      prompt: "Explain the concept of Tawheed (Oneness of Allah) in Islam",
      color: "from-amber-500 to-orange-600",
      bgColor: "bg-gradient-to-br from-amber-50 to-orange-50",
      borderColor: "border-amber-300",
      hoverColor: "hover:from-amber-100 hover:to-orange-100"
    },
    { 
      id: 4, 
      text: "How to Perform Salah", 
      icon: "fas fa-pray", 
      prompt: "How to perform Salah (prayer) correctly? Step by step guide please",
      color: "from-blue-500 to-indigo-600",
      bgColor: "bg-gradient-to-br from-blue-50 to-indigo-50",
      borderColor: "border-blue-300",
      hoverColor: "hover:from-blue-100 hover:to-indigo-100"
    },
    { 
      id: 5, 
      text: "Daily Islamic Duas", 
      icon: "fas fa-hands-praying", 
      prompt: "Share some important daily Islamic duas with meanings",
      color: "from-purple-500 to-violet-600",
      bgColor: "bg-gradient-to-br from-purple-50 to-violet-50",
      borderColor: "border-purple-300",
      hoverColor: "hover:from-purple-100 hover:to-violet-100"
    },
    { 
      id: 6, 
      text: "Prophet's Sunnah", 
      icon: "fas fa-sun", 
      prompt: "Tell me about Prophet Muhammad's (PBUH) beautiful Sunnah practices",
      color: "from-yellow-500 to-amber-600",
      bgColor: "bg-gradient-to-br from-yellow-50 to-amber-50",
      borderColor: "border-yellow-300",
      hoverColor: "hover:from-yellow-100 hover:to-amber-100"
    }
  ];

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* 🧠 Enhanced Analytics Panel - Ultra-Advanced Session Memory */}
      {showAnalytics && (sessionAnalytics || learningInsights) && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 p-3 sm:p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-brain text-white text-xs"></i>
                </div>
                <h3 className="text-sm font-semibold text-gray-800">Ultra-Advanced Session Analytics</h3>
              </div>
              <button
                onClick={() => setShowAnalytics(false)}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <i className="fas fa-times text-sm"></i>
              </button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {/* Learning Insights */}
              {learningInsights && (
                <>
                  <div className="bg-white/80 rounded-lg p-2 border border-emerald-200">
                    <div className="text-emerald-600 font-medium">Intelligence Gain</div>
                    <div className="text-lg font-bold text-emerald-700">
                      +{((learningInsights.intelligenceGain || 0) * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-white/80 rounded-lg p-2 border border-blue-200">
                    <div className="text-blue-600 font-medium">Pattern Recognition</div>
                    <div className="text-lg font-bold text-blue-700">
                      {((learningInsights.patternRecognitionAccuracy || 0) * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-white/80 rounded-lg p-2 border border-purple-200">
                    <div className="text-purple-600 font-medium">Adaptive Score</div>
                    <div className="text-lg font-bold text-purple-700">
                      {((learningInsights.adaptiveResponseScore || 0) * 100).toFixed(0)}/100
                    </div>
                  </div>
                  <div className="bg-white/80 rounded-lg p-2 border border-amber-200">
                    <div className="text-amber-600 font-medium">Satisfaction</div>
                    <div className="text-lg font-bold text-amber-700">
                      {((learningInsights.userSatisfactionIndex || 0) * 100).toFixed(0)}%
                    </div>
                  </div>
                </>
              )}
              
              {/* Session Analytics */}
              {sessionAnalytics && (
                <>
                  <div className="bg-white/80 rounded-lg p-2 border border-gray-200 sm:col-span-2">
                    <div className="text-gray-600 font-medium">Session Duration</div>
                    <div className="text-lg font-bold text-gray-700">
                      {sessionAnalytics.conversationLength || 0} min
                    </div>
                  </div>
                  <div className="bg-white/80 rounded-lg p-2 border border-gray-200 sm:col-span-2">
                    <div className="text-gray-600 font-medium">Topics Explored</div>
                    <div className="text-lg font-bold text-gray-700">
                      {sessionAnalytics.topicDiversity || 0} topics
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Messages Container - Enhanced Mobile Support */}
      <div className="flex-1 overflow-y-auto relative">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
          {messages.map((message, index) => (
            <div key={message.id} className="animate-fade-in-up">
              <MessageBubble 
                message={message} 
                isStreaming={message.isStreaming || (message.sender === 'ai' && isLoading && messages[messages.length - 1].id === message.id)}
              />
            </div>
          ))}
          
          {/* Loading handled by MessageBubble component when streaming */}
          
          {/* 🌟 Enhanced Welcome Actions - Ultra User-Friendly Layout */}
          {messages.length === 1 && messages[0].sender === 'ai' && (
            <div className="mt-6 sm:mt-8">
              <div className="text-center mb-5 sm:mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-200">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2 flex items-center justify-center space-x-2">
                  <i className="fas fa-sparkles text-amber-500"></i>
                  <span>Quick Start Topics</span>
                  <i className="fas fa-sparkles text-amber-500"></i>
                </h3>
                <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto leading-relaxed">
                  Choose karo koi bhi topic to begin your Islamic journey 🌟
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {welcomeActions.map((action, index) => (
                  <button
                    key={action.id}
                    onClick={() => handleQuickPrompt(action.prompt)}
                    className={`group relative p-4 sm:p-5 ${action.bgColor} ${action.hoverColor} border-2 ${action.borderColor} rounded-2xl hover:shadow-xl transition-all duration-300 text-left touch-manipulation active:scale-95 transform hover:-translate-y-2 hover:border-opacity-80`}
                    style={{ 
                      minHeight: '120px', 
                      animationDelay: `${index * 0.1}s`,
                      boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                    }}
                  >
                    {/* 🌈 Enhanced Visual Design */}
                    <div className="flex flex-col h-full">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300 border-2 border-white`}>
                          <i className={`${action.icon} text-white text-lg sm:text-xl`}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm sm:text-base lg:text-lg text-gray-800 group-hover:text-gray-900 transition-colors leading-tight">
                            {action.text}
                          </h4>
                        </div>
                      </div>
                      
                      <div className="flex-1 flex items-end justify-between">
                        <p className="text-xs sm:text-sm text-gray-600 opacity-80 group-hover:opacity-100 transition-opacity duration-200">
                          Tap karo explore karne ke liye
                        </p>
                        <i className="fas fa-arrow-right text-gray-400 text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1"></i>
                      </div>
                    </div>
                    
                    {/* ✨ Hover Effect Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                  </button>
                ))}
              </div>
              
              {/* 💬 Encouraging Message */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 bg-white/80 inline-block px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                  🥰 Ya phir direct apna question type kar sakte hain below! 👇
                </p>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

          {/* Enhanced Mobile-First Input Area - Fixed at Bottom */}
      <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-gray-200/80 shadow-lg safe-area-inset-bottom">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          {/* 🧠 Ultra-Advanced Learning Insights Display */}
          {learningInsights && (learningInsights.intelligenceGain > 0 || learningInsights.patternRecognitionAccuracy > 0) && (
            <div className="mb-2 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full">
                  <i className="fas fa-brain text-xs"></i>
                  <span>+{((learningInsights.intelligenceGain || 0) * 100).toFixed(1)}% Intelligence</span>
                </div>
                <div className="flex items-center space-x-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                  <i className="fas fa-chart-line text-xs"></i>
                  <span>{((learningInsights.patternRecognitionAccuracy || 0) * 100).toFixed(0)}% Recognition</span>
                </div>
              </div>
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="text-gray-500 hover:text-blue-600 p-1 rounded"
                title="Toggle Analytics"
              >
                <i className={`fas ${showAnalytics ? 'fa-chart-bar' : 'fa-chart-line'} text-xs`}></i>
              </button>
            </div>
          )}
          
          {/* 💬 Enhanced Mobile-Optimized Input Tools */}
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="text-sm text-gray-600 hidden sm:flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-full border border-gray-200">
              <i className="fas fa-keyboard text-gray-500"></i>
              <span>Press <kbd className="px-2 py-1 bg-white border border-gray-300 rounded font-mono text-xs shadow-sm">Enter</kbd> to send</span>
            </div>
            
            {/* 🧠 Enhanced Mobile Learning & Typing Indicator */}
            {isLoading && (
              <div className="flex items-center space-x-3 text-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce shadow-sm"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce shadow-sm" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce shadow-sm" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="text-emerald-700 font-medium bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  🤖 AI jawab de raha hai...
                </span>
              </div>
            )}
          </div>
          
          {/* 🎨 Ultra-Enhanced Input Container */}
          <div className="relative">
            <div className="flex items-end space-x-3 sm:space-x-4 input-container">
              {/* 📱 Enhanced Input Field - Ultra Mobile Optimized */}
              <div className="flex-1 relative group">
                {/* 🌈 Main Input Container with Superior Styling */}
                <div className="relative bg-gradient-to-r from-white via-gray-50 to-white backdrop-blur-sm rounded-3xl border-2 border-gray-300 group-focus-within:border-blue-500 group-focus-within:from-blue-50 group-focus-within:to-indigo-50 transition-all duration-300 shadow-lg group-focus-within:shadow-xl hover:shadow-xl hover:border-gray-400">
                  <div className="relative flex items-center">
                    {/* ✨ Enhanced Mobile Textarea with Superior UX */}
                    <textarea
                      ref={textareaRef}
                      value={inputValue}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder={getResponsivePlaceholder(uiText.placeholder)}
                      className="w-full px-5 sm:px-6 py-4 pr-12 sm:pr-16 border-0 rounded-3xl focus:ring-0 focus:outline-none resize-none transition-all duration-300 bg-transparent text-gray-900 placeholder-gray-500 text-base sm:text-lg leading-relaxed min-h-[56px] max-h-[140px] sm:max-h-[200px] overflow-hidden touch-manipulation mobile-input font-medium"
                      rows="1"
                      disabled={isLoading}
                      maxLength={2000}
                      autoComplete="off"
                      autoCapitalize="sentences"
                      autoCorrect="on"
                      spellCheck="true"
                      style={{ 
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        fontSize: '16px', // Prevents zoom on iOS
                        WebkitAppearance: 'none',
                        borderRadius: 0
                      }}
                    />
                    
                    {/* 🔍 Enhanced Language Indicator with Better Visibility */}
                    {currentLanguage !== 'english' && (
                      <div className="absolute left-4 sm:left-5 top-1/2 transform -translate-y-1/2 flex items-center space-x-2 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 px-3 py-1.5 rounded-full text-sm font-bold border border-emerald-300 shadow-sm">
                        <i className="fas fa-globe text-emerald-600"></i>
                        <span className="capitalize">{currentLanguage}</span>
                      </div>
                    )}
                    
                    {/* 📊 Enhanced Right Side Elements with Superior Design */}
                    <div className="absolute right-4 sm:right-5 top-1/2 transform -translate-y-1/2 flex items-center space-x-2 sm:space-x-3">
                      {/* 📈 Character Counter - Enhanced Mobile Display */}
                      {inputValue.length > 0 && (
                        <div className="flex items-center space-x-2 bg-gradient-to-r from-gray-100 to-gray-200 px-3 py-1.5 rounded-full border border-gray-300 shadow-sm">
                          <div className={`w-2 h-2 rounded-full ${
                            inputValue.length > 1800 ? 'bg-red-500 animate-pulse' : 
                            inputValue.length > 1500 ? 'bg-yellow-500' : 'bg-emerald-500'
                          }`}></div>
                          <span className={`text-sm font-bold ${
                            inputValue.length > 1800 ? 'text-red-700' : 
                            inputValue.length > 1500 ? 'text-yellow-700' : 'text-emerald-700'
                          }`}>
                            {inputValue.length > 1000 ? `${Math.round(inputValue.length/100)*100}` : inputValue.length}
                            <span className="hidden sm:inline text-gray-500">/2000</span>
                          </span>
                        </div>
                      )}
                      
                      {/* Loading Indicator - Mobile Optimized */}
                      {isLoading && (
                        <div className="flex items-center space-x-1 bg-blue-50 px-1.5 sm:px-2 py-1 rounded-full">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      )}
                      
                      {/* 🧠 Enhanced Real-time Learning Indicator */}
                      {learningInsights && learningInsights.intelligenceGain > 0 && (
                        <div className="flex items-center space-x-1 bg-gradient-to-r from-emerald-100 to-blue-100 px-2 py-1 rounded-full">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                          <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                          <span className="text-xs font-medium text-emerald-700 hidden sm:inline">Learning...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 🚀 Ultra-Enhanced Mobile Send Button */}
              <button
                onClick={handleSend}
                disabled={!inputValue?.trim() || isLoading}
                className={`flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl transition-all duration-300 touch-manipulation active:scale-95 group border-2 shadow-lg ${  
                  inputValue?.trim() && !isLoading
                    ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 text-white border-blue-400 shadow-blue-200 hover:shadow-blue-300 transform hover:-translate-y-1 hover:shadow-xl'
                    : 'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-500 cursor-not-allowed border-gray-300'
                }`}
                style={{ minWidth: '56px', minHeight: '56px' }}
                title={isLoading ? "Message send ho raha hai..." : "Message bhejiye"}
                type="button"
                aria-label={isLoading ? "Sending message" : "Send message"}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <i className="fas fa-paper-plane text-lg transform group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform duration-200"></i>
                )}
              </button>
            </div>
          </div>
          
          {/* 🎆 Ultra-Enhanced Mobile Footer with Beautiful Styling */}
          <div className="flex items-center justify-between mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-gradient-to-r from-gray-50 to-white rounded-t-xl">
            <div className="flex items-center space-x-2 text-sm">
              <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-indigo-100 px-3 py-2 rounded-full border border-blue-200">
                <i className="fas fa-sparkles text-blue-600"></i>
                <span className="text-blue-800 font-bold">IslamicAI v2.0</span>
              </div>
              <span className="text-gray-600 hidden sm:inline">-</span>
              <span className="text-gray-600 hidden sm:inline font-medium">Ultra-Advanced AI with Self-Learning</span>
              <span className="text-gray-600 sm:hidden font-medium">Ultra-Advanced AI</span>
            </div>
            
            {/* 🧠 Enhanced Quick Intelligence Stats */}
            {learningInsights && (
              <div className="flex items-center space-x-3 text-sm">
                <div className="flex items-center space-x-2 bg-gradient-to-r from-emerald-100 to-green-100 px-3 py-1.5 rounded-full border border-emerald-200">
                  <i className="fas fa-brain text-emerald-600"></i>
                  <span className="hidden sm:inline text-emerald-800 font-medium">Intelligence Level: </span>
                  <span className="font-bold text-emerald-800">Level {Math.floor((learningInsights.intelligenceGain || 0) * 20) + 1}</span>
                </div>
                {sessionAnalytics && sessionAnalytics.messageCount > 5 && (
                  <div className="flex items-center space-x-1 bg-gradient-to-r from-blue-100 to-indigo-100 px-3 py-1.5 rounded-full border border-blue-200">
                    <i className="fas fa-comments text-blue-600"></i>
                    <span className="font-bold text-blue-800">{sessionAnalytics.messageCount} msgs</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;