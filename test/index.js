const { Entry } = require('../dist/bundle');
const path = require('path');

const pack = new Entry({ configPath: path.join(__dirname, '..' ,'minipack.config.js') });

pack.init().start();
