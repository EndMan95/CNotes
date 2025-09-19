'use client';

import { useAuth } from '../../context/AuthContext';

export default function DashboardPage() {
  const { currentUser } = useAuth();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to your notes.</p>
      {currentUser && (
        <p>Hello, {currentUser.email}!</p>
      )}
    </div>
  );
}