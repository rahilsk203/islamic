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
  ChevronRightIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { readSessionsIndex } from '@/lib/utils';

const ChatSidebar = ({ isOpen, onClose, onNewChat, onSelectSession }: { isOpen?: boolean; onClose?: () => void; onNewChat?: () => void; onSelectSession?: (id: string) => void }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sessions, setSessions] = useState(readSessionsIndex());
  const deferredQuery = useDeferredValue(searchQuery);

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

  const chatHistory = [
    'Understanding Tawheed',
    'Prayer Guidelines',
    'Ramadan Preparation',
    'Zakat Calculation',
    'Hajj Requirements',
    'Islamic Finance',
    'Family Relations',
    'Character Development'
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
        w-72 bg-white h-screen flex flex-col border-r border-sidebar-border shadow-lg
        transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo - Fixed at top */}
        <div className="p-5 flex items-center gap-3 border-b border-sidebar-border flex-shrink-0">
          <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
            <BookOpenIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">IslamicAI</h2>
            <p className="text-sm text-sidebar-text-muted">Scholar Assistant</p>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          {/* New Chat Button */}
          <div className="px-3 py-4">
            <Button 
              variant="outline" 
              className="w-full justify-between gap-3 h-12 hover:bg-green-50 text-sidebar-text border-green-200 hover:border-green-300"
              onClick={onNewChat}
            >
              <div className="flex items-center gap-2">
                <PlusIcon className="w-5 h-5" />
                New Chat
              </div>
              <ChevronRightIcon className="w-5 h-5" />
            </Button>
          </div>

          {/* Search */}
          <div className="px-3 mb-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-sidebar-text-muted" />
              <Input
                placeholder="Search topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-50 border-none h-12 text-sidebar-text placeholder:text-sidebar-text-muted hover:bg-gray-100 focus:bg-white focus:ring-2 focus:ring-green-500 rounded-xl"
              />
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
                  className="w-full justify-between gap-3 h-12 mb-1 hover:bg-green-50 text-sidebar-text rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-green-600" />
                    </div>
                    {item.label}
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
                  className={`w-full justify-start gap-3 h-12 text-sm hover:bg-green-50 text-sidebar-text text-left truncate rounded-xl ${
                    index === 0 ? 'bg-green-50 border border-green-200' : ''
                  }`}
                  onClick={() => onSelectSession?.(s.id)}
                >
                  <BookOpenIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="truncate">{s.title}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* User Profile & Settings */}
          <div className="px-3 pb-6">
            <div className="space-y-1">
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 h-12 hover:bg-gray-100 text-sidebar-text rounded-xl"
              >
                <SettingsIcon className="w-5 h-5" />
                Settings
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 h-12 hover:bg-gray-100 text-sidebar-text rounded-xl"
              >
                <HelpCircleIcon className="w-5 h-5" />
                Help & FAQ
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 h-12 hover:bg-gray-100 text-sidebar-text rounded-xl"
              >
                <LogOutIcon className="w-5 h-5" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatSidebar;