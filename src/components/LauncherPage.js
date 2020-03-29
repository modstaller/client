import React, { useEffect } from 'react';
import { ipcRenderer } from 'electron';

import { useGame } from '../contexts/gameContext';

export default function LauncherPage(props) {
  useEffect(() => {
    ipcRenderer.send('message', 'game', { type: 'GET_LATEST' });
  });
  const [gameState, dispatch] = useGame();

  return (
    <div>
      <p>Logged in as {props.username}</p>
      {gameState.version && (
        <GameLauncher
          version={gameState.version}
          status={gameState.status}
          dispatch={dispatch}
        />
      )}
    </div>
  );
}

function GameLauncher(props) {
  function handleClickStart() {
    ipcRenderer.send('message', 'game', { type: 'RUN_LATEST' });
  }

  return (
    <div>
      <div>Latest Minecraft version is {props.version}</div>
      <div>Run status: {props.status}</div>
      <span className="inline-flex rounded-md shadow-sm">
        <button
          type="button"
          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs leading-4 font-medium rounded text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo active:bg-indigo-700 transition ease-in-out duration-150"
          disabled={props.status !== 'idle'}
          onClick={handleClickStart}
        >
          Start Game
        </button>
      </span>
    </div>
  );
}
