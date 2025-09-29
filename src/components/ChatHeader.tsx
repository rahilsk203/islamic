import { BookOpenIcon, PlusIcon, Menu, UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { memo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/AuthModal';
import { UserProfile } from '@/components/UserProfile';

const ChatHeaderBase = ({ onToggleSidebar, onNewChat, backendUrl }: { onToggleSidebar?: () => void; onNewChat?: () => void; backendUrl: string }) => {
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <>
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
          {user ? (
            <Button 
              variant="ghost" 
              size="icon"
              className="text-muted-foreground hover:text-foreground hover:bg-gray-100 rounded-full p-2"
              onClick={() => setProfileOpen(true)}
            >
              <UserIcon className="w-5 h-5" />
            </Button>
          ) : (
            <Button 
              variant="ghost" 
              className="gap-2 text-muted-foreground hover:text-foreground hover:bg-gray-100 rounded-full px-3 py-2"
              onClick={() => {
                setAuthMode('login');
                setAuthModalOpen(true);
              }}
            >
              <UserIcon className="w-5 h-5" />
              <span>Login</span>
            </Button>
          )}
          
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
      
      <AuthModal 
        open={authModalOpen} 
        onOpenChange={(open) => {
          setAuthModalOpen(open);
          // Reset to login mode when closing
          if (!open) {
            setAuthMode('login');
          }
        }} 
        mode={authMode}
        backendUrl={backendUrl}
      />
      
      {user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" style={{ display: profileOpen ? 'flex' : 'none' }}>
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon"
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground rounded-full p-2"
              onClick={() => setProfileOpen(false)}
            >
              <span className="text-2xl">×</span>
            </Button>
            <UserProfile backendUrl={backendUrl} />
          </div>
        </div>
      )}
    </>
  );
};
const ChatHeader = memo(ChatHeaderBase);

export default ChatHeader;