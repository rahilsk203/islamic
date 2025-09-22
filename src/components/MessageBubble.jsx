import { useState, useEffect, useRef } from 'react';
import { formatTimestamp } from '../utils/timestamp';

const MessageBubble = ({ message, isStreaming = false }) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [showCursor, setShowCursor] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    if (isStreaming && message.sender === 'ai') {
      // For streaming AI messages, show content as it comes
      setDisplayedContent(message.content || '');
      setShowCursor(true);
    } else if (message.isStreaming === false && message.sender === 'ai') {
      // For completed AI messages, show full content without cursor
      setDisplayedContent(message.content || '');
      setShowCursor(false);
    } else {
      // For user messages or non-streaming messages, show content directly
      setDisplayedContent(message.content || '');
      setShowCursor(false);
    }
  }, [message.content, isStreaming, message.isStreaming, message.sender]);

  const formatContent = (content) => {
    // 🎨 Ultra-Enhanced content formatting with superior readability
    const formatText = (text) => {
      // Convert markdown-style formatting to HTML with enhanced styling
      return text
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900 bg-yellow-100 px-1 rounded">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="italic text-gray-800 font-medium">$1</em>')
        .replace(/`(.*?)`/g, '<code class="bg-gray-200 text-gray-900 px-2 py-1 rounded-md text-sm font-mono border border-gray-300">$1</code>')
        .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-gray-900 mt-4 mb-3 flex items-center bg-gradient-to-r from-amber-50 to-orange-50 p-3 rounded-lg border-l-4 border-amber-400"><i class="fas fa-star text-amber-600 mr-3"></i><span>$1</span></h3>')
        .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-gray-900 mt-5 mb-4 flex items-center bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border-l-4 border-blue-500"><i class="fas fa-bookmark text-blue-600 mr-3"></i><span>$1</span></h2>')
        .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-gray-900 mt-6 mb-5 flex items-center bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border-l-4 border-purple-600"><i class="fas fa-crown text-purple-600 mr-3"></i><span>$1</span></h1>')
        .replace(/^• (.*$)/gim, '<div class="flex items-start space-x-3 my-3 p-2 bg-green-50 rounded-lg border-l-3 border-green-400"><i class="fas fa-check-circle text-green-600 mt-1 text-sm"></i><span class="text-gray-800 leading-relaxed">$1</span></div>')
        .replace(/^- (.*$)/gim, '<div class="flex items-start space-x-3 my-3 p-2 bg-gray-50 rounded-lg border-l-3 border-gray-400"><i class="fas fa-circle text-gray-500 mt-1 text-xs"></i><span class="text-gray-800 leading-relaxed">$1</span></div>')
        .replace(/^\d+\. (.*$)/gim, '<div class="flex items-start space-x-3 my-3 p-2 bg-blue-50 rounded-lg border-l-3 border-blue-400"><i class="fas fa-hashtag text-blue-600 mt-1 text-sm"></i><span class="text-gray-800 leading-relaxed">$1</span></div>')
        // 🕌 Enhanced Islamic terms with beautiful styling
        .replace(/(Assalamu Alaikum|السلام عليكم)/gi, '<span class="inline-flex items-center bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 font-bold px-3 py-1 rounded-full border border-emerald-300 text-sm"><i class="fas fa-peace text-emerald-600 mr-1"></i>$1</span>')
        .replace(/(Allah|الله)/gi, '<span class="inline-flex items-center bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-900 font-bold px-3 py-1 rounded-full border border-blue-300 text-sm"><i class="fas fa-crescent-moon text-blue-600 mr-1"></i>$1</span>')
        .replace(/(Qur\'an|Quran|قرآن)/gi, '<span class="inline-flex items-center bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-900 font-bold px-3 py-1 rounded-full border border-emerald-300 text-sm"><i class="fas fa-book-open text-emerald-600 mr-1"></i>$1</span>')
        .replace(/(Hadith|حديث)/gi, '<span class="inline-flex items-center bg-gradient-to-r from-purple-100 to-violet-100 text-purple-900 font-bold px-3 py-1 rounded-full border border-purple-300 text-sm"><i class="fas fa-scroll text-purple-600 mr-1"></i>$1</span>')
        .replace(/(Prophet|نبي|Muhammad|محمد)/gi, '<span class="inline-flex items-center bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-900 font-bold px-3 py-1 rounded-full border border-amber-300 text-sm"><i class="fas fa-star text-amber-600 mr-1"></i>$1</span>')
        .replace(/(Insha\'Allah|إن شاء الله)/gi, '<span class="inline-flex items-center bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-900 font-bold px-3 py-1 rounded-full border border-indigo-300 text-sm"><i class="fas fa-hands-praying text-indigo-600 mr-1"></i>$1</span>')
        .replace(/(Alhamdulillah|الحمد لله)/gi, '<span class="inline-flex items-center bg-gradient-to-r from-green-100 to-emerald-100 text-green-900 font-bold px-3 py-1 rounded-full border border-green-300 text-sm"><i class="fas fa-heart text-green-600 mr-1"></i>$1</span>')
        .replace(/(SubhanAllah|سبحان الله)/gi, '<span class="inline-flex items-center bg-gradient-to-r from-cyan-100 to-teal-100 text-cyan-900 font-bold px-3 py-1 rounded-full border border-cyan-300 text-sm"><i class="fas fa-sun text-cyan-600 mr-1"></i>$1</span>')
        .replace(/(MashaAllah|ما شاء الله)/gi, '<span class="inline-flex items-center bg-gradient-to-r from-rose-100 to-pink-100 text-rose-900 font-bold px-3 py-1 rounded-full border border-rose-300 text-sm"><i class="fas fa-sparkles text-rose-600 mr-1"></i>$1</span>')
        .replace(/(Ameen|آمين)/gi, '<span class="inline-flex items-center bg-gradient-to-r from-orange-100 to-amber-100 text-orange-900 font-bold px-3 py-1 rounded-full border border-orange-300 text-sm"><i class="fas fa-praying-hands text-orange-600 mr-1"></i>$1</span>')
        // 📰 News source highlighting for better readability
        .replace(/(Source: Al Jazeera)/gi, '<div class="inline-flex items-center bg-gradient-to-r from-red-50 to-red-100 text-red-800 font-semibold px-3 py-1 rounded-full border border-red-200 text-xs mt-2"><i class="fas fa-newspaper text-red-600 mr-1"></i>$1</div>')
        .replace(/(Gaza|Palestine|Syria|Lebanon)/gi, '<span class="inline-flex items-center bg-gray-100 text-gray-800 font-semibold px-2 py-1 rounded border text-sm"><i class="fas fa-map-marker-alt text-gray-600 mr-1"></i>$1</span>')
        // 🌟 Enhanced emoji and symbol formatting
        .replace(/(📰|🏛️|⚖️|💚|😢|🇵🇸|🇸🇾|🇱🇧|##)/g, '<span class="text-lg mx-1">$1</span>');
    };

    return content
      .split('\n')
      .map((line, index) => {
        const formattedLine = formatText(line.trim());
        
        // Skip empty lines but preserve spacing
        if (!formattedLine.trim()) {
          return <div key={index} className="h-2" />;
        }
        
        return (
          <div 
            key={index} 
            className="mb-3 last:mb-0 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formattedLine }}
          />
        );
      });
  };

  const isWelcomeMessage = message.sender === 'ai' && 
    (message.content.includes('Assalamu Alaikum') && 
     message.content.includes('IslamicAI, your Islamic Scholar AI assistant'));

  if (isWelcomeMessage) {
    return (
      <div className="flex justify-start mb-4 sm:mb-6 px-2 sm:px-3">
        <div className="flex flex-row max-w-full w-full">
          {/* 🎆 Enhanced Welcome Avatar */}
          <div className="mx-2 sm:mx-3 flex-shrink-0 mr-3 sm:mr-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-emerald-400 via-green-500 to-green-600 shadow-lg border-3 border-emerald-200 animate-pulse">
              <i className="text-white text-lg sm:text-xl fas fa-robot"></i>
            </div>
          </div>
          
          {/* 🌟 Enhanced Welcome Message Container */}
          <div className="flex flex-col items-start flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-3">
              <span className="text-lg font-bold text-emerald-700 bg-gradient-to-r from-emerald-100 to-green-100 px-4 py-2 rounded-full border-2 border-emerald-300 shadow-md">
                🤖 IslamicAI Scholar Assistant
              </span>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full hidden sm:inline border border-gray-200">
                {formatTimestamp(message.timestamp)}
              </span>
            </div>
            
            <div className="relative w-full">
              <div className="relative rounded-3xl px-6 py-5 sm:px-7 sm:py-6 max-w-full break-words bg-gradient-to-br from-white via-emerald-50 to-green-50 border-2 border-emerald-200 rounded-bl-md shadow-xl hover:shadow-2xl transition-all duration-300">
                {/* 🌈 Beautiful Welcome Content */}
                <div className="whitespace-pre-wrap leading-relaxed text-base sm:text-lg text-gray-800 font-medium">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-xl text-emerald-700">
                      <i className="fas fa-peace text-emerald-600"></i>
                      <span className="font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                        Assalamu Alaikum! 👋
                      </span>
                    </div>
                    
                    <div className="bg-white/80 rounded-lg p-4 border border-emerald-200">
                      <p className="text-gray-800 leading-relaxed">
                        Main <span className="font-bold text-emerald-700">IslamicAI</span> hun, aapka Islamic Scholar AI assistant. 
                        Aaj main aapki <span className="font-bold text-blue-700">kaise madad kar sakta hun</span>? 📚
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-4">
                      <span className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm border border-blue-200">
                        <i className="fas fa-book-open mr-1"></i> Qur'an
                      </span>
                      <span className="inline-flex items-center bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm border border-purple-200">
                        <i className="fas fa-scroll mr-1"></i> Hadith
                      </span>
                      <span className="inline-flex items-center bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm border border-amber-200">
                        <i className="fas fa-balance-scale mr-1"></i> Fiqh
                      </span>
                      <span className="inline-flex items-center bg-rose-100 text-rose-800 px-3 py-1 rounded-full text-sm border border-rose-200">
                        <i className="fas fa-star mr-1"></i> Seerah
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-3 sm:mb-4 px-1 sm:px-2`}>
      <div className={`flex ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} max-w-[95%] sm:max-w-[88%] lg:max-w-4xl w-full`}>
        {/* 🎨 Enhanced Avatar with Better Visibility */}
        <div className={`mx-2 sm:mx-3 flex-shrink-0 ${message.sender === 'user' ? 'ml-3 sm:ml-4' : 'mr-3 sm:mr-4'}`}>
          <div className={`w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full flex items-center justify-center shadow-lg border-2 transition-all duration-200 hover:scale-105 ${
            message.sender === 'user' 
              ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 border-blue-300' 
              : 'bg-gradient-to-br from-emerald-500 via-green-600 to-green-700 border-emerald-300'
          }`}>
            <i className={`text-white text-sm ${message.sender === 'user' ? 'fas fa-user' : 'fas fa-robot'}`}></i>
          </div>
        </div>
        
        {/* 💬 Enhanced Message Content with Superior Readability */}
        <div className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'} flex-1 min-w-0`}>
          <div className="flex items-center space-x-3 mb-2">
            {message.sender === 'ai' ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">🤖 IslamicAI</span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full hidden sm:inline">
                  {formatTimestamp(message.timestamp)}
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">👤 You</span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full hidden sm:inline">
                  {formatTimestamp(message.timestamp)}
                </span>
              </div>
            )}
          </div>
          
          <div className="relative w-full max-w-full">
            <div 
              className={`relative rounded-2xl px-4 py-4 sm:px-5 sm:py-4 max-w-full break-words transition-all duration-300 shadow-lg hover:shadow-xl border-2 ${
                message.sender === 'user'
                  ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white rounded-br-md border-blue-400 shadow-blue-200'
                  : 'bg-gradient-to-br from-white via-gray-50 to-gray-100 border-gray-300 rounded-bl-md shadow-gray-200 backdrop-blur-sm'
              }`}
            >
              {/* 📱 Enhanced Mobile/Desktop Typography */}
              <div ref={contentRef} className={`whitespace-pre-wrap leading-relaxed text-sm sm:text-base lg:text-lg font-medium ${
                message.sender === 'user' ? 'text-white' : 'text-gray-900'
              }`}>
                {isStreaming && message.sender === 'ai' && (!message.content || message.content === "") ? (
                  <div className="flex items-center space-x-3 p-2">
                    <div className="flex space-x-1">
                      <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce shadow-md"></div>
                      <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce shadow-md" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce shadow-md" style={{animationDelay: '0.4s'}}></div>
                    </div>
                    <span className="text-base font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">🤔 AI soch raha hai...</span>
                  </div>
                ) : (
                  <>
                    {formatContent(displayedContent)}
                    {showCursor && message.sender === 'ai' && (
                      <span className="ml-2 animate-pulse text-emerald-600 font-bold text-lg">▌</span>
                    )}
                    
                    {/* ✅ Enhanced completion indicator for AI messages */}
                    {message.sender === 'ai' && !isStreaming && !message.isStreaming && displayedContent && (
                      <div className="mt-3 pt-2 border-t border-gray-200 text-xs text-gray-500 text-right flex items-center justify-end space-x-1">
                        <i className="fas fa-check-circle text-emerald-500"></i>
                        <span className="hidden sm:inline font-medium">Response Complete</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;