"use strict";
import Koa from 'koa';
import Router from 'koa-router';
import convert from 'koa-convert';
import json from 'koa-json';
import bodyparser from 'koa-bodyparser';
//import costatic from 'koa-static'
import scribejs from '../scribe'


const scribe = scribejs();

const console = process.console;
const webPanel = scribe.webPanel();

const app = new Koa();
const router = Router();

app.use(convert(bodyparser()));
app.use(convert(json()));
app.use(convert(scribe.koa.logger()));
//app.use(convert(costatic(__dirname + '/public')));

// logger
app.use(async(ctx, next) => {
    const start = new Date();
    await next();
    const ms = new Date() - start;
    console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
    console.log(ctx.request.body);
});

//router.use('/api', api.routes(), api.allowedMethods());
router.use('/logs', webPanel.routes(), webPanel.allowedMethods());
app.use(router.routes(), router.allowedMethods());

// response

app.on('error', function (err, ctx) {
    console.error('server error', err, ctx);
});

app.listen(4005, () => {
    console.log('Server listening')
});