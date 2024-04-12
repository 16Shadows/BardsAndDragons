import 'reflect-metadata';
import CoreApp from './modules/core/core';
import Router from 'koa-router';
import serve from 'koa-static';
import { ExampleService } from './services/ExampleService';

(async () => {
    const app = new CoreApp();

    app.useSingleton(ExampleService);

    //Note: looks like serve doesn't interrupt middleware chain even if it finds a file to serve
    //May cause side effects, should find another package or implement it manually
    //UPD: Looking through its sources, it gives priority to other middleware first. Is this desired behaviour?
    app.use(serve('./public'))

    const router = new Router();

    router.get("/:id", (ctx, next) => {
        console.log(ctx.params.id);
        console.log(typeof ctx.params.id);
        ctx.body = `Hello, world of ${ctx.params.id}!`;
    });

    app.use(router.routes());

    app.useControllers('./controllers', __dirname);
    app.listen(3000);
})();