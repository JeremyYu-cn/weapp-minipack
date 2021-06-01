const MiniPack = require('../dist/bundle');
const path = require('path');

const pack = new MiniPack({ configPath: path.join(__dirname, '..' ,'minipack.config.js') });

pack.init().start();
