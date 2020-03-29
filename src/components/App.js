import React from 'react';

import { AuthProvider } from '../contexts/authContext';
import { GameProvider } from '../contexts/gameContext';

import Routes from './Routes';

export default function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <Routes />
      </GameProvider>
    </AuthProvider>
  );
}
