import KoaCoreApp from './modules/integration/koa/app';
import serve from 'koa-static';
import path from 'path';
import cors from '@koa/cors';
import {ExampleService} from './services/ExampleService';
import {discoverControllers} from './modules/core/controllers/discovery';
import {getDefaultConverters} from './modules/core/converters/default';
import {getDefaultMimeTypes} from './modules/core/mimeType/default';
import {ModelDataSource} from './model/dataSource';

(async () => {
    const app = new KoaCoreApp();
    // Enable CORS for all routes
    app.use(cors());

    const dataSource: ModelDataSource = await new ModelDataSource().initialize();

    app.useSingleton(ExampleService);
    app.useSingleton(dataSource);

    //Note: looks like serve doesn't interrupt middleware chain even if it finds a file to serve
    //May cause side effects, should find another package or implement it manually
    //UPD: Looking through its sources, it gives priority to other middleware first. Is this desired behaviour?
    app.use(serve('./public'));
    app.use(serve(path.join(__dirname, '..', 'client', 'build')));

    //Inject custom routing middleware where needed
    app.useControllerRouting();

    //IMPORTANT: ALL ROUTES IN THE REACT APP MUST BE DEFINED ON THE SERVER AS WELL. THE SERVER SHOULD SERVER REACT APP'S BUNDLE WHEN THOSE ROUTES ARE REQUESTED

    app.useControllers(discoverControllers('./controllers', __dirname));
    app.useTypeConverters(getDefaultConverters());
    app.useMimeTypes(getDefaultMimeTypes());

    // Перенаправление всех оставшихся запросов на index.html React-приложения
    app.use(async (ctx, next) => {
        await serve(path.join(__dirname, '..', 'client', 'build', 'index.html'))(ctx, next);
    });

    app.listen(3000);
})();