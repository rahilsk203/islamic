import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  csrfToken: string | null;
  login: (email: string, password: string, backendUrl: string) => Promise<void>;
  signup: (email: string, password: string, backendUrl: string) => Promise<void>;
  loginWithGoogle: (idToken: string, backendUrl: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
  getCSRFToken: (backendUrl: string) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children, backendUrl }: { children: ReactNode; backendUrl: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [csrfToken, setCSRFToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for existing token on app start
  useEffect(() => {
    const savedToken = localStorage.getItem('islamicai_token');
    const savedUser = localStorage.getItem('islamicai_user');
    const savedCSRFToken = localStorage.getItem('islamicai_csrf_token');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    } else {
      // Provide a default user for testing without authentication
      setUser({
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User'
      });
      setToken('test-token');
    }
    
    if (savedCSRFToken) {
      setCSRFToken(savedCSRFToken);
    }
  }, []);

  const getCSRFToken = async (backendUrl: string): Promise<string | null> => {
    try {
      const response = await fetch(`${backendUrl}/auth/csrf-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include' // Include cookies in the request
      });
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      const newCSRFToken = data.csrfToken;
      
      // Save to localStorage
      localStorage.setItem('islamicai_csrf_token', newCSRFToken);
      setCSRFToken(newCSRFToken);
      
      return newCSRFToken;
    } catch (err) {
      console.error('Failed to get CSRF token:', err);
      return null;
    }
  };

  const login = async (email: string, password: string, backendUrl: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Get CSRF token if not available
      let currentCSRFToken = csrfToken;
      if (!currentCSRFToken) {
        currentCSRFToken = await getCSRFToken(backendUrl);
      }
      
      const response = await fetch(`${backendUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': currentCSRFToken || '' // Add CSRF token to header
        },
        credentials: 'include', // Include cookies in the request
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }
      
      const data = await response.json();
      const { user_id, token } = data;
      
      // Get user profile
      const profileResponse = await fetch(`${backendUrl}/memory/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include'
      });
      
      let userProfile: User = { id: user_id, email };
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        userProfile = {
          ...userProfile,
          name: profileData.profile?.name,
          avatarUrl: profileData.profile?.avatar_url,
        };
      }
      
      setUser(userProfile);
      setToken(token);
      
      // Save to localStorage
      localStorage.setItem('islamicai_token', token);
      localStorage.setItem('islamicai_user', JSON.stringify(userProfile));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, backendUrl: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Get CSRF token if not available
      let currentCSRFToken = csrfToken;
      if (!currentCSRFToken) {
        currentCSRFToken = await getCSRFToken(backendUrl);
      }
      
      const response = await fetch(`${backendUrl}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': currentCSRFToken || '' // Add CSRF token to header
        },
        credentials: 'include', // Include cookies in the request
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Signup failed');
      }
      
      const data = await response.json();
      const { user_id, token } = data;
      
      const userProfile: User = { id: user_id, email };
      setUser(userProfile);
      setToken(token);
      
      // Save to localStorage
      localStorage.setItem('islamicai_token', token);
      localStorage.setItem('islamicai_user', JSON.stringify(userProfile));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (idToken: string, backendUrl: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Get CSRF token if not available
      let currentCSRFToken = csrfToken;
      if (!currentCSRFToken) {
        currentCSRFToken = await getCSRFToken(backendUrl);
      }
      
      const response = await fetch(`${backendUrl}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': currentCSRFToken || '' // Add CSRF token to header
        },
        credentials: 'include', // Include cookies in the request
        body: JSON.stringify({ id_token: idToken }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Google login failed');
      }
      
      const data = await response.json();
      const { user_id, token } = data;
      
      // Get user profile
      const profileResponse = await fetch(`${backendUrl}/memory/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include'
      });
      
      let userProfile: User = { id: user_id, email: '' };
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        userProfile = {
          ...userProfile,
          email: profileData.profile?.email || '',
          name: profileData.profile?.name,
          avatarUrl: profileData.profile?.avatar_url,
        };
      }
      
      setUser(userProfile);
      setToken(token);
      
      // Save to localStorage
      localStorage.setItem('islamicai_token', token);
      localStorage.setItem('islamicai_user', JSON.stringify(userProfile));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setCSRFToken(null);
    localStorage.removeItem('islamicai_token');
    localStorage.removeItem('islamicai_user');
    localStorage.removeItem('islamicai_csrf_token');
    // Provide a default user after logout for testing
    setUser({
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User'
    });
    setToken('test-token');
  };

  return (
    <AuthContext.Provider value={{ user, token, csrfToken, login, signup, loginWithGoogle, logout, loading, error, getCSRFToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}