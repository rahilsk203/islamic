import { useState, useEffect, useRef, useCallback } from 'react';
import { debounce, readSession, readSessionsIndex, writeSession, generateSessionTitleFromMessage } from '@/lib/utils';
import ChatSidebar from '@/components/ChatSidebar';
import ChatHeader from '@/components/ChatHeader';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import TypingIndicator from '@/components/TypingIndicator';
import { useMobileKeyboard } from '@/hooks';

interface Message {
  id: number;
  message: string;
  isUser: boolean;
}

interface LocationInfo {
  city?: string;
  region?: string;
  country?: string;
  source?: string;
  isDefault?: boolean;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, message: "Hey there! How can I help you today? 😊", isUser: false }
  ]);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState('islamicai-session-' + Date.now());
  const [sessionTitle, setSessionTitle] = useState<string>('New Chat');
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);
  const [manualIP, setManualIP] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Connecting to backend...');
  const [editing, setEditing] = useState<{ index: number; text: string } | null>(null);
  const { isKeyboardOpen } = useMobileKeyboard();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const activeAbortRef = useRef<AbortController | null>(null);

  // Configuration - Update this to match your backend URL
  const BACKEND_URL = 'https://islamicai.sohal70760.workers.dev';

  // Track whether user is near bottom to avoid forced scroll during read
  const isUserNearBottomRef = useRef(true);
  const lastScrollTopRef = useRef(0);

  // Determine if user is near bottom
  const evaluateIsNearBottom = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return true;
    const thresholdPx = 120; // allow some space
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    return distanceFromBottom <= thresholdPx;
  }, []);

  // Scroll handler to update near-bottom state
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const onScroll = () => {
      isUserNearBottomRef.current = evaluateIsNearBottom();
      lastScrollTopRef.current = container.scrollTop;
    };
    container.addEventListener('scroll', onScroll, { passive: true });
    // initialize
    isUserNearBottomRef.current = evaluateIsNearBottom();
    return () => container.removeEventListener('scroll', onScroll);
  }, [evaluateIsNearBottom]);

  // Smooth auto-scroll to bottom
  const scrollToBottom = useCallback((smooth: boolean = true) => {
    if (!isUserNearBottomRef.current) return;
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    // Only scroll to bottom if keyboard is not open to prevent jumping
    if (!isKeyboardOpen) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom, isKeyboardOpen]);

  // Debounced persistence of session
  const persistSessionDebounced = useRef(
    debounce((sid: string, title: string, msgs: Message[]) => {
      try {
        writeSession({ id: sid, title, updatedAt: Date.now(), messages: msgs });
      } catch {}
    }, 300)
  );

  useEffect(() => {
    persistSessionDebounced.current(sessionId, sessionTitle, messages);
  }, [sessionId, sessionTitle, messages]);

  // Load last session from storage and check connection on mount
  useEffect(() => {
    // Prefer most recent stored session if exists
    try {
      const index = readSessionsIndex();
      if (index && index.length > 0) {
        const latest = index[0];
        const existing = readSession(latest.id);
        if (existing && existing.messages && existing.messages.length > 0) {
          setSessionId(existing.id);
          setSessionTitle(existing.title || 'New Chat');
          setMessages(existing.messages as any);
        }
      }
    } catch {}
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/health`, {
        method: 'GET',
        mode: 'cors'
      });
      
      if (response.ok) {
        try {
          const data = await response.json();
          setIsConnected(true);
          setConnectionStatus(`Connected to backend (v${data.status})`);
        } catch (parseError) {
          setIsConnected(true);
          setConnectionStatus('Connected to backend');
        }
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error: any) {
      console.error('Connection error:', error);
      setConnectionStatus(`Connection failed: ${error.message}`);
      
      // Retry connection after 10 seconds
      setTimeout(checkConnection, 10000);
    }
  };

  const newSession = useCallback(() => {
    const newSessionId = 'islamicai-session-' + Date.now();
    setSessionId(newSessionId);
    setSessionTitle('New Chat');
    setLocationInfo(null);
    setManualIP(null);
    setMessages([
      { id: 1, message: "New session started. Previous conversation history has been cleared.", isUser: false }
    ]);
  }, []);

  const handleSendMessage = useCallback(async (message: string, options?: { echoUser?: boolean; insertAtIndex?: number; force?: boolean }) => {
    if (!message.trim() || (isSending && !options?.force)) return;
    
    // Only create userMessage if we're not in editing mode or echoUser is not false
    let userMessage: Message | null = null;
    if (options?.echoUser !== false) {
      userMessage = {
        id: messages.length + 1,
        message: message.trim(),
        isUser: true
      };
      
      // Auto-generate title from first user message
      if (messages.length <= 1) {
        setSessionTitle(prev => (prev === 'New Chat' ? generateSessionTitleFromMessage(userMessage!.message) : prev));
      }
      // Add user message to chat unless suppressed
      setMessages(prev => [...prev, userMessage!]);
    }
    
    // If forcing (regenerate), abort any in-flight request
    if (options?.force && activeAbortRef.current) {
      try { activeAbortRef.current.abort(); } catch {}
      activeAbortRef.current = null;
    }
    setIsSending(true);
    setShowTyping(true);
    
    // Helper: progressively render text to a specific message id with throttling
    const typeOutText = async (targetId: number, fullText: string) => {
      const charactersPerTick = 8; // larger chunk per frame
      let shown = '';
      let lastCommit = 0;
      const commitIntervalMs = 50; // at most 20 commits/sec
      for (let i = 0; i < fullText.length; i += charactersPerTick) {
        shown += fullText.slice(i, i + charactersPerTick);
        const now = performance.now();
        if (now - lastCommit >= commitIntervalMs || i + charactersPerTick >= fullText.length) {
          setMessages(prev => prev.map(m => m.id === targetId ? { ...m, message: shown } : m));
          lastCommit = now;
        }
        await new Promise(res => setTimeout(res, 16));
      }
    };

    try {
      // Prepare request body
      const requestBody: any = {
        message: message.trim(),
        session_id: sessionId,
        // Disable streaming for simpler handling in test interface
        streaming_options: {
          enableStreaming: false
        }
      };
      
      // Add manual IP if set
      if (manualIP) {
        requestBody.manual_ip = manualIP;
      }
      
      const controller = new AbortController();
      activeAbortRef.current = controller;
      const response = await fetch(`${BACKEND_URL}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/event-stream')) {
          // Handle streaming response with live typing
          const newId = Date.now();
          // once placeholder is added, hide the 3-dot typing indicator
          setShowTyping(false);
          setMessages(prev => {
            const arr = [...prev];
            const insertAt = options?.insertAtIndex ?? arr.length;
            arr.splice(insertAt, 0, { id: newId, message: '', isUser: false });
            return arr;
          });

          const reader = response.body?.getReader();
          const decoder = new TextDecoder('utf-8');
          let buffer = '';
          let pendingChunk = '';
          let lastCommit = 0;
          const commitIntervalMs = 50; // throttle DOM updates
          if (reader) {
            // Read the SSE stream
            while (true) {
              const { value, done } = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true });
              const events = buffer.split('\n\n');
              // Keep the last partial chunk in buffer
              buffer = events.pop() || '';
              for (const evt of events) {
                const lines = evt.split('\n');
                for (const line of lines) {
                  if (line.startsWith('data:')) {
                    const data = line.slice(5).trim();
                    if (!data) continue;
                    if (data === '[DONE]' || data === 'DONE') {
                      break;
                    }
                    // Try to parse JSON; fallback to raw string
                    try {
                      const json = JSON.parse(data);
                      const delta = json.delta || json.content || json.text || '';
                      if (delta) {
                        pendingChunk += delta;
                        const now = performance.now();
                        if (now - lastCommit >= commitIntervalMs) {
                          const commit = pendingChunk;
                          pendingChunk = '';
                          setMessages(prev => prev.map(m => m.id === newId ? { ...m, message: m.message + commit } : m));
                          lastCommit = now;
                        }
                      }
                    } catch {
                      pendingChunk += data;
                      const now = performance.now();
                      if (now - lastCommit >= commitIntervalMs) {
                        const commit = pendingChunk;
                        pendingChunk = '';
                        setMessages(prev => prev.map(m => m.id === newId ? { ...m, message: m.message + commit } : m));
                        lastCommit = now;
                      }
                    }
                  }
                }
              }
            }
            // flush any remaining chunk
            if (pendingChunk) {
              const commit = pendingChunk;
              pendingChunk = '';
              setMessages(prev => prev.map(m => m.id === newId ? { ...m, message: m.message + commit } : m));
            }
          }
        } else {
          // Handle regular JSON response
          const data = await response.json();
          const full = data.reply || data.response || data.message || 'No response received';
          const newId = Date.now();
          // Add empty bot message then type it out
          setShowTyping(false);
          setMessages(prev => {
            const arr = [...prev];
            const insertAt = options?.insertAtIndex ?? arr.length;
            arr.splice(insertAt, 0, { id: newId, message: '', isUser: false });
            return arr;
          });
          await typeOutText(newId, full);
          
          // Show location information if available
          if (data.location_info && !locationInfo) {
            setLocationInfo(data.location_info);
          } else if (data.location_info) {
            // Update location info if it's already displayed
            setLocationInfo(data.location_info);
          }
        }
      } else {
        try {
          const errorData = await response.json();
          const errorMessage: Message = {
            id: messages.length + 2,
            message: `Error: ${errorData.error || 'Failed to get response'}`,
            isUser: false
          };
          setMessages(prev => [...prev, errorMessage]);
        } catch (parseError) {
          const errorMessage: Message = {
            id: messages.length + 2,
            message: `Error: HTTP ${response.status} - ${response.statusText}`,
            isUser: false
          };
          setMessages(prev => [...prev, errorMessage]);
        }
      }
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        // Swallow abort errors silently for regenerate
        return;
      }
      console.error('Error sending message:', error);
      
      // More descriptive error message for CORS issues
      let errorMessage = 'Failed to send message';
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        errorMessage = 'Error: CORS policy is blocking the request. This is a browser security feature.';
      } else {
        errorMessage = `Error: ${error.message || 'Failed to send message'}`;
      }
      
      const errorBotMessage: Message = {
        id: messages.length + 2,
        message: errorMessage,
        isUser: false
      };
      setMessages(prev => [...prev, errorBotMessage]);
    } finally {
      setIsSending(false);
      setShowTyping(false);
      activeAbortRef.current = null;
    }
  }, [isSending, manualIP, sessionId, locationInfo]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditing(null);
  }, []);

  const saveEdit = useCallback((index: number, newMessage: string) => {
    // Remove all messages after the edited message and update the edited message
    setMessages(prev => {
      // Keep messages up to and including the edited message
      const messagesUpToEdited = prev.slice(0, index + 1);
      // Replace the edited message
      messagesUpToEdited[index] = {
        ...messagesUpToEdited[index],
        message: newMessage
      };
      return messagesUpToEdited;
    });
    
    setEditing(null);
    
    // Regenerate AI response for this edited user message
    handleSendMessage(newMessage, { echoUser: false, insertAtIndex: index + 1, force: true });
  }, [handleSendMessage]);

  return (
    <div className="flex min-h-[100dvh] h-full bg-white overflow-hidden">
      <ChatSidebar 
        isOpen={isSidebarOpen} 
        onClose={closeSidebar}
        onNewChat={newSession}
        onSelectSession={(id) => {
          const data = readSession(id);
          if (data) {
            setSessionId(data.id);
            setSessionTitle(data.title || 'New Chat');
            setMessages(data.messages as any);
          }
        }}
      />
      
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <ChatHeader onToggleSidebar={toggleSidebar} onNewChat={newSession} />
        
        {/* Messages Container with Fixed Scrolling */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto bg-white min-h-0 overscroll-contain transform-gpu gpu-boost"
          style={{ marginBottom: isKeyboardOpen ? 'env(safe-area-inset-bottom)' : '0' }}
        >
          <div className="max-w-4xl mx-auto px-4 py-6">
            {messages.map((msg, idx) => {
              const onRegenerate = !msg.isUser
                ? () => {
                    // find the nearest preceding user message
                    for (let i = idx - 1; i >= 0; i--) {
                      if (messages[i].isUser) {
                        // remove current bot message and regenerate in its place without echoing user
                        setMessages(prev => {
                          const arr = [...prev];
                          arr.splice(idx, 1);
                          return arr;
                        });
                        handleSendMessage(messages[i].message, { echoUser: false, insertAtIndex: idx, force: true });
                        break;
                      }
                    }
                  }
                : undefined;
              const onEditUser = msg.isUser
                ? () => {
                    setEditing({ index: idx, text: msg.message });
                  }
                : undefined;
              const onCancelEdit = msg.isUser
                ? () => {
                    cancelEdit();
                  }
                : undefined;
              const onSaveEdit = msg.isUser
                ? (newMessage: string) => {
                    saveEdit(idx, newMessage);
                  }
                : undefined;
              return (
                <div key={msg.id} className="mb-6">
                  <ChatMessage 
                    message={msg.message} 
                    isUser={msg.isUser} 
                    onRegenerate={onRegenerate}
                    onEditUser={onEditUser}
                    onCancelEdit={onCancelEdit}
                    onSaveEdit={onSaveEdit}
                    isEditing={editing?.index === idx}
                  />
                </div>
              );
            })}
            {/* Show typing indicator when AI is responding and before first token */}
            {showTyping && (
              <div className="mb-6">
                <TypingIndicator />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        <div className="flex-shrink-0">
          <ChatInput 
            onSendMessage={(m) => {
              if (editing) {
                // When editing, replace the message and remove all subsequent messages
                setMessages(prev => {
                  // Keep messages up to and including the edited message
                  const messagesUpToEdited = prev.slice(0, editing.index + 1);
                  // Replace the edited message
                  messagesUpToEdited[editing.index] = {
                    ...messagesUpToEdited[editing.index],
                    message: m
                  };
                  return messagesUpToEdited;
                });
                // Clear editing state
                setEditing(null);
                // Regenerate AI response for this edited user message
                handleSendMessage(m, { echoUser: false, insertAtIndex: editing.index + 1, force: true });
              } else {
                handleSendMessage(m);
              }
            }}
            autoFocus={!!editing}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;