import 'reflect-metadata'
import { DependencyContainer } from 'tsyringe';
import { constructor } from '../types';
import { IRouteRegistry } from '../routing/core';
import { getRoutesList } from '../routing/decorators';

module ControllersStorage {
    export class ControllersStorage implements Iterable<constructor<Object>> {
        protected _RegisteredControllers: Set<constructor<Object>>;

        constructor() {
            this._RegisteredControllers = new Set<constructor<Object>>();
        }

        [Symbol.iterator](): Iterator<constructor<Object>, any, undefined> {
            return this._RegisteredControllers[Symbol.iterator]();
        }

        register(controllerType: constructor<Object>) {
            this._RegisteredControllers.add(controllerType);
        }

        registerRoutes(registry: IRouteRegistry) {
            for (var controller of this)
            {
                var routes = getRoutesList(controller);
                if (routes == undefined)
                    continue;
                for (var route of routes)
                    registry.registerRoute(route.method, route.route, { handler: route.handlerName, controller: controller });
            }
        }

        unregisterRoutes(registry: IRouteRegistry) {
            for (var controller of this)
            {
                var routes = getRoutesList(controller);
                if (routes == undefined)
                    continue;
                for (var route of routes)
                    registry.unregisterRoute(route.method, route.route, { handler: route.handlerName, controller: controller });
            }
        }
    }
}

export = ControllersStorage;