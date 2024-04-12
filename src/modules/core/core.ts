import Koa from 'koa';
import { IncomingMessage, ServerResponse } from "http";
import { Http2ServerRequest, Http2ServerResponse } from "http2";
import { ControllerBase, DiscoveredControllers } from './controller';
import { DependencyContainer, container } from 'tsyringe';
import { constructor } from 'tsyringe/dist/typings/types';
import path from 'path';
import requireDirectory from 'require-directory';

//Dirty but tsc has issues with importing the module containing typeInfo
const tsyringe = require('tsyringe/dist/cjs/dependency-container.js');

class CoreApp<
    StateT = Koa.DefaultState,
    ContextT = Koa.DefaultContext,
> extends Koa<StateT, ContextT> {
    protected _RegisteredControllers : constructor<ControllerBase>[];
    protected _InstantiatedControllers : ControllerBase[];
    protected _DIContainer : DependencyContainer;

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
    }) {
        super(options);
        this._DIContainer = container.createChildContainer();
        this._RegisteredControllers = [];
        this._InstantiatedControllers = [];
    }

    /**
     * Adds a singleton into this app's DI container.
     * @param singletonType The singleton to add.
     * @returns This app
     */
    useSingleton<T>(singletonType: constructor<T>) : CoreApp<StateT, ContextT> {
        this._DIContainer.registerSingleton(singletonType);
        return this;
    }

    /**
     * Adds a controller to this app which will handle the endpoints it declares. Supports DI.
     * @param controllerType The type of controller to add.
     * @returns This app
     */
    useController(controllerType: constructor<ControllerBase>) : CoreApp<StateT, ContextT>
    {
        if (controllerType.length > 0 && !tsyringe.typeInfo.has(controllerType))
            throw new TypeError(`Specified controller type ${controllerType.name} is not decorated with @Controller or @injectable but is expecting DI.`);

        this._RegisteredControllers.push(controllerType);
        this._DIContainer.registerSingleton(controllerType);
        return this;
    }

    /**
     * Automatically discovers all controllers in ts/js files decorated with @Controller
     * @param pathToFolder The path to the folder containing controllers relative to process.pwd()
     * @returns This app
     */
    useControllers(pathToFolder: string, relativeTo: string = process.cwd()) : CoreApp<StateT, ContextT> {
        var modules = requireDirectory(module, './' + path.relative(__dirname, path.resolve(relativeTo, pathToFolder)), {
            extensions: ['js', 'ts']
        });

        function* recursiveDiscovery(modulesList : any) : Generator<constructor<ControllerBase>> {
            for (var entry in modulesList) {
                if (typeof modulesList[entry] == 'object')
                    yield* recursiveDiscovery(modulesList[entry]);
                else if (typeof modulesList[entry] == 'function' && DiscoveredControllers.isController(modulesList[entry]))
                    yield modulesList[entry];
            }
        }  

        for (var controller of recursiveDiscovery(modules))
            this._RegisteredControllers.push(controller);
        
        return this;
    }

    callback(): (req: IncomingMessage | Http2ServerRequest, res: Http2ServerResponse | ServerResponse<IncomingMessage>) => Promise<void> {
        //If these values are different, either initialization hasn't occured yet or new controlers were registered
        if (this._RegisteredControllers.length != this._InstantiatedControllers.length)
        {
            //Re-resolve all controllers. Since controllers are registered as singletons in the DI container, only new ones will be created.
            this._InstantiatedControllers.length = 0;
            for (var controller of this._RegisteredControllers) {
                this._InstantiatedControllers.push(this._DIContainer.resolve(controller));
            }    
        }

        return super.callback();
    }
}

export = CoreApp;