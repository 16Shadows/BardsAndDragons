import 'reflect-metadata';
import Koa from 'koa';
import { IncomingMessage, ServerResponse } from "http";
import { Http2ServerRequest, Http2ServerResponse } from "http2";
import { DependencyContainer, container } from 'tsyringe';
import { constructor } from '../../core/types';
import { HTTPRequest, IRouter } from '../../core/routing/core';
import { createDefaultRouteRegistry } from '../../core/routing/defaults';
import { isController } from '../../core/controllers/decorators';
import { ConvertersProvider, ITypeConverter } from '../../core/converters/converter';
import { ControllersStorage } from '../../core/controllers/storage';
import { Router } from '../../core/routing/router';
import { getHttpMethodFromString } from '../../core/constants';
import { IMimeTypeConverter, MimeTypesProvider } from '../../core/mimeType/mimeTypeConverter';
import { PassThrough } from 'stream';
import { sanitizeRoute } from '../../core/routing/utils';

class KoaCoreApp<
    StateT = Koa.DefaultState,
    ContextT = Koa.DefaultContext,
> extends Koa<StateT, ContextT> {
    protected _DIContainer : DependencyContainer;
    protected _Router: IRouter;
    protected _MimeTypeProviders: MimeTypesProvider;
    protected _ConvertersProvider: ConvertersProvider;
    protected _ControllerStorage: ControllersStorage;

    /**
     * Initializes a new instance of the app
     * @param controllersPaths Paths to all directories containing controllers relative to process.cwd()
     */
    constructor(options?: {
        env?: string | undefined;
        keys?: string[] | undefined;
        proxy?: boolean | undefined;
        subdomainOffset?: number | undefined;
        proxyIpHeader?: string | undefined;
        maxIpsCount?: number | undefined;
        asyncLocalStorage?: boolean | undefined;
        router?: IRouter | undefined;
    }) {
        options = options ?? {};
        super(options);

        this._DIContainer = container.createChildContainer();

        this._ControllerStorage = new ControllersStorage(this._DIContainer);
        this._ConvertersProvider = new ConvertersProvider(this._DIContainer);
        this._MimeTypeProviders = new MimeTypesProvider(this._DIContainer);

        this._Router = options.router ?? new Router(createDefaultRouteRegistry());
    }

    /**
     * Adds a singleton into this app's DI container.
     * @param singletonType The singleton to add.
     * @returns This app
     */
    useSingleton(singletonType: constructor<Object>) : KoaCoreApp<StateT, ContextT> {
        this._DIContainer.registerSingleton(singletonType);
        return this;
    }

    /**
     * Adds a controller to this app which will handle the endpoints it declares. Supports DI.
     * @param controllerType The type of controller to add.
     * @returns This app
     */
    useController(controllerType: constructor<Object>) : KoaCoreApp<StateT, ContextT>
    {
        if (controllerType.length > 0 && !isController(controllerType))
            throw new TypeError(`Specified controller type ${controllerType.name} is not decorated with @Controller but is expecting DI.`);

        this._ControllerStorage.register(controllerType);
        return this;
    }

    useControllers(controllerTypes: Iterable<constructor<Object>>) : KoaCoreApp<StateT, ContextT> {
        for (var item of controllerTypes)
            this.useController(item);
        return this;
    }

    useTypeConverter(converterType: constructor<ITypeConverter>): KoaCoreApp<StateT, ContextT> {
        this._ConvertersProvider.register(converterType);
        return this;
    }

    useTypeConverters(converterTypes: Iterable<constructor<ITypeConverter>>): KoaCoreApp<StateT, ContextT> {
        for (var item of converterTypes)
            this.useTypeConverter(item);
        return this;
    }

    useMimeType(converterType: constructor<IMimeTypeConverter>): KoaCoreApp<StateT, ContextT> {
        this._MimeTypeProviders.register(converterType);
        return this;
    }

    useMimeTypes(converterTypes: Iterable<constructor<IMimeTypeConverter>>): KoaCoreApp<StateT, ContextT> {
        for (var item of converterTypes)
            this.useMimeType(item);
        return this;
    }

    useControllerRouting(): KoaCoreApp<StateT, ContextT> {
        this.use(async (ctx, next) => {
            var request: HTTPRequest = {
                headers: ctx.headers,
                body: ctx.req,
                method: getHttpMethodFromString(ctx.method),
                path: sanitizeRoute(decodeURI(ctx.path)),
                query: ctx.query
            }

            //Use router to find an endpoint
            var route = this._Router.resolve(request, this._ConvertersProvider, this._MimeTypeProviders);

            //No endpoint found - pass control to the next middleware
            if (route == undefined)
                return await next();
            
            //Attach info about the newly found route to the context
            var ctxInfo = {
                route: route.resolvedPattern,
                shouldEvaluate: true
            };
            ctx['route'] = ctxInfo;
            
            //Pass control to the next middleware - let it do whatever it does
            await next();
            
            //Check if any of the downstream middleware has set shouldEvaluate to false or changed status from 404 Not Found
            if (ctxInfo.shouldEvaluate && ctx.status == 404)
            {
                var result = await route.execute(this._DIContainer);
                if (result != undefined) {
                    if (result.body != undefined)
                    {
                        var body = new PassThrough();
                        result.body.pipe(body);
                        ctx.body = body;
                    }
                    ctx.status = result.code;
                    if (result.headers != undefined)
                    {
                        for (var header in result.headers)
                            ctx.set(header, result.headers[header].toString());
                    }
                }
            }
        });

        return this;
    }

    callback(): (req: IncomingMessage | Http2ServerRequest, res: Http2ServerResponse | ServerResponse<IncomingMessage>) => Promise<void> {
        this._ControllerStorage.unregisterRoutes(this._Router.registry);
        this._ControllerStorage.registerRoutes(this._Router.registry);

        return super.callback();
    }
}

export = KoaCoreApp;