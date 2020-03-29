'use strict';

const gameMeta = require('./fixtures/1.8.9.json');
const { Libraries } = require('../public/src/libraries');

const libs = new Libraries(gameMeta.libraries);
libs.install('test-data/lib');
