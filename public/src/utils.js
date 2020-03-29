'use strict';

const path = require('path');

const { app } = require('electron');
const { readJson, outputJson } = require('fs-extra');

function getAppJsonPath(name) {
  return path.join(app.getPath('userData'), 'App', name);
}

async function readAppJson(name) {
  try {
    return await readJson(getAppJsonPath(name));
  } catch (e) {
    return null;
  }
}

async function saveAppJson(name, value) {
  await outputJson(getAppJsonPath(name), value);
}

module.exports = { readAppJson, saveAppJson };
