import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user, token, csrfToken, getCSRFToken, logout } = useAuth();
  const [language, setLanguage] = useState('');
  const [madhhab, setMadhhab] = useState('');
  const [interests, setInterests] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [memoryProfile, setMemoryProfile] = useState<UserMemoryProfile | null>(null);

  useEffect(() => {
    if (user && token) {
      fetchUserProfile();
    }
  }, [user, token]);

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

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
          <CardDescription>Loading profile data...</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Please wait while we load your profile information...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
        <CardDescription>Manage your preferences and account settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">{user.name || user.email}</h3>
            <p className="text-sm text-muted-foreground">
              {user.email ? `Logged in${user.email.includes('google') ? ' with Google' : ''}` : 'Logged in'}
            </p>
            {profileData && (
              <p className="text-sm text-muted-foreground">
                Login count: {profileData.login_count || 0} | 
                Last login: {profileData.last_login ? new Date(profileData.last_login).toLocaleDateString() : 'N/A'}
              </p>
            )}
          </div>
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
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
                    <li key={index}>{summary}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="language">Preferred Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
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
              <SelectTrigger>
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
            />
          </div>
          
          {message && (
            <div className={`text-sm ${message.includes('Failed') ? 'text-red-500' : 'text-green-500'}`}>
              {message}
            </div>
          )}
          
          <div className="flex gap-2">
            <Button onClick={handleSavePreferences} disabled={saving}>
              {saving ? 'Saving...' : 'Save Preferences'}
            </Button>
            <Button variant="outline" onClick={handleClearMemory}>
              Clear Memory
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}