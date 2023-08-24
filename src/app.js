const Koa = require('koa');
const cors = require('koa2-cors');
const router = require('./routes');
const bodoParser = require('koa-bodyparser');

const app = new Koa();

app.use(bodoParser());
app.use(cors());
app.use(router.routes()).use(router.allowedMethods());
app.use(async ctx => {
    console.log(`app is running, please open port ${3000}`);
});

app.listen(3000);
