'use strict';

const os = require('os');
const path = require('path');

const { app } = require('electron');
const { readJson, outputJson } = require('fs-extra');

let osName = '';
const platform = os.platform();
if (platform === 'win32') {
  osName = 'windows';
} else if (platform === 'darwin') {
  osName = 'linux';
} else {
  osName = 'osx';
}

const arch = os.arch() === 'x64' ? 'x64' : 'x32';

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

function isAllowedByRules(element) {
  if (!element.rules || element.rules.length === 0) {
    // No rule
    return true;
  }

  if (element.rules.length === 1) {
    // Allow with a condition
    const [rule] = element.rules;
    if (rule.action !== 'allow') {
      throw new Error(`unsupported action with one rule: ${rule.action}`);
    }

    if (rule.features) {
      // TODO: support this?
      return false;
    }

    if (rule.os) {
      if (rule.os.name) {
        return rule.os.name === osName;
      }
      if (rule.os.arch) {
        return rule.os.arch === arch;
      }
    }

    throw new Error(`unknown rule: ${JSON.stringify(rule)}`);
  }

  const [defaultRule, ...otherRules] = element.rules;

  const defaultAction = defaultRule.action;
  const defaultAllow = defaultAction === 'allow';

  for (const rule of otherRules) {
    if (rule.action === defaultAction) {
      continue;
    }

    if (rule.features) {
      // TODO: support this?
      continue;
    }

    if (rule.os) {
      if (rule.os.name && rule.os.name === osName) {
        return !defaultAllow;
      }
      if (rule.os.arch && rule.os.arch === arch) {
        return !defaultAllow;
      }
    }
  }

  return defaultAllow;
}

module.exports = { readAppJson, saveAppJson, isAllowedByRules, osName, arch };
