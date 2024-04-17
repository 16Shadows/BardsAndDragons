import 'reflect-metadata'
import { DependencyContainer } from 'tsyringe';
import { constructor } from '../types';
import { IRouteRegistry } from '../routing/core';
import { getRoutesList } from '../routing/decorators';

module ControllersStorage {
    export class ControllersStorage implements Iterable<Object> {
        protected _DIContext: DependencyContainer;
        protected _RegisteredControllers: Set<constructor<Object>>;
        protected _InstantiatedControllers: Object[];

        constructor(diContext: DependencyContainer) {
            this._InstantiatedControllers = [];
            this._RegisteredControllers = new Set<constructor<Object>>();
            this._DIContext = diContext;
        }

        [Symbol.iterator](): Iterator<Object, any, undefined> {
            return this._InstantiatedControllers[Symbol.iterator]();
        }

        register(controllerType: constructor<Object>) {
            this._RegisteredControllers.add(controllerType);
            this._DIContext.registerSingleton(controllerType);
        }

        rebuild() {
            if (this._InstantiatedControllers.length == this._RegisteredControllers.size)
                return;

            this._InstantiatedControllers.length = 0;
            for (var controller of this._RegisteredControllers)
                this._InstantiatedControllers.push(this._DIContext.resolve(controller));
        }

        registerRoutes(registry: IRouteRegistry) {
            for (var controller of this)
            {
                var routes = getRoutesList(controller.constructor as constructor<Object>);
                if (routes == undefined)
                    continue;
                for (var route of routes)
                    registry.registerRoute(route.method, route.route, { handler: controller[route.handlerName], controller: controller });
            }
        }

        unregisterRoutes(registry: IRouteRegistry) {
            for (var controller of this)
            {
                var routes = getRoutesList(controller.constructor as constructor<Object>);
                if (routes == undefined)
                    continue;
                for (var route of routes)
                    registry.unregisterRoute(route.method, route.route, { handler: controller[route.handlerName], controller: controller });
            }
        }
    }
}

export = ControllersStorage;