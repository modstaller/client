import { ipcRenderer } from 'electron';
import { useEffect } from 'react';

export function useIpcDispatch(channel, dispatch) {
  useEffect(() => {
    const listener = (_, action) => {
      dispatch(action);
    };
    ipcRenderer.on(channel, listener);
    return () => {
      ipcRenderer.removeListener(channel, listener);
    };
  }, [channel, dispatch]);
}
