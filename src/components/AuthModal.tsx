import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'login' | 'signup';
  backendUrl: string;
}

declare global {
  interface Window {
    google: any;
  }
}

export function AuthModal({ open, onOpenChange, mode, backendUrl }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { login, signup, loginWithGoogle, loading, error } = useAuth();
  const [localError, setLocalError] = useState<string | null>(null);
  const [currentMode, setCurrentMode] = useState<'login' | 'signup'>(mode);

  // Reset form when mode changes
  const handleModeChange = (newMode: 'login' | 'signup') => {
    setCurrentMode(newMode);
    setLocalError(null);
    // Reset form fields when switching modes
    if (newMode === 'login') {
      setConfirmPassword('');
    }
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      // Reset form when modal closes
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setLocalError(null);
    }
  }, [open]);

  // Initialize Google Identity Services when modal opens
  useEffect(() => {
    if (open && window.google) {
      try {
        window.google.accounts.id.initialize({
          client_id: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com", // This should be configured
          callback: async (response: any) => {
            try {
              await loginWithGoogle(response.credential, backendUrl);
              onOpenChange(false);
            } catch (err: any) {
              setLocalError(err.message);
            }
          }
        });
      } catch (err: any) {
        console.error('Error initializing Google Identity Services:', err);
      }
    }
  }, [open, loginWithGoogle, backendUrl, onOpenChange]);

  const handleGoogleLogin = async () => {
    setLocalError(null);
    
    try {
      // Check if Google Identity Services is available
      if (!window.google || !window.google.accounts || !window.google.accounts.id) {
        setLocalError('Google Identity Services not available. Please try email login.');
        return;
      }

      // Prompt user to select Google account
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback to render button if prompt doesn't work
          const container = document.getElementById('google-signin-button-container');
          if (container) {
            window.google.accounts.id.renderButton(
              container,
              { theme: "outline", size: "large", width: "100%", text: "signin_with" }
            );
          }
        }
      });
    } catch (err: any) {
      setLocalError(err.message || 'Failed to initialize Google login');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    
    // Basic validation
    if (!email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }
    
    if (currentMode === 'signup' && password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }
    
    if (currentMode === 'signup' && password.length < 6) {
      setLocalError('Password must be at least 6 characters long');
      return;
    }
    
    try {
      if (currentMode === 'login') {
        await login(email, password, backendUrl);
      } else {
        await signup(email, password, backendUrl);
      }
      onOpenChange(false);
    } catch (err: any) {
      setLocalError(err.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[380px] w-full max-w-md mx-2 p-5 rounded-xl">
        <DialogHeader className="mb-3">
          <DialogTitle className="text-2xl font-bold text-center text-green-700">
            {currentMode === 'login' ? 'Welcome Back' : 'Create Account'}
          </DialogTitle>
          <p className="text-center text-muted-foreground text-sm mt-1">
            {currentMode === 'login' 
              ? 'Sign in to your IslamicAI account' 
              : 'Join IslamicAI to personalize your experience'}
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 text-sm"
              />
            </div>
            {currentMode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-11 text-sm"
                />
              </div>
            )}
          </div>
          {(error || localError) && (
            <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
              {error || localError}
            </div>
          )}
          <div className="flex flex-col gap-3 pt-2">
            <Button type="submit" disabled={loading} className="h-11 text-sm bg-green-600 hover:bg-green-700">
              {loading ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2 text-sm">●</span>
                  {currentMode === 'login' ? 'Signing In...' : 'Creating Account...'}
                </span>
              ) : currentMode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>
            
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            
            {/* Google Login Button Container */}
            <div id="google-signin-button-container" className="flex justify-center"></div>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="h-11 text-sm border-green-300 text-green-700 hover:bg-green-50"
            >
              {loading ? 'Loading...' : 'Continue with Google'}
            </Button>
            
            <div className="text-center text-sm pt-2">
              <Button
                type="button"
                variant="link"
                onClick={() => handleModeChange(currentMode === 'login' ? 'signup' : 'login')}
                className="p-0 h-auto font-normal text-green-600 hover:text-green-700"
              >
                {currentMode === 'login' 
                  ? "Don't have an account? Sign Up" 
                  : "Already have an account? Sign In"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}