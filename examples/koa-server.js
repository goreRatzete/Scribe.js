"use strict";
import Koa from 'koa';
import Router from 'koa-router';
import convert from 'koa-convert';
import json from 'koa-json';
import bodyparser from 'koa-bodyparser';
import logger from 'koa-logger';
import costatic from 'koa-static'
//import * as Scribe from '../index.js';


const port = 4005;
const options = {
    "app": 'koa-server',
    "id": process.pid,
    "module": {
        "writer/SocketIO": {
            "port": 50000,
            "options": {}
        },
        "router/Viewer/client": {
            "background": "#131B21",
            "socketPorts": [
                50000
            ]
        }
    },
    "debug": true
};

//const console = Scribe.create(options);

const app = new Koa();
const router = Router();

app.use(convert(bodyparser()));
app.use(convert(json()));
app.use(convert(logger()));
app.use(convert(costatic(__dirname + '/public')));

// logger
app.use(async(ctx, next) => {
    const start = new Date();
    await next();
    const ms = new Date() - start;
    console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
    console.log(ctx.request.body);
});

//router.use('/api', api.routes(), api.allowedMethods());

app.use(router.routes(), router.allowedMethods());

// response

app.on('error', function (err, ctx) {
    console.error('server error', err, ctx);
});

app.listen(port);

module.exports = app;