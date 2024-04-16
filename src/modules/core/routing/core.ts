import { HTTPMethod } from "../constants";
import { IConvertersProvider } from "../converters/converter";

module RoutingCore {
    export type RouteDefinitionPart = {
        readonly pattern: string;
        readonly isCaseSensitive?: boolean;
    };
    
    export type RouteArgument = {
        name: string;
        value: any;
    };

    export type RouteEndpoint = {
        /**
         * A function registered as the handler of this endpoint.
         */
        handlers: Function[];
        /**
         * A set of arguments extracted from the route left-to-right based on its pattern.
         */
        arguments: RouteArgument[];
        /*
            The pattern that matched.
        */
        pattern: RouteDefinitionPart[];
    };

    export class HTTPResponse {
        readonly body: string;
        readonly code: number;

        constructor(code: number, body: string) {
            this.body = body;
            this.code = code;
        }
    };
    
    export type ResolvedRoute = {
        execute(): Promise<HTTPResponse>;
        resolvedPattern: RouteDefinitionPart[];
    };

    export interface IRouteRegistry {
        registerRoute(method: HTTPMethod, route: RouteDefinitionPart, handler: Function): void;
        registerRoute(method: HTTPMethod, route: RouteDefinitionPart[], handler: Function): void;
        registerRoute(method: HTTPMethod, route: string, handler: Function): void;
        registerRoute(method: HTTPMethod, route: string, handler: Function, caseSensitive: boolean): void;
    
        unregisterRoute(method: HTTPMethod, route: RouteDefinitionPart, handler: Function): void;
        unregisterRoute(method: HTTPMethod, route: RouteDefinitionPart[], handler: Function): void;
        unregisterRoute(method: HTTPMethod, route: string, handler: Function): void;
        unregisterRoute(method: HTTPMethod, route: string, handler: Function, caseSensitive: boolean): void;

        match(method: HTTPMethod, route: string, converters: IConvertersProvider): RouteEndpoint | undefined;
    }

    export interface IRouter {
        get registry(): IRouteRegistry;
        resolve(method: HTTPMethod, path: string, converters: IConvertersProvider): ResolvedRoute | undefined;
    }
}

export = RoutingCore;