import React, { createContext, useContext, useReducer } from 'react';
import { produce } from 'immer';
import { useIpcDispatch } from '../hooks/useIpcDispatch';

const authContext = createContext(null);

export function useAuth() {
  const context = useContext(authContext);
  if (!context) {
    throw new Error('authContext was not initialized');
  }
  return context;
}

const authReducer = produce((draft, action) => {
  switch (action.type) {
    case 'AUTH_STATE': {
      draft.isLoggedIn = action.payload.isLoggedIn;
      return;
    }
    case 'LOGIN_START': {
      draft.isLoggingIn = true;
      draft.error = null;
      return;
    }
    case 'LOGIN_SUCCESS': {
      draft.isLoggingIn = false;
      draft.isLoggedIn = true;
      draft.user = action.payload;
      return;
    }
    case 'LOGIN_ERROR': {
      draft.isLoggingIn = false;
      draft.error = action.payload;
      return;
    }
    default:
      throw new Error(`unknown action: ${action.type}`);
  }
});

const initialAuth = {
  isLoggedIn: null,
  isLoggingIn: false,
  user: null,
  error: null,
};

export const AuthProvider = (props) => {
  const ctx = useReducer(authReducer, initialAuth);
  useIpcDispatch('auth', ctx[1]);
  return (
    <authContext.Provider value={ctx}>{props.children}</authContext.Provider>
  );
};
