import { useAuth } from '@/contexts/AuthContext';

export interface UserPreferences {
  language: string | null;
  madhhab: string | null;
  interests: string[] | null;
}

export interface UserMemoryProfile {
  preferences: UserPreferences;
  recentSummaries: string[];
  memoryCount: number;
}

/**
 * Fetch user's language preference from the backend
 * @param backendUrl - The backend API URL
 * @param token - User's authentication token
 * @returns User's language preference or null if not set
 */
export async function fetchUserLanguagePreference(backendUrl: string, token: string | null): Promise<string | null> {
  // Check if user is authenticated
  if (!token || token === 'test-token') {
    return null;
  }

  try {
    const response = await fetch(`${backendUrl}/memory/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    // Return the language preference if it exists
    return data.memory?.preferences?.language || null;
  } catch (error) {
    console.error('Error fetching user language preference:', error);
    return null;
  }
}

/**
 * Get the appropriate language code for the user
 * @param userLanguage - Language preference from user profile
 * @returns Standard language code
 */
export function getUserLanguageCode(userLanguage: string | null): string {
  if (!userLanguage) {
    return 'en'; // Default to English
  }

  // Map user language preference to standard language codes
  const languageMap: Record<string, string> = {
    'english': 'en',
    'hindi': 'hi',
    'hinglish': 'hi-en', // Special code for Hinglish
    'urdu': 'ur',
    'arabic': 'ar'
  };

  return languageMap[userLanguage.toLowerCase()] || 'en';
}

/**
 * Get the display name for a language
 * @param languageCode - Language code
 * @returns Display name for the language
 */
export function getLanguageDisplayName(languageCode: string): string {
  const languageNames: Record<string, string> = {
    'en': 'English',
    'hi': 'Hindi',
    'hi-en': 'Hinglish',
    'ur': 'Urdu',
    'ar': 'Arabic'
  };

  return languageNames[languageCode] || 'English';
}

/**
 * Normalize language preference to a standard format
 * @param language - Language preference from user profile
 * @returns Normalized language preference
 */
export function normalizeLanguagePreference(language: string | null): string | null {
  if (!language) {
    return null;
  }

  // Normalize language preference to standard format
  const normalizedLanguages: Record<string, string> = {
    'english': 'english',
    'hindi': 'hindi',
    'hinglish': 'hinglish',
    'urdu': 'urdu',
    'arabic': 'arabic'
  };

  const lowerLanguage = language.toLowerCase().trim();
  return normalizedLanguages[lowerLanguage] || null;
}