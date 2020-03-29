'use strict';

const { ipcMain } = require('electron');

const { Auth } = require('./auth');
const { GameManager } = require('./gameManager');

function init() {
  const auth = new Auth();
  auth.init();

  const gameManager = new GameManager();

  ipcMain.on('message', (event, type, message) => {
    if (!type || !message) {
      throw new Error('missing type or message in event');
    }

    switch (type) {
      case 'auth':
        auth.handleMessage(event, message);
        break;
      case 'game': {
        gameManager.handleMessage(event, message, auth);
        break;
      }
      default:
        throw new Error(`unhandled message type: ${type}`);
    }
  });
}

exports.init = init;
