'use strict';

const { Game } = require('./game');
const { getAppPath, gotBase } = require('./utils');

class GameManager {
  constructor() {
    this.manifest = null;
  }

  async handleMessage(event, message, auth) {
    switch (message.type) {
      case 'GET_LATEST': {
        const manifest = await getVersionManifest();
        this.manifest = manifest;
        event.reply('game', {
          type: 'LATEST_VERSION',
          payload: manifest.latest.release,
        });
        break;
      }
      case 'RUN_LATEST': {
        if (!this.manifest) {
          throw new Error('manifest is not loaded');
        }
        const latestVersion = this.manifest.latest.release;
        const latestMeta = this.manifest.versions.find(
          (version) => version.id === latestVersion,
        );
        const metadata = await getMetadata(latestMeta.url);
        const game = new Game(
          getAppPath('minecraft'),
          metadata.id,
          metadata,
          auth.data,
        );
        event.reply('game', {
          type: 'RUN_STATUS',
          payload: 'install',
        });
        await game.install();
        event.reply('game', {
          type: 'RUN_STATUS',
          payload: 'run',
        });
        game.run().then(() => {
          event.reply('game', {
            type: 'RUN_STATUS',
            payload: 'idle',
          });
        });
        break;
      }
      default:
        throw new Error(`unknown message: ${message.type}`);
    }
  }
}

async function getVersionManifest() {
  const response = await gotBase.get(
    'https://launchermeta.mojang.com/mc/game/version_manifest.json',
  );
  return response.body;
}

async function getMetadata(url) {
  const response = await gotBase.get(url);
  return response.body;
}

module.exports = {
  GameManager,
};
