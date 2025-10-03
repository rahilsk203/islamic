import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { 
  PlusIcon, 
  SearchIcon, 
  BookOpenIcon, 
  StarIcon,
  CalendarIcon,
  UserIcon,
  SettingsIcon,
  HelpCircleIcon,
  LogOutIcon,
  ChevronRightIcon,
  XIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { readSessionsIndex } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import HelpFAQ from '@/components/HelpFAQ';

const ChatSidebar = ({ isOpen, onClose, onNewChat, onSelectSession, onSendMessage }: { isOpen?: boolean; onClose?: () => void; onNewChat?: () => void; onSelectSession?: (id: string) => void; onSendMessage?: (message: string) => void; }) => {
  const { user, logout, token, isGuest } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [sessions, setSessions] = useState(readSessionsIndex());
  const deferredQuery = useDeferredValue(searchQuery);
  const [isMobile, setIsMobile] = useState(false);
  const [showHelpFAQ, setShowHelpFAQ] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      if (typeof window !== 'undefined') {
        const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        setIsMobile(mobile);
      }
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  useEffect(() => {
    // refresh from storage when sidebar opens
    if (isOpen) {
      try { setSessions(readSessionsIndex()); } catch {}
    }
  }, [isOpen]);

  const menuItems = [
    { icon: BookOpenIcon, label: 'Quran', hasSubMenu: false },
    { icon: StarIcon, label: 'Hadith', hasSubMenu: false },
    { icon: CalendarIcon, label: 'Prayer Times', hasSubMenu: false },
    { icon: UserIcon, label: 'Seerah', hasSubMenu: false },
  ];

  // Check if user is a real authenticated user (not a guest)
  const isAuthenticatedUser = user && token && token !== 'test-token' && !isGuest;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Help & FAQ Modal */}
      {showHelpFAQ && <HelpFAQ onClose={() => setShowHelpFAQ(false)} />}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 lg:z-40
        w-72 bg-white h-screen flex flex-col border-r border-sidebar-border sidebar-shadow
        transition-transform duration-300 ease-in-out lg:translate-x-0 sidebar-transition
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:z-10 mobile-sidebar
      `}>
        {/* Logo - Fixed at top */}
        <div className="p-5 flex items-center gap-3 border-b border-sidebar-border flex-shrink-0 relative">
          <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
            <BookOpenIcon className="w-7 h-7 text-white" />
          </div>
          <div className="hidden sm:block">
            <h2 className="text-xl font-bold text-foreground">IslamicAI</h2>
            <p className="text-sm text-sidebar-text-muted">Scholar Assistant</p>
          </div>
          <div className="block sm:hidden">
            <h2 className="text-lg font-bold text-foreground">IslamicAI</h2>
          </div>
          {/* Close button for mobile */}
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon"
              className="ml-auto lg:hidden text-muted-foreground hover:text-foreground hover:bg-gray-100 rounded-full p-2 absolute top-4 right-4"
              onClick={onClose}
            >
              <XIcon className="w-6 h-6" />
            </Button>
          )}
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto pt-2">
          {/* New Chat Button */}
          <div className="px-4 py-3">
            <Button 
              variant="outline" 
              className="w-full justify-between gap-3 h-12 hover:bg-green-50 text-sidebar-text border-green-200 hover:border-green-300 rounded-xl shadow-sm sidebar-button"
              onClick={onNewChat}
            >
              <div className="flex items-center gap-2">
                <PlusIcon className="w-5 h-5" />
                <span className="font-medium">New Chat</span>
              </div>
              <ChevronRightIcon className="w-5 h-5" />
            </Button>
          </div>

          {/* Search */}
          <div className="px-4 mb-4">
            <div className="relative">
              <Input
                placeholder="Search topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 sidebar-search-input h-12 transition-all duration-200 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sidebar-text-muted hover:text-sidebar-text transition-colors duration-200"
                  aria-label="Clear search"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Menu Items */}
          <div className="px-3 mb-6">
            <h3 className="text-xs font-semibold text-sidebar-text-muted uppercase tracking-wider px-3 mb-3">
              Islamic Resources
            </h3>
            <div className="space-y-1">
              {menuItems.map((item, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-between gap-3 h-12 mb-1 hover:bg-green-50 text-sidebar-text rounded-xl transition-colors sidebar-button"
                  onClick={() => {
                    // Handle menu item clicks
                    let prompt = '';
                    switch(item.label) {
                      case 'Quran':
                        prompt = 'Tell me about the Quran and its significance in Islam';
                        break;
                      case 'Hadith':
                        prompt = 'Explain the importance of Hadith in Islamic teachings';
                        break;
                      case 'Prayer Times':
                        prompt = 'Provide information about the five daily prayers in Islam and their timings';
                        break;
                      case 'Seerah':
                        prompt = 'Tell me about the life of Prophet Muhammad (PBUH)';
                        break;
                      default:
                        prompt = `Tell me about ${item.label}`;
                    }
                    
                    // Start a new chat
                    if (onNewChat) {
                      onNewChat();
                    }
                    
                    // Send the prompt after a short delay to ensure the new chat is ready
                    setTimeout(() => {
                      if (onSendMessage) {
                        onSendMessage(prompt);
                      }
                    }, 100);
                    
                    // Close sidebar on mobile
                    if (isMobile) {
                      onClose?.();
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <ChevronRightIcon className="w-5 h-5 text-sidebar-text-muted" />
                </Button>
              ))}
            </div>
          </div>

          {/* Chat History */}
          <div className="px-3 mb-6">
            <div className="mb-3">
              <h3 className="text-xs font-semibold text-sidebar-text-muted uppercase tracking-wider px-3">
                Recent Chats
              </h3>
            </div>
            <div className="space-y-1">
              {useMemo(() => {
                const q = deferredQuery.trim().toLowerCase();
                const list = q ? sessions.filter(s => s.title.toLowerCase().includes(q)) : sessions;
                return list;
              }, [sessions, deferredQuery]).map((s, index) => (
                <Button
                  key={s.id}
                  variant="ghost"
                  className={`w-full justify-start gap-3 h-12 text-sm hover:bg-green-50 text-sidebar-text text-left truncate rounded-xl transition-colors sidebar-button ${
                    index === 0 ? 'bg-green-50 border border-green-200' : ''
                  }`}
                  onClick={() => {
                    onSelectSession?.(s.id);
                    // Close sidebar on mobile after selecting
                    if (isMobile) {
                      onClose?.();
                    }
                  }}
                >
                  <BookOpenIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="truncate font-medium">{s.title}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* User Profile & Settings */}
          <div className="px-3 pb-6 mt-auto">
            <div className="space-y-1">
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 h-12 hover:bg-gray-100 text-sidebar-text rounded-xl transition-colors sidebar-button"
                onClick={() => {
                  setShowHelpFAQ(true);
                  // Close sidebar on mobile after clicking
                  if (isMobile) {
                    onClose?.();
                  }
                }}
              >
                <HelpCircleIcon className="w-5 h-5" />
                <span className="font-medium">Help & FAQ</span>
              </Button>
              
              {/* Show Sign Out button only for authenticated users */}
              {isAuthenticatedUser && (
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-3 h-12 hover:bg-red-50 text-red-600 rounded-xl transition-colors sidebar-button"
                  onClick={logout}
                >
                  <LogOutIcon className="w-5 h-5" />
                  <span className="font-medium">Sign Out</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatSidebar;