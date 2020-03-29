'use strict';

const { ipcMain } = require('electron');
const got = require('got');
const uuid = require('@lukeed/uuid');
const jwt = require('jsonwebtoken');

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
  throwHttpErrors: false,
});

class Auth {
  constructor() {
    this.data = null;
    this.initPromise = null;
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
        this.initPromise.then(() => {
          if (this.data.accessToken) {
            event.reply('auth', {
              type: 'AUTH_STATE',
              payload: { isLoggedIn: true, user: this.data.user },
            });
          } else {
            event.reply('auth', {
              type: 'AUTH_STATE',
              payload: { isLoggedIn: false, user: null },
            });
          }
        });
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
    const authData = await readAppJson(authJsonFile);
    if (authData === null) {
      this.data = { clientToken: uuid() };
      await this.saveData();
    } else {
      this.data = authData;
    }
  }

  async saveData() {
    await saveAppJson(authJsonFile, this.data);
  }

  async checkLogin() {
    // There's nothing to check, the user was never logged in.
    if (!this.data.accessToken) return;

    await this.validate();
  }

  async login({ username, password }) {
    const response = await authGot.post('authenticate', {
      json: {
        agent: {
          name: 'Minecraft',
          version: 1,
        },
        clientToken: this.data.clientToken,
        username,
        password,
      },
    });

    if (response.statusCode === 200) {
      this.data.user = response.body.selectedProfile;
      this.data.accessTokenRaw = response.body.accessToken;
      this.data.accessToken = jwt.decode(response.body.accessToken);
      await this.saveData();
    } else {
      throw new Error(response.body.errorMessage);
    }
  }

  async refresh() {
    if (!this.data.accessToken) {
      throw new Error('accessToken is missing');
    }

    const response = await authGot.post('refresh', {
      json: {
        accessToken: this.data.accessToken.yggt,
        clientToken: this.data.clientToken,
        selectedProfile: {
          id: this.data.user.id,
          name: this.data.user.name,
        },
      },
    });

    if (response.statusCode === 200) {
      this.data.user = response.body.selectedProfile;
      this.data.accessTokenRaw = response.body.accessToken;
      this.data.accessToken = jwt.decode(response.body.accessToken);
    } else {
      delete this.data.user;
      delete this.data.accessToken;
    }
    await this.saveData();
  }

  async validate() {
    if (!this.data.accessToken) {
      throw new Error('accessToken is missing');
    }

    const response = await authGot.post('validate', {
      json: {
        accessToken: this.data.accessToken.yggt,
        clientToken: this.data.clientToken,
      },
    });

    if (response.statusCode !== 204) {
      await this.refresh();
    }
  }
}

module.exports = {
  Auth,
};
