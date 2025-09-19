'use client';

import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is not authenticated
    if (!isAuthenticated) {
      // Redirect to login page
      router.push('/login');
    } else {
      // User is authenticated, stop loading
      setLoading(false);
    }
  }, [isAuthenticated, router]);

  // Show nothing while checking auth state
  if (loading) {
    return null;
  }

  // Render children if user is authenticated
  return <>{children}</>;
}