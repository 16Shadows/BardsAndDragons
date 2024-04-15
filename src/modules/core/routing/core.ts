import { HTTPMethod } from "../constants";
import { IConvertersProvider } from "../converter";

module RoutingCore {
    export type RouteDefinitionPart = {
        pattern: string;
        isCaseSensitive?: boolean;
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
    };

    export interface IRouteRegistry {
        registerRoute(method: HTTPMethod, route: RouteDefinitionPart, handler: Function): void;
        registerRoute(method: HTTPMethod, route: RouteDefinitionPart[], handler: Function): void;
        registerRoute(method: HTTPMethod, route: string, handler: Function): void;
        registerRoute(method: HTTPMethod, route: string, handler: Function, caseSensitive: boolean): void;
    
        match(method: HTTPMethod, route: string, converters: IConvertersProvider): RouteEndpoint | undefined;
    }
}

export = RoutingCore;