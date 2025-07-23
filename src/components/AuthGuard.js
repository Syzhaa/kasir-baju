import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useRouter } from 'next/router';

const publicPages = ['/login'];

export default function AuthGuard({ children }) {
  const { isAuthenticated, isAuthLoading } = useAppContext();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || isAuthLoading) return;
    const isPublicPage = publicPages.includes(router.pathname);
    if (!isAuthenticated && !isPublicPage) router.push('/login');
    if (isAuthenticated && isPublicPage) router.push('/');
  }, [mounted, isAuthenticated, isAuthLoading, router]);

  if (!mounted || isAuthLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  if (!isAuthenticated && !publicPages.includes(router.pathname)) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  return children;
}