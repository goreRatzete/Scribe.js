require('babel-polyfill');
require('babel-register')({
    presets: [
        "es2015",
        "stage-3"
    ]
});

require('./koa-server');