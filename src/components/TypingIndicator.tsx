import { BookOpenIcon } from 'lucide-react';
import { memo } from 'react';

const TypingIndicatorBase = () => {
  return (
    <div className="group">
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-green-600 text-white">
          <BookOpenIcon className="w-5 h-5" />
        </div>
        
        {/* Typing Animation */}
        <div className="flex-1 max-w-[85%]">
          <div className="rounded-2xl px-4 py-3 bg-white border border-gray-200 shadow-sm">
             <div className="flex items-center space-x-1">
               <div className="flex space-x-1">
                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
const TypingIndicator = memo(TypingIndicatorBase);

export default TypingIndicator;
