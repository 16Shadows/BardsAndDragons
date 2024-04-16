import 'reflect-metadata';
import Koa from 'koa';
import { IncomingMessage, ServerResponse } from "http";
import { Http2ServerRequest, Http2ServerResponse } from "http2";
import { DependencyContainer, container } from 'tsyringe';
import { constructor } from '../../core/types';
import { IRouter } from '../../core/routing/core';
import { createDefaultRouteRegistry } from '../../core/routing/defaults';
import { isController } from '../../core/controllers/controller';
import { ConvertersProvider, ITypeConverter } from '../../core/converters/converter';
import { ControllersStorage } from '../../core/controllers/storage';
import { Router } from '../../core/routing/router';
import { getHttpMethodFromString } from '../../core/constants';

class KoaCoreApp<
    StateT = Koa.DefaultState,
    ContextT = Koa.DefaultContext,
> extends Koa<StateT, ContextT> {
    protected _DIContainer : DependencyContainer;
    protected _Router: IRouter;
    protected _ConvertersProvider: ConvertersProvider;
    protected _ControllerStorage: ControllersStorage;
    protected _Initialized: boolean;

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
        
        this._Initialized = false;

        this._ControllerStorage = new ControllersStorage(this._DIContainer);
        this._ConvertersProvider = new ConvertersProvider(this._DIContainer);

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

    useTypeConverter(converterType: constructor<ITypeConverter>, typeIds?: Iterable<string> | undefined): KoaCoreApp<StateT, ContextT> {
        this._ConvertersProvider.register(converterType, typeIds);
        return this;
    }

    useTypeConverters(converterTypes: Iterable<constructor<ITypeConverter>>): KoaCoreApp<StateT, ContextT> {
        for (var item of converterTypes)
            this.useTypeConverter(item);
        return this;
    }

    callback(): (req: IncomingMessage | Http2ServerRequest, res: Http2ServerResponse | ServerResponse<IncomingMessage>) => Promise<void> {
        this._ControllerStorage.unregisterRoutes(this._Router.registry);
        this._ControllerStorage.rebuild();
        this._ControllerStorage.registerRoutes(this._Router.registry);

        if (!this._Initialized)
        {
            this.use(async (ctx, next) => {
                var route = this._Router.resolve(getHttpMethodFromString(ctx.method), decodeURI(ctx.path), this._ConvertersProvider);
                if (route == undefined)
                    return await next();
                var ctxInfo = {
                    route: route.resolvedPattern,
                    shouldEvaluate: true
                };
                ctx['route'] = ctxInfo;
                await next();
                if (ctxInfo.shouldEvaluate)
                {
                    var result = await route.execute();
                    ctx.body = result.body;
                    ctx.status = result.code;
                }
            });
            this._Initialized = true;
        }

        return super.callback();
    }
}

export = KoaCoreApp;