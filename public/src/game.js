'use strict';

const { resolve, join } = require('path');

const fs = require('fs-extra');

const { Libraries } = require('./libraries');
const { downloadFile } = require('./utils');

class Game {
  constructor(folder, name, gameData, authData) {
    this.folder = resolve(folder);
    this.name = name;
    this.gameData = gameData;
    this.authData = authData;
    this.libraries = new Libraries(gameData.libraries);
  }

  async install() {
    await this.libraries.install(join(this.folder, 'libraries'));
    await this.downloadClient();
  }

  async downloadClient() {
    const clientPath = join(this.folder, 'versions', this.name, 'client.jar');
    if (await fs.exists(clientPath)) {
      console.error(`client is already downloaded`);
    }

    await downloadFile(this.gameData.downloads.client.url, clientPath);
  }

  run() {
    console.error('todo: run game');
  }
}

module.exports = { Game };
