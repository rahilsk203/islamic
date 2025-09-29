import { useState } from 'react';
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

  const handleGoogleLogin = async () => {
    setLocalError(null);
    
    try {
      // Initialize Google Identity Services
      if (!window.google) {
        setLocalError('Google Identity Services not loaded');
        return;
      }

      // Show Google Sign-In prompt
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

      // Prompt user to select Google account
      window.google.accounts.id.prompt();
    } catch (err: any) {
      setLocalError(err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    
    if (currentMode === 'signup' && password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }
    
    try {
      if (currentMode === 'login') {
        await login(email, password, backendUrl);
      } else {
        await signup(email, password, backendUrl);
      }
      onOpenChange(false);
      // Reset form
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setLocalError(err.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{currentMode === 'login' ? 'Login to IslamicAI' : 'Create Account'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {currentMode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}
          {(error || localError) && (
            <div className="text-red-500 text-sm">
              {error || localError}
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Loading...' : currentMode === 'login' ? 'Login' : 'Sign Up'}
            </Button>
            
            {/* Google Login Button */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Continue with Google'}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => handleModeChange(currentMode === 'login' ? 'signup' : 'login')}
            >
              {currentMode === 'login' ? 'Create Account' : 'Already have an account? Login'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}