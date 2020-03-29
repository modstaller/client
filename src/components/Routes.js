import React, { useEffect } from 'react';
import { ipcRenderer } from 'electron';

import { useAuth } from '../contexts/authContext';

import LoginPage from './LoginPage';
import LauncherPage from './LauncherPage';

export default function Routes() {
  useEffect(() => {
    ipcRenderer.send('message', 'auth', { type: 'READY' });
  }, []);

  const [auth] = useAuth();

  if (auth.isLoggedIn === null) {
    // The backend is still initializing
    return null;
  }

  if (!auth.isLoggedIn) {
    return <LoginPage />;
  }

  return <LauncherPage username={auth.user.name} />;
}
