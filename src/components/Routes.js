import React from 'react';
import { useAuth } from '../contexts/authContext';
import LoginPage from './LoginPage';

export default function Routes() {
  const [auth] = useAuth();

  if (auth.isLoggedIn === null) {
    // The backend is still initializing
    return null;
  }

  if (!auth.isLoggedIn) {
    return <LoginPage />;
  }

  return <div>Logged in as {auth.user.name}.</div>;
}
