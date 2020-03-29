import React, { createContext, useContext, useReducer } from 'react';
import { produce } from 'immer';
import { useIpcDispatch } from '../hooks/useIpcDispatch';

const gameContext = createContext(null);

export function useGame() {
  const context = useContext(gameContext);
  if (!context) {
    throw new Error('authContext was not initialized');
  }
  return context;
}

const gameReducer = produce((draft, action) => {
  switch (action.type) {
    case 'LATEST_VERSION': {
      draft.version = action.payload;
      return;
    }
    case 'RUN_STATUS': {
      draft.status = action.payload;
      return;
    }
    default:
      throw new Error(`unknown action: ${action.type}`);
  }
});

const initialGame = {
  version: null,
  status: 'idle',
};

export const GameProvider = (props) => {
  const ctx = useReducer(gameReducer, initialGame);
  useIpcDispatch('game', ctx[1]);
  return (
    <gameContext.Provider value={ctx}>{props.children}</gameContext.Provider>
  );
};
