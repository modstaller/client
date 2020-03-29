'use strict';

const { resolve, join } = require('path');
const { spawn } = require('child_process');

const fs = require('fs-extra');

const { Libraries } = require('./libraries');
const { downloadFile, isAllowedByRules, osName } = require('./utils');

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
    const clientPath = this.jarPath();
    if (await fs.exists(clientPath)) {
      console.error(`client is already downloaded`);
      return;
    }

    await downloadFile(this.gameData.downloads.client.url, clientPath);
  }

  jarPath() {
    return join(this.folder, 'versions', this.name, 'client.jar');
  }

  libPath() {
    return join(this.folder, 'libraries');
  }

  assetsPath() {
    return join(this.folder, 'assets');
  }

  replaceArg(arg) {
    const match = /\$\{([a-z0-9_]+)\}/.exec(arg);
    if (!match) {
      return arg;
    }
    const name = match[1];
    const value = this.getArgValue(name);
    if (value) {
      return arg.replace(`\$\{${name}\}`, value);
    }
    return 'null';
  }

  getArgValue(name) {
    switch (name) {
      case 'launcher_name':
        return 'Modstaller';
      case 'launcher_version':
        // TODO: get version from somewhere.
        return '0.0.0';
      case 'classpath':
        return `${this.libraries.getClassPath()};${this.jarPath()}`;
      case 'natives_directory':
        return this.libPath();
      case 'auth_player_name':
        return this.authData.user.name;
      case 'version_name':
        return this.gameData.id;
      case 'game_directory':
        return this.folder;
      case 'assets_root':
        return this.assetsPath();
      case 'assets_index_name':
        return this.gameData.assets;
      case 'auth_uuid':
        return this.authData.user.id;
      case 'auth_access_token':
        return this.authData.accessTokenRaw;
      case 'user_type':
        return 'mojang';
      case 'version_type':
        return 'release';
      default:
        console.error(`unknown arg name: ${name}`);
        return null;
    }
  }

  getArgs() {
    const args = [];
    for (const jvmArg of this.gameData.arguments.jvm) {
      if (typeof jvmArg === 'string') {
        args.push(this.replaceArg(jvmArg));
      } else {
        if (!isAllowedByRules(jvmArg)) {
          continue;
        }
        if (typeof jvmArg.value === 'string') {
          args.push(this.replaceArg(jvmArg.value));
        } else if (Array.isArray(jvmArg.value)) {
          for (const argValue of jvmArg.value) {
            args.push(this.replaceArg(argValue));
          }
        } else {
          console.error(`unknown arg type: ${JSON.stringify(jvmArg)}`);
        }
      }
    }

    args.push(this.gameData.mainClass);

    for (const gameArg of this.gameData.arguments.game) {
      if (typeof gameArg === 'string') {
        args.push(this.replaceArg(gameArg));
      } else {
        if (!isAllowedByRules(gameArg)) {
          continue;
        }
        if (typeof gameArg.value === 'string') {
          args.push(this.replaceArg(gameArg.value));
        } else if (Array.isArray(gameArg.value)) {
          for (const argValue of gameArg.value) {
            args.push(this.replaceArg(argValue));
          }
        } else {
          console.error(`unknown arg type: ${JSON.stringify(gameArg)}`);
        }
      }
    }

    return args;
  }

  run() {
    return new Promise((resolve) => {
      const args = this.getArgs();
      const proc = spawn(osName === 'windows' ? 'javaw.exe' : 'java', args);
      proc.on('error', resolve);
      proc.on('exit', resolve);
    });
  }
}

module.exports = { Game };
