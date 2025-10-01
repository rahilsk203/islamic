import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, token, isGuest } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login if there's no user or if it's a guest user with test token
    if (!user || !token || (isGuest && token === 'test-token')) {
      navigate('/login');
    }
  }, [user, token, isGuest, navigate]);

  // Don't render children if there's no user or if it's a guest user with test token
  if (!user || !token || (isGuest && token === 'test-token')) {
    return null;
  }

  return <>{children}</>;
}