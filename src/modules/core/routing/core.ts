import { HTTPMethod } from "../constants";
import { IConvertersProvider } from "../converters/storage";
import { IMimeTypesProvider } from "../mimeType/mimeTypeConverter";
import { constructor } from "../types";
import { DependencyContainer } from "tsyringe";
import { ParsedUrlQuery } from 'querystring';

module RoutingCore {
    export type RouteDefinitionPart = {
        readonly pattern: string;
        readonly isCaseSensitive?: boolean;
    };
    
    export type RouteArgument = {
        name: string;
        value: any;
    };

    export type RouteHandler = {
        handler: string;
        controller: constructor<Object>;
    };

    export type RouteEndpoint = {
        /**
         * A function registered as the handler of this endpoint.
         */
        handlers: RouteHandler[];
        /**
         * A set of arguments extracted from the route left-to-right based on its pattern.
         */
        arguments: RouteArgument[];
        /*
            The pattern that matched.
        */
        pattern: RouteDefinitionPart[];
    };

    export type HTTPHeaders = {
        [key: string]: string | string[]
        'Content-Type'?: string;
    }

    export type IncomingHttpHeaders = HTTPHeaders & {};
    export type OutgoingHttpHeaders = HTTPHeaders & {};

    export type HTTPRequest = {
        readonly headers: IncomingHttpHeaders;
        readonly body: NodeJS.ReadableStream;
        readonly method: HTTPMethod;
        readonly path: string;
        readonly query: ParsedUrlQuery;
    };

    export class HTTPResponse {
        readonly body?: NodeJS.ReadableStream;
        readonly code: number;
        readonly headers?: OutgoingHttpHeaders;

        constructor(code: number, headers?: OutgoingHttpHeaders, body?: NodeJS.ReadableStream) {
            this.body = body;
            this.code = code;
            this.headers = headers ?? {};
        }
    };

    export class ExtendedReturn {
        readonly code: number;
        readonly headers?: OutgoingHttpHeaders;
        readonly body?: any;
        readonly bodyMimeType?: string;

        constructor(code: number, headers?: OutgoingHttpHeaders, body?: any, bodyMimeType?: string) {
            this.code = code;
            this.headers = headers;
            this.body = body;
            this.bodyMimeType = bodyMimeType;
        }
    };
    
    export type ResolvedRoute = {
        execute(diContext: DependencyContainer): Promise<HTTPResponse | undefined>;
        resolvedPattern: RouteDefinitionPart[];
    };

    export interface IRouteRegistry {
        registerRoute(method: HTTPMethod, route: RouteDefinitionPart, handler: RouteHandler): void;
        registerRoute(method: HTTPMethod, route: RouteDefinitionPart[], handler: RouteHandler): void;
        registerRoute(method: HTTPMethod, route: string, handler: RouteHandler): void;
        registerRoute(method: HTTPMethod, route: string, handler: RouteHandler, caseSensitive: boolean): void;
    
        unregisterRoute(method: HTTPMethod, route: RouteDefinitionPart, handler: RouteHandler): void;
        unregisterRoute(method: HTTPMethod, route: RouteDefinitionPart[], handler: RouteHandler): void;
        unregisterRoute(method: HTTPMethod, route: string, handler: RouteHandler): void;
        unregisterRoute(method: HTTPMethod, route: string, handler: RouteHandler, caseSensitive: boolean): void;

        match(method: HTTPMethod, route: string, converters: IConvertersProvider): RouteEndpoint | undefined;
    }

    export interface IRouter {
        get registry(): IRouteRegistry;
        resolve(request: HTTPRequest, converters: IConvertersProvider, mimeTypes: IMimeTypesProvider): ResolvedRoute | undefined;
    }
}

export = RoutingCore;