'use strict';

const gameData = require('./fixtures/1.8.9.json');
const { Libraries } = require('../public/src/libraries');

const libs = new Libraries(gameData.libraries);
libs.install('test-data/libraries');
