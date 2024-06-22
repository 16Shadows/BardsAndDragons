import 'reflect-metadata';
import { HTTPMethod, Metadata_Prefix } from '../constants';
import { RouteDefinitionPart } from './core';
import { getContollerRoutes } from '../controllers/decorators';
import { constructor } from '../types';
import { MiddlewareBag } from '../middleware/middleware';

module RoutingDecorators {
    const Metadata_HandlerRoutes : string = `${Metadata_Prefix}HandlerRoutes`;
    const Metadata_Routes : string = `${Metadata_Prefix}Routes`;

    export type Endpoint = {
        (bag: MiddlewareBag, ...args: any[]): Promise<any>
    };

    type HandlerRouteInfo = {
        handlerName: string;
        method: HTTPMethod;
    } & RouteDefinitionPart;

    type RouteEntry = {
        route: RouteDefinitionPart[];
        handlerName: string;
        method: HTTPMethod;
    }

    class RoutesList implements Iterable<RouteEntry> {
        protected _Routes : RouteEntry[];

        constructor() {
            this._Routes = [];
        }

        [Symbol.iterator](): Iterator<RouteEntry, any, undefined> {
            return this._Routes[Symbol.iterator]();
        }

        addRoute(method: HTTPMethod, route: RouteDefinitionPart[], handlerName: string) {
            this._Routes.push({
                route: route,
                handlerName: handlerName,
                method: method
            });
        }
    }

    export function getRoutesList(target: constructor<Object>): Iterable<RouteEntry> | undefined {
        //This solutions feels kina hacky but on the other hand it doesn't depend on decorator order...
        var routesList : RoutesList | undefined = Reflect.getMetadata(Metadata_Routes, target.prototype);
        if (routesList == undefined)
        {
            var routes : HandlerRouteInfo[] | undefined = Reflect.getMetadata(Metadata_HandlerRoutes, target.prototype);
            if (routes == undefined)
                return undefined;

            Reflect.defineMetadata(Metadata_Routes, routesList = new RoutesList(), target.prototype);

            for (var route of routes) {
                if (route.pattern.startsWith('/'))
                    routesList.addRoute(route.method, [ { pattern: route.pattern, isCaseSensitive: route.isCaseSensitive } ], route.handlerName);
                else
                {
                    for (var controllerRoute of getContollerRoutes(target))
                    {
                        if (controllerRoute.pattern.length > 0 && route.pattern.length > 0)
                            routesList.addRoute(route.method, [controllerRoute, { pattern: route.pattern, isCaseSensitive: route.isCaseSensitive }], route.handlerName);
                        else if (controllerRoute.pattern.length > 0)
                            routesList.addRoute(route.method, [controllerRoute], route.handlerName);
                        else
                            routesList.addRoute(route.method, [{ pattern: route.pattern, isCaseSensitive: route.isCaseSensitive }], route.handlerName);
                    }
                }
            }   
        }
        return routesList;
    }

    export function Route<TBag extends MiddlewareBag>(method: HTTPMethod, route: string, caseSensitive: boolean = true) {
        return (target : Object, name: string, prop: TypedPropertyDescriptor<Endpoint>) => {
            var routes : HandlerRouteInfo[] | undefined = Reflect.getMetadata(Metadata_HandlerRoutes, target);
            if (routes === undefined)
                Reflect.defineMetadata(Metadata_HandlerRoutes, routes = [], target);

            routes.push({ pattern: route, isCaseSensitive: caseSensitive, handlerName: name, method: method });
        };
    }

    export function GET(route: string = '', caseSensitive: boolean = false) {
        return Route(HTTPMethod.GET, route, caseSensitive);
    }

    export function POST(route: string = '', caseSensitive: boolean = false) {
        return Route(HTTPMethod.POST, route, caseSensitive);
    }

    export function DELETE(route: string = '', caseSensitive: boolean = false) {
        return Route(HTTPMethod.DELETE, route, caseSensitive);
    }

    export function PATCH(route: string = '', caseSensitive: boolean = false) {
        return Route(HTTPMethod.PATCH, route, caseSensitive);
    }

    export function PUT(route: string = '', caseSensitive: boolean = false) {
        return Route(HTTPMethod.PUT, route, caseSensitive);
    }

    export function HEAD(route: string = '', caseSensitive: boolean = false) {
        return Route(HTTPMethod.HEAD, route, caseSensitive);
    }
}

export = RoutingDecorators;