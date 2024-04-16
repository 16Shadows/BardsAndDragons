import KoaCoreApp from './modules/integration/koa/app';
import serve from 'koa-static';
import { ExampleService } from './services/ExampleService';
import { discoverControllers } from './modules/core/controllers/controller';
import { getDefaultConverters } from './modules/core/converters/default';

(async () => {
    const app = new KoaCoreApp();

    app.useSingleton(ExampleService);

    //Note: looks like serve doesn't interrupt middleware chain even if it finds a file to serve
    //May cause side effects, should find another package or implement it manually
    //UPD: Looking through its sources, it gives priority to other middleware first. Is this desired behaviour?
    app.use(serve('./public'));

    //IMPORTANT: ALL ROUTES IN THE REACT APP MUST BE DEFINED ON THE SERVER AS WELL. THE SERVER SHOULD SERVER REACT APP'S BUNDLE WHEN THOSE ROUTES ARE REQUESTED

    app.useControllers( discoverControllers('./controllers', __dirname) );
    app.useTypeConverters( getDefaultConverters() );

    app.listen(3000);
})();