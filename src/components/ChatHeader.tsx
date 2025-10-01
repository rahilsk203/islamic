import { BookOpenIcon, PlusIcon, Menu, UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { memo, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/AuthModal';
import { UserProfile } from '@/components/UserProfile';

const ChatHeaderBase = ({ onToggleSidebar, onNewChat, backendUrl }: { onToggleSidebar?: () => void; onNewChat?: () => void; backendUrl: string }) => {
  const { user, token, isGuest } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [profileOpen, setProfileOpen] = useState(false);

  // Listen for custom event to open auth modal
  useEffect(() => {
    const handleOpenAuthModal = (event: CustomEvent) => {
      setAuthModalOpen(true);
      setAuthMode(event.detail.mode || 'login');
    };

    window.addEventListener('openAuthModal', handleOpenAuthModal as EventListener);
    return () => {
      window.removeEventListener('openAuthModal', handleOpenAuthModal as EventListener);
    };
  }, []);

  // Check if user is a real authenticated user (not a guest)
  const isAuthenticatedUser = user && token && token !== 'test-token' && !isGuest;

  // Handle profile icon click
  const handleProfileClick = () => {
    if (isAuthenticatedUser) {
      // Show profile for authenticated users
      setProfileOpen(true);
    } else {
      // Show login UI for non-authenticated users
      setAuthMode('login');
      setAuthModalOpen(true);
    }
  };

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
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-foreground">IslamicAI</h1>
              <p className="text-xs text-muted-foreground -mt-1">Islamic Scholar Assistant</p>
            </div>
            <div className="block sm:hidden">
              <h1 className="text-lg font-bold text-foreground">IslamicAI</h1>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Profile icon - shows login UI for guests, profile for authenticated users */}
          <Button 
            variant="ghost" 
            size="icon"
            className="text-muted-foreground hover:text-foreground hover:bg-gray-100 rounded-full p-2 relative"
            onClick={handleProfileClick}
          >
            <UserIcon className="w-5 h-5" />
            {/* Show indicator for guest users */}
            {!isAuthenticatedUser && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </Button>
          
          <Button 
            variant="ghost" 
            className="gap-2 text-muted-foreground hover:text-foreground hover:bg-gray-100 rounded-full px-3 py-2"
            onClick={onNewChat}
          >
            <PlusIcon className="w-5 h-5" />
            <span className="hidden sm:inline">New Chat</span>
          </Button>
        </div>
      </header>
      
      {/* Show auth modal for guest users or when explicitly opened */}
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
      
      {isAuthenticatedUser && profileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl my-8">
            <Button 
              variant="ghost" 
              size="icon"
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground rounded-full p-2 z-10"
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