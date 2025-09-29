import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

declare global {
  interface Window {
    google: any;
  }
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const { login, signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize Google Identity Services
    const initializeGoogleSignIn = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com", // This should be configured
          callback: handleGoogleResponse
        });
        
        // Render the Google Sign-In button
        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-button"),
          { theme: "outline", size: "large", width: "100%" }
        );
      }
    };

    // Handle Google Sign-In response
    const handleGoogleResponse = async (response: any) => {
      try {
        await loginWithGoogle(response.credential, 'http://127.0.0.1:8787');
        navigate('/');
      } catch (err: any) {
        setError(err.message);
      }
    };

    // Try to initialize Google Sign-In
    if (window.google) {
      initializeGoogleSignIn();
    } else {
      // If google script hasn't loaded yet, wait a bit and try again
      const timer = setTimeout(() => {
        if (window.google) {
          initializeGoogleSignIn();
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [navigate, loginWithGoogle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isLogin) {
        await login(email, password, 'http://127.0.0.1:8787');
      } else {
        await signup(email, password, 'http://127.0.0.1:8787');
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isLogin ? 'Login to IslamicAI' : 'Create Account'}</CardTitle>
          <CardDescription>
            {isLogin 
              ? 'Enter your credentials to access your account' 
              : 'Create an account to personalize your IslamicAI experience'}
          </CardDescription>
        </CardHeader>
        <CardContent>
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
            {error && (
              <div className="text-red-500 text-sm">
                {error}
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Button type="submit">
                {isLogin ? 'Login' : 'Sign Up'}
              </Button>
              
              {/* Google Sign-In Button Container */}
              <div id="google-signin-button"></div>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? 'Need an account? Sign Up' : 'Have an account? Login'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}