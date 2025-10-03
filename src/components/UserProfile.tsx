import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { UserIcon, LockIcon, LogOutIcon } from 'lucide-react';

interface UserProfileProps {
  backendUrl: string;
}

interface UserProfileData {
  name: string | null;
  avatar_url: string | null;
  last_login: string | null;
  login_count: number;
}

interface UserPreferences {
  language: string | null;
  madhhab: string | null;
  interests: string[] | null;
}

interface UserMemoryProfile {
  preferences: UserPreferences;
  recentSummaries: string[];
  memoryCount: number;
}

export function UserProfile({ backendUrl }: UserProfileProps) {
  const { user, token, csrfToken, getCSRFToken, logout, isGuest } = useAuth();
  const [language, setLanguage] = useState('');
  const [madhhab, setMadhhab] = useState('');
  const [interests, setInterests] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [memoryProfile, setMemoryProfile] = useState<UserMemoryProfile | null>(null);
  const [isMobile, setIsMobile] = useState(false);

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

  // Check if user is a real authenticated user (not a guest)
  const isAuthenticatedUser = user && token && token !== 'test-token' && !isGuest;

  useEffect(() => {
    // Only fetch profile data for authenticated users
    if (isAuthenticatedUser) {
      fetchUserProfile();
    } else {
      // For guest users, skip loading profile data
      setLoading(false);
    }
  }, [isAuthenticatedUser]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${backendUrl}/memory/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      
      const data = await response.json();
      setProfileData(data.profile);
      setMemoryProfile(data.memory);
      
      // Set form values from fetched data
      if (data.memory?.preferences) {
        setLanguage(data.memory.preferences.language || '');
        setMadhhab(data.memory.preferences.madhhab || '');
        setInterests(data.memory.preferences.interests?.join(', ') || '');
      }
    } catch (err) {
      setMessage('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    // Prevent guest users from saving preferences
    if (!isAuthenticatedUser) {
      setMessage('Please log in to save preferences');
      return;
    }
    
    setSaving(true);
    setMessage('');
    
    try {
      // Get CSRF token if not available
      let currentCSRFToken = csrfToken;
      if (!currentCSRFToken) {
        currentCSRFToken = await getCSRFToken(backendUrl);
      }
      
      const interestsArray = interests.split(',').map(i => i.trim()).filter(i => i);
      
      const response = await fetch(`${backendUrl}/prefs/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          csrfToken: currentCSRFToken,
          language: language || null,
          madhhab: madhhab || null,
          interests: interestsArray.length > 0 ? interestsArray : null,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save preferences');
      }
      
      setMessage('Preferences saved successfully!');
      // Refresh profile data after saving
      fetchUserProfile();
      
      // Dispatch a custom event to notify other components that user preferences have been updated
      window.dispatchEvent(new CustomEvent('userPreferencesUpdated', { 
        detail: { language: language || null }
      }));
    } catch (err) {
      setMessage('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleClearMemory = async () => {
    // Prevent guest users from clearing memory
    if (!isAuthenticatedUser) {
      setMessage('Please log in to clear memory');
      return;
    }
    
    if (!confirm('Are you sure you want to clear all your memories and preferences? This cannot be undone.')) {
      return;
    }
    
    try {
      // Get CSRF token if not available
      let currentCSRFToken = csrfToken;
      if (!currentCSRFToken) {
        currentCSRFToken = await getCSRFToken(backendUrl);
      }
      
      const response = await fetch(`${backendUrl}/memory/clear`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          csrfToken: currentCSRFToken
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to clear memory');
      }
      
      // Reset form
      setLanguage('');
      setMadhhab('');
      setInterests('');
      setMessage('Memory cleared successfully!');
      
      // Refresh profile data after clearing
      fetchUserProfile();
    } catch (err) {
      setMessage('Failed to clear memory');
    }
  };

  // For guest users, show a message instead of trying to load profile data
  if (!isAuthenticatedUser) {
    return (
      <div className="w-full max-w-md mx-auto p-1">
        <Card className="w-full border border-green-200 shadow-sm">
          <CardHeader className="text-center pb-2 pt-3">
            <div className="mx-auto bg-green-100 rounded-full p-1.5 w-10 h-10 flex items-center justify-center mb-2">
              <UserIcon className="w-5 h-5 text-green-600" />
            </div>
            <CardTitle className="text-base">Guest Access</CardTitle>
            <CardDescription className="mt-0.5 text-xs">
              Unlock IslamicAI features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 py-3 px-3">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground text-xs">
                Sign in for personalized features
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-blue-50 p-1.5 rounded">
                  <h3 className="font-medium text-blue-800 text-xs">Guest</h3>
                  <ul className="text-xs text-blue-700 mt-1 space-y-0.5">
                    <li>• Ask questions</li>
                    <li>• Get prayer times</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-1.5 rounded">
                  <h3 className="font-medium text-green-800 text-xs">Member</h3>
                  <ul className="text-xs text-green-700 mt-1 space-y-0.5">
                    <li>• Save history</li>
                    <li>• Personalize</li>
                    <li>• Memory features</li>
                  </ul>
                </div>
              </div>
            </div>
            <Button 
              onClick={() => {
                // Dispatch event to open auth modal
                const event = new CustomEvent('openAuthModal', { detail: { mode: 'login' } });
                window.dispatchEvent(event);
              }}
              className="w-full h-8 text-xs bg-green-600 hover:bg-green-700 touch-optimized-button"
            >
              <LockIcon className="mr-1 h-3 w-3" />
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto p-1">
        <Card className="w-full border border-green-200">
          <CardHeader className="pb-2 pt-3">
            <CardTitle className="text-base">Loading Profile</CardTitle>
            <CardDescription className="mt-0.5 text-xs">Please wait</CardDescription>
          </CardHeader>
          <CardContent className="py-4">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-1">
      <Card className="w-full border border-green-200 shadow-sm">
        <CardHeader className="pb-2 pt-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base">Your Profile</CardTitle>
              <CardDescription className="mt-0.5 text-xs">Manage your settings</CardDescription>
            </div>
            <Button 
              variant="outline" 
              onClick={logout}
              className="h-8 px-2 text-xs border-green-300 text-green-700 hover:bg-green-50 touch-optimized-button"
            >
              <LogOutIcon className="mr-1 h-3 w-3" />
              Sign Out
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 py-3 px-3">
          <div className="p-2 bg-green-50 rounded-lg border border-green-100">
            <div className="flex items-center gap-2">
              <div className="bg-green-200 rounded-full p-1.5 w-10 h-10 flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-green-700" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm truncate">{user.name || user.email}</h3>
                <p className="text-xs text-green-700 truncate">
                  {user.email ? `Logged in${user.email.includes('google') ? ' with Google' : ''}` : 'Logged in'}
                </p>
              </div>
            </div>
            {profileData && (
              <p className="text-xs text-green-700 mt-1">
                Total logins: {profileData.login_count || 0}
              </p>
            )}
          </div>
          
          {memoryProfile && (
            <div className="bg-blue-50 p-2 rounded-lg border border-blue-100">
              <h4 className="font-medium text-xs mb-1 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                Memory: {memoryProfile.memoryCount || 0} items
              </h4>
              {memoryProfile.recentSummaries && memoryProfile.recentSummaries.length > 0 && (
                <div className="mt-1">
                  <p className="text-xs text-blue-700 mb-0.5">Recent:</p>
                  <p className="text-xs text-blue-800 truncate">{memoryProfile.recentSummaries[0]}</p>
                </div>
              )}
            </div>
          )}
          
          <div className="space-y-3">
            <h3 className="text-sm font-medium border-b border-green-200 pb-1">Preferences</h3>
            
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="language" className="text-xs font-medium">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="h-8 text-xs touch-optimized-button">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english" className="text-xs">English</SelectItem>
                    <SelectItem value="hindi" className="text-xs">Hindi</SelectItem>
                    <SelectItem value="hinglish" className="text-xs">Hinglish</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="madhhab" className="text-xs font-medium">Madhhab</Label>
                <Select value={madhhab} onValueChange={setMadhhab}>
                  <SelectTrigger className="h-8 text-xs touch-optimized-button">
                    <SelectValue placeholder="Select madhhab" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hanafi" className="text-xs">Hanafi</SelectItem>
                    <SelectItem value="shafii" className="text-xs">Shafi'i</SelectItem>
                    <SelectItem value="maliki" className="text-xs">Maliki</SelectItem>
                    <SelectItem value="hanbali" className="text-xs">Hanbali</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="interests" className="text-xs font-medium">Interests</Label>
                <Input
                  id="interests"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  placeholder="e.g., Fiqh, Tafsir, Hadith"
                  className="h-8 text-xs"
                />
                <p className="text-xs text-muted-foreground">Separate multiple interests with commas</p>
              </div>
            </div>
            
            {message && (
              <div className={`p-2 rounded-lg text-xs ${
                message.includes('Failed') 
                  ? 'bg-red-50 text-red-700 border border-red-200' 
                  : 'bg-green-50 text-green-700 border border-green-200'
              }`}>
                {message}
              </div>
            )}
            
            <div className="flex gap-2 pt-1 flex-col sm:flex-row">
              <Button 
                onClick={handleSavePreferences} 
                disabled={saving}
                className="flex-1 h-8 text-xs bg-green-600 hover:bg-green-700 touch-optimized-button"
              >
                {saving ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-1 text-xs">●</span>
                    Saving...
                  </span>
                ) : 'Save Preferences'}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleClearMemory}
                className="flex-1 h-8 text-xs border-red-300 text-red-700 hover:bg-red-50 touch-optimized-button"
              >
                Clear Memory
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}