import { useState, useEffect } from 'react';
import { deleteChatSession, searchChatHistory } from '../utils/api';
import { getRelativeTime } from '../utils/timestamp';

const Sidebar = ({ isOpen, toggleSidebar, recentChats, startNewChat, loadChatSession, currentSessionId }) => {
  const [activeSection, setActiveSection] = useState('chats');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim()) {
      const results = searchChatHistory(searchQuery);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleDeleteChat = (chatId, event) => {
    event.stopPropagation();
    if (window.confirm('Are you sure you want to delete this chat?')) {
      deleteChatSession(chatId);
      // Refresh the recent chats list
      window.location.reload();
    }
  };

  const handleChatClick = (chatId) => {
    loadChatSession(chatId);
    // Close sidebar on mobile after selecting chat
    if (window.innerWidth < 768) {
      toggleSidebar();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const formatDate = (dateString) => {
    return getRelativeTime(dateString);
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      <div 
        className={`md:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={toggleSidebar}
      ></div>

      {/* Sidebar - ChatGPT Style */}
      <aside 
        className={`bg-gray-50 border-r border-gray-200 w-64 flex-shrink-0 transform transition-all duration-300 ease-in-out z-50
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 md:static fixed inset-y-0 left-0`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-sm bg-green-500 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="2"/>
                    <path d="M12 16V12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="12" cy="8" r="1" fill="white"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-800">IslamicAI</h2>
                </div>
              </div>
              <button 
                onClick={toggleSidebar}
                className="md:hidden p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
                aria-label="Close sidebar"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            
            <button 
              onClick={startNewChat}
              className="w-full flex items-center space-x-3 p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span className="text-sm font-medium text-gray-700">New chat</span>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-3">
            {/* Search Bar */}
            <div className="mb-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-6 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent"
                />
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-1">
              {/* Show search results or recent chats */}
              {(searchQuery ? searchResults : recentChats).length > 0 ? (
                (searchQuery ? searchResults : recentChats).map(chat => (
                  <div 
                    key={chat.id}
                    onClick={() => handleChatClick(chat.id)}
                    className={`group p-2 rounded-lg cursor-pointer transition-colors flex items-center justify-between ${
                      currentSessionId === chat.id 
                        ? 'bg-gray-200' 
                        : 'hover:bg-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <div className="text-gray-700">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium text-sm truncate ${
                          currentSessionId === chat.id ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {chat.title}
                        </div>
                      </div>
                    </div>
                    
                    {/* Delete Button */}
                    <button
                      onClick={(e) => handleDeleteChat(chat.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 hover:bg-red-100 rounded"
                      title="Delete Chat"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center mx-auto mb-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-500">
                      <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm">
                    {searchQuery ? 'No chats found' : 'No recent chats'}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Footer */}
          <div className="p-3 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              IslamicAI v2.0
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;