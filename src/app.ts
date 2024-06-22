import KoaCoreApp from './modules/integration/koa/app';
import serve from 'koa-static';
import send from 'koa-send';
import path from 'path';
import {ExampleService} from './services/ExampleService';
import {discoverControllers} from './modules/core/controllers/discovery';
import {getDefaultConverters} from './modules/core/converters/default';
import {getDefaultMimeTypes} from './modules/core/mimeType/default';
import {ModelDataSource} from './model/dataSource';
import {discoverMimeTypeConverters} from './modules/core/mimeType/mimeTypeConverter';
import {TokenService} from "./services/TokenService";
import {discoverConverters} from './modules/core/converters/discovery';
import {UserNotificationService} from './services/UserNotificationService';
import {TestService} from "./services/TestService";
import {MatchingService} from "./services/MatchingService";

(async () => {
    const app = new KoaCoreApp();

    const dataSource: ModelDataSource = await new ModelDataSource().initialize();

    app.useSingleton(dataSource);

    // TODO: delete test service in production
    app.useSingleton(ExampleService);
    app.useSingleton(TestService);

    app.useSingleton(TokenService);
    app.useSingleton(UserNotificationService);
    app.useSingleton(MatchingService);

    //Note: looks like serve doesn't interrupt middleware chain even if it finds a file to serve
    //May cause side effects, should find another package or implement it manually
    //UPD: Looking through its sources, it gives priority to other middleware first. Is this desired behaviour?
    app.use(async (ctx, next) => {
        await next();

        if (ctx.status == 404)
            await send(ctx, './public/index.html');
    })
    app.use(serve('./public'));

    //Inject custom routing middleware where needed
    app.useControllerRouting();

    //IMPORTANT: ALL ROUTES IN THE REACT APP MUST BE DEFINED ON THE SERVER AS WELL. THE SERVER SHOULD SERVER REACT APP'S BUNDLE WHEN THOSE ROUTES ARE REQUESTED

    app.useControllers(discoverControllers('./controllers', __dirname));
    app.useControllers(discoverControllers('./images', __dirname));
    app.useTypeConverters(getDefaultConverters());
    app.useTypeConverters(discoverConverters('./converters', __dirname));
    app.useMimeTypes(discoverMimeTypeConverters('./images', __dirname));
    app.useTypeConverters(discoverConverters('./converters', __dirname));
    app.useMimeTypes(getDefaultMimeTypes());

    //Start server
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Server started on port ${port}`));
})();