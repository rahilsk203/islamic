import { BookOpenIcon, PlusIcon, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { memo } from 'react';

const ChatHeaderBase = ({ onToggleSidebar, onNewChat }: { onToggleSidebar?: () => void; onNewChat?: () => void }) => {
  return (
    <header className="h-16 bg-white border-b border-border flex items-center justify-between px-4 shadow-sm">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <Button 
          variant="ghost" 
          size="icon"
          className="lg:hidden text-muted-foreground hover:text-foreground hover:bg-gray-100 rounded-full p-2"
          onClick={onToggleSidebar}
        >
          <Menu className="w-6 h-6" />
        </Button>
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
            <BookOpenIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">IslamicAI</h1>
            <p className="text-xs text-muted-foreground -mt-1">Islamic Scholar Assistant</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          className="gap-2 text-muted-foreground hover:text-foreground hover:bg-gray-100 rounded-full px-3 py-2 hidden sm:flex"
          onClick={onNewChat}
        >
          <PlusIcon className="w-5 h-5" />
          <span>New Chat</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon"
          className="text-muted-foreground hover:text-foreground hover:bg-gray-100 rounded-full p-2 sm:hidden"
          onClick={onNewChat}
        >
          <PlusIcon className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
};
const ChatHeader = memo(ChatHeaderBase);

export default ChatHeader;