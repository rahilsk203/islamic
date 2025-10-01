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
      <div className="w-full max-w-md mx-auto p-4 sm:p-6">
        <Card className="w-full">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto bg-gray-100 rounded-full p-3 w-14 h-14 flex items-center justify-center mb-4">
              <UserIcon className="w-7 h-7 text-gray-500" />
            </div>
            <CardTitle className="text-xl">Guest Access</CardTitle>
            <CardDescription className="mt-1">
              Unlock personalized IslamicAI features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground text-sm">
                Sign in to access your personalized preferences, conversation history, and other exclusive features.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h3 className="font-medium text-blue-800 text-sm">Guest Benefits</h3>
                  <ul className="text-xs text-blue-700 mt-2 space-y-1">
                    <li>• Ask questions about Islam</li>
                    <li>• Get prayer times</li>
                    <li>• Access Islamic knowledge</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <h3 className="font-medium text-green-800 text-sm">Member Benefits</h3>
                  <ul className="text-xs text-green-700 mt-2 space-y-1">
                    <li>• Save conversation history</li>
                    <li>• Personalize preferences</li>
                    <li>• Get tailored recommendations</li>
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
              className="w-full h-11 text-base"
            >
              <LockIcon className="mr-2 h-4 w-4" />
              Sign In / Create Account
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto p-4 sm:p-6">
        <Card className="w-full">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Loading Profile</CardTitle>
            <CardDescription className="mt-1">Please wait while we load your information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6">
      <Card className="w-full">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl">Your Profile</CardTitle>
              <CardDescription className="mt-1">Manage your account settings and preferences</CardDescription>
            </div>
            <div className="flex-shrink-0">
              <Button 
                variant="outline" 
                onClick={logout}
                className="h-10 px-4 w-full sm:w-auto"
              >
                <LogOutIcon className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-lg truncate">{user.name || user.email}</h3>
                <p className="text-sm text-muted-foreground truncate">
                  {user.email ? `Logged in${user.email.includes('google') ? ' with Google' : ''}` : 'Logged in'}
                </p>
                {profileData && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    Login count: {profileData.login_count || 0} | 
                    Last login: {profileData.last_login ? new Date(profileData.last_login).toLocaleDateString() : 'N/A'}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {memoryProfile && (
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Memory Profile</h4>
              <p className="text-sm">Total memories: {memoryProfile.memoryCount || 0}</p>
              {memoryProfile.recentSummaries && memoryProfile.recentSummaries.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium">Recent discussions:</p>
                  <ul className="text-xs list-disc pl-5 mt-1 space-y-1">
                    {memoryProfile.recentSummaries.slice(0, 3).map((summary, index) => (
                      <li key={index} className="break-words">{summary}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          <div className="space-y-5">
            <h3 className="text-lg font-medium border-b pb-2 mb-4">Preferences</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">Preferred Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="hindi">Hindi (हिंदी)</SelectItem>
                    <SelectItem value="bengali">Bengali (বাংলা)</SelectItem>
                    <SelectItem value="hinglish">Hinglish</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="madhhab">Madhhab Preference</Label>
                <Select value={madhhab} onValueChange={setMadhhab}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select madhhab" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hanafi">Hanafi</SelectItem>
                    <SelectItem value="shafii">Shafi'i</SelectItem>
                    <SelectItem value="maliki">Maliki</SelectItem>
                    <SelectItem value="hanbali">Hanbali</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="interests">Interests (comma separated)</Label>
                <Input
                  id="interests"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  placeholder="e.g., Fiqh, Tafsir, Islamic history"
                  className="h-11"
                />
              </div>
            </div>
            
            {message && (
              <div className={`p-3 rounded-md text-sm ${
                message.includes('Failed') 
                  ? 'bg-red-50 text-red-700' 
                  : 'bg-green-50 text-green-700'
              }`}>
                {message}
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button 
                onClick={handleSavePreferences} 
                disabled={saving}
                className="flex-1 h-11"
              >
                {saving ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2">●</span>
                    Saving...
                  </span>
                ) : 'Save Preferences'}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleClearMemory}
                className="flex-1 h-11"
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