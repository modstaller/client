'use strict';

const gameMeta = require('./fixtures/1.15.2.json');
const { Libraries } = require('../public/src/libraries');

const libs = new Libraries(gameMeta.libraries);
libs.install('test-data/lib');
