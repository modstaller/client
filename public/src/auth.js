'use strict';

const { ipcMain } = require('electron');
const got = require('got');
const uuid = require('@lukeed/uuid');

const { readAppJson, saveAppJson } = require('./utils');

const authServer = 'https://authserver.mojang.com';
const authJsonFile = 'auth.json';

const authGot = got.extend({
  prefixUrl: authServer,
  responseType: 'json',
  headers: {
    'content-type': 'application/json',
    'user-agent': 'Modstaller',
  },
});

class Auth {
  constructor() {
    this.isLoggedIn = false;
    this.clientToken = null;
    this.data = null;
    this.initPromise = null;

    ipcMain.on('auth', (event, message) => this.handleMessage(event, message));
  }

  init() {
    this.initPromise = this._init();
  }

  async _init() {
    await this.readData();
    await this.checkLogin();
  }

  handleMessage(event, message) {
    switch (message.type) {
      case 'READY': {
        if (this.isLoggedIn) {
          event.reply('auth', {
            type: 'AUTH_STATE',
            payload: { isLoggedIn: true },
          });
        } else {
          event.reply('auth', {
            type: 'AUTH_STATE',
            payload: { isLoggedIn: false },
          });
        }
        return;
      }
      case 'DO_LOGIN': {
        this.login(message.payload).then(
          () =>
            event.reply('auth', {
              type: 'LOGIN_SUCCESS',
              payload: this.data.user,
            }),
          (error) =>
            event.reply('auth', {
              type: 'LOGIN_ERROR',
              payload: error.message,
            }),
        );
        return;
      }
      default:
        throw new Error(`unknown message: ${message.type}`);
    }
  }

  async readData() {
    let authData = await readAppJson(authJsonFile);
    if (authData === null) {
      const clientToken = uuid();
      this.clientToken = clientToken;
      authData = { clientToken };
      this.data = authData;
      await saveAppJson(authJsonFile, authData);
    } else {
      this.data = authData;
    }
  }

  async checkLogin() {
    // There's nothing to check, the user was never logged in.
    if (!this.data.accessToken) return;
  }

  async login({ username, password }) {
    const response = await authGot.post('authenticate', {
      json: {
        agent: {
          name: 'Minecraft',
          version: 1,
        },
        username,
        password,
        clientToken: this.clientToken,
        requestUser: true,
      },
      throwHttpErrors: false,
    });

    if (response.statusCode === 200) {
      this.data.user = response.body.selectedProfile;
    } else {
      throw new Error(response.body.errorMessage);
    }
  }
}

function init(webContents) {
  const auth = new Auth(webContents);
  auth.init();
}

module.exports = {
  init,
};
