'use strict';

const { Assets } = require('../public/src/assets');

const assetsUrl =
  'https://launchermeta.mojang.com/v1/packages/3ba7ebd7f16e0edc256d0645dce3adbce84bc32c/1.16.json';

const assets = new Assets(assetsUrl, '1.16');
assets.install('test-data/assets');
