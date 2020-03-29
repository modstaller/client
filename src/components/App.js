import React from 'react';
import { AuthProvider } from '../contexts/authContext';
import Routes from './Routes';

export default function App() {
  return (
    <AuthProvider>
      <Routes />
    </AuthProvider>
  );
}
