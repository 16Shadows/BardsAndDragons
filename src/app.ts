const Koa = require('koa');
import Router from 'koa-router';
import serve from 'koa-static';

(async () => {
    const app = new Koa();
    const router = new Router();

    router.get("", (ctx, next) => {
        ctx.body = "Hello, world!";
    });

    app.use(router.routes());

    app.use(serve('./public'))

    app.listen(3000, () => {
        console.log("Server started.");
    });
})();