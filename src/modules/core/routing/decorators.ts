import 'reflect-metadata';
import { HTTPMethod, Metadata_Prefix } from '../constants';
import { RouteDefinitionPart } from './core';
import { getContollerRoutes } from '../controllers/controller';
import { constructor } from '../types';

module RoutingDecorators {
    const Metadata_HandlerRoutes : string = `${Metadata_Prefix}HandlerRoutes`;
    const Metadata_Routes : string = `${Metadata_Prefix}Routes`;

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

    export type Endpoint = {
        (...args: any[]): Promise<any>
    }

    export function Route(method: HTTPMethod, route: string, caseSensitive: boolean = true) {
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

    const Metadata_Accept : string = `${Metadata_Prefix}Accept`;
    const Metadata_ContentType : string = `${Metadata_Prefix}ContentType`;

    export function mimeTypeToRegex(type: string): string {
        return type.toLowerCase().replace('*', '[^\\]+');
    }

    export function getAcceptPatterns(target: constructor<Object>, handlerName: string): Iterable<string> | undefined {
        var accept: Map<string, Set<string>> = Reflect.getMetadata(Metadata_Accept, target);
        if (accept == undefined)
            return undefined;
        return accept.get(handlerName);
    }

    export function Accept(first: string, ...args: string[]) {
        return (target : Object, name: string, prop: TypedPropertyDescriptor<Endpoint>) => {
            var accept: Map<string, Set<string>> = Reflect.getMetadata(Metadata_Accept, target);
            if (accept == undefined)
                Reflect.defineMetadata(Metadata_Accept, accept = new Map<string, Set<string>>(), target);
            
            var functionAccept: Set<string> = accept.get(name);
            if (functionAccept == undefined)
                accept.set(name, functionAccept = new Set<string>());

            for (var item of args)
                functionAccept.add(mimeTypeToRegex(item));
        };
    }

    export function getContentTypes(target: constructor<Object>, handlerName: string): Iterable<string> | undefined {
        var accept: Map<string, Set<string>> = Reflect.getMetadata(Metadata_ContentType, target);
        if (accept == undefined)
            return undefined;
        return accept.get(handlerName);
    }

    export function Return(first: string, ...args: string[]) {
        return (target : Object, name: string, prop: TypedPropertyDescriptor<Endpoint>) => {
            var accept: Map<string, Set<string>> = Reflect.getMetadata(Metadata_ContentType, target);
            if (accept == undefined)
                Reflect.defineMetadata(Metadata_Accept, accept = new Map<string, Set<string>>(), target);
            
            var functionAccept: Set<string> = accept.get(name);
            if (functionAccept == undefined)
                accept.set(name, functionAccept = new Set<string>());

            for (var item of args)
                functionAccept.add(item);
        };
    }
}

export = RoutingDecorators;