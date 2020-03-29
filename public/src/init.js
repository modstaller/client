'use strict';

const auth = require('./auth');

function init() {
  auth.init();
}

exports.init = init;
