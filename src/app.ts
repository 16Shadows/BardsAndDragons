import KoaCoreApp from './modules/integration/koa/app';
import serve from 'koa-static';
import path from 'path';
import { ExampleService } from './services/ExampleService';
import { discoverControllers } from './modules/core/controllers/controller';
import { getDefaultConverters } from './modules/core/converters/default';

(async () => {
    const app = new KoaCoreApp();

    app.useSingleton(ExampleService);

    //Note: looks like serve doesn't interrupt middleware chain even if it finds a file to serve
    //May cause side effects, should find another package or implement it manually
    //UPD: Looking through its sources, it gives priority to other middleware first. Is this desired behaviour?

    //app.use(serve('./public'))
    app.use(serve(path.join(__dirname, '..', 'client', 'build')));

    //IMPORTANT: ALL ROUTES IN THE REACT APP MUST BE DEFINED ON THE SERVER AS WELL. THE SERVER SHOULD SERVER REACT APP'S BUNDLE WHEN THOSE ROUTES ARE REQUESTED

    app.useControllers( discoverControllers('./controllers', __dirname) );
    app.useTypeConverters( getDefaultConverters() );

    // Перенаправление всех оставшихся запросов на index.html React-приложения
    app.use(async (ctx, next) => {
        await serve(path.join(__dirname, '..', 'client', 'build', 'index.html'))(ctx, next);
    });

    app.listen(3000);
})();