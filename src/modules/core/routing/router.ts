import { DependencyContainer } from "tsyringe";
import { IConvertersProvider } from "../converters/storage";
import { getAcceptContentTypes, getReturnContentTypes } from "../mimeType/decorators";
import { IMimeTypeConverter, IMimeTypesProvider, MimeTypeParams } from "../mimeType/mimeTypeConverter";
import { ExtendedReturn, HTTPRequest, HTTPResponse, IRouteRegistry, IRouter, ResolvedRoute, RouteEndpoint, RouteHandler } from "./core";
import contentType from 'content-type';
import { HTTPMethod } from "../constants";
import { constructor } from "../types";
import { IMiddleware, MiddlewareBag, MiddlewareContext, getControllerMiddleware, getHandlerMiddleware } from "../middleware/middleware";

export class Router implements IRouter {
    protected _RouteRegistry : IRouteRegistry;
    protected _DefaultMimeType: string;

    get registry(): IRouteRegistry {
        return this._RouteRegistry;
    }

    constructor(registry: IRouteRegistry, defaultMimeType?: string) {
        this._RouteRegistry = registry;
        this._DefaultMimeType = defaultMimeType ?? 'text/plain';
    }

    resolve(request: HTTPRequest, converters: IConvertersProvider, mimeTypes: IMimeTypesProvider): ResolvedRoute | undefined {
        var endpoints: RouteEndpoint | undefined = this._RouteRegistry.match(request.method, request.path, converters);
        var self = this;
        if (endpoints == undefined)
            return undefined;
        return {
            execute: async function(context: DependencyContainer): Promise<HTTPResponse> {
                var args = endpoints.arguments.map(x => x.value);
                return await self.executeHandlers(request, endpoints.handlers, args, mimeTypes, context);
            },
            resolvedPattern: endpoints.pattern
        };
    }

    async executeHandlers(request: HTTPRequest, handlers: RouteHandler[], args: any[], mimeTypes: IMimeTypesProvider, context: DependencyContainer): Promise<HTTPResponse | undefined> {
        
        if (handlers.length == 0)
            return new HTTPResponse(404);

        var body: any = undefined;

        //Payload needs to be handled
        if (request.method == HTTPMethod.PUT || request.method == HTTPMethod.POST)
        {
            var mimeType = request.headers["content-type"] ?? this._DefaultMimeType;
            try {
                var parsedType = contentType.parse(mimeType as string);
            }
            catch {
                try {
                    parsedType = contentType.parse(this._DefaultMimeType);
                }
                catch {
                    parsedType = {
                        type: 'text/plain',
                        parameters: {}
                    }
                }
            }

            //Check if a type converter for this mime type exists
            var typeConverter = mimeTypes.get(parsedType.type);
            if (typeConverter == undefined)
                return new HTTPResponse(415);
            
            //Filter handlers by the mime type they accept
            handlers = handlers.filter(x => {
                return getAcceptContentTypes(x.controller, x.handler)?.has(parsedType.type) ?? false;
            });

            if (handlers.length == 0)
                return new HTTPResponse(415);

            //Actually convert body based on the mime type
            body = await typeConverter.convertFrom(request.body, parsedType.parameters);

            if (body == undefined)
                return new HTTPResponse(415);
        }
        
        var results: HTTPResponse[] = [],
            result: HTTPResponse | undefined;
        for (var handler of handlers)
        {
            result = await this.executeHandler(request, handler, args, body, mimeTypes, context);
            if (result != undefined)
                results.push(result);
        }
        return results[0];
    }

    async executeHandler(request: HTTPRequest, handler: RouteHandler, args: ReadonlyArray<any>, body:any, mimeTypes: IMimeTypesProvider, context: DependencyContainer): Promise<HTTPResponse | undefined> {

        var middlewareBag: MiddlewareBag = {};

        var controllerMiddleware: ReadonlyArray<constructor<IMiddleware>> = getControllerMiddleware(handler.controller);
        var handlerMiddleware: ReadonlyArray<constructor<IMiddleware>> = getHandlerMiddleware(handler.controller, handler.handler);

        var query = request.query;
        var headers = request.headers;

        if (controllerMiddleware?.length > 0 || handlerMiddleware?.length > 0)
        {
            var middlewareContext: MiddlewareContext = {
                handler: handler,
                body: body,
                query: query,
                headers: headers,
                args: args
            };

            var middlewareInstance: IMiddleware;
            var middlewareResult : HTTPResponse | MiddlewareContext | undefined;
            if (controllerMiddleware?.length > 0)
            {
                for (var middleware of controllerMiddleware)
                {
                    middlewareInstance = context.resolve(middleware);
                    middlewareResult = await middlewareInstance.run(middlewareContext, middlewareBag);
                    if (middlewareResult instanceof HTTPResponse)
                        return middlewareResult;
                    else if (middlewareResult != undefined)
                        middlewareContext = middlewareResult;
                }
            }

            if (handlerMiddleware?.length > 0)
            {
                for (var middleware of handlerMiddleware)
                {
                    middlewareInstance = context.resolve(middleware);
                    middlewareResult = await middlewareInstance.run(middlewareContext, middlewareBag);
                    if (middlewareResult instanceof HTTPResponse)
                        return middlewareResult;
                    else if (middlewareResult != undefined)
                        middlewareContext = middlewareResult;
                }
            }

            handler = middlewareContext.handler;
            body = middlewareContext.body;
            headers = middlewareContext.headers;
            query = middlewareContext.query;
            args = middlewareContext.args;
        }


        //Instantiate handler and find its method
        var controllerInstance: Object = context.resolve(handler.controller);
        var handlerMethod: Function = controllerInstance[handler.handler];
    
        //Invoke the method
        var result: any = await handlerMethod.call(controllerInstance, middlewareBag, ...args, body);
        //Return value is an already processed response, return as is.
        if (result instanceof HTTPResponse)
            return result;
        
        var mimeType: string = undefined, mimeTypeParams: MimeTypeParams;
        if (result instanceof ExtendedReturn && result.bodyMimeType != undefined)
        {
            try {
                var parsed = contentType.parse(result.bodyMimeType);
                mimeType = parsed.type;
                mimeTypeParams = parsed.parameters;
            }
            catch {}
        }
        
        if (mimeType == undefined)
        {
            var returnTypes : ReadonlyMap<string, MimeTypeParams> = getReturnContentTypes(handler.controller, handler.handler);

            if (returnTypes == undefined || returnTypes.size == 0)
                mimeType = this._DefaultMimeType;
            else
            {
                var accept: string[];
                if (request.headers['accept'] == undefined)
                    accept = [ this._DefaultMimeType ];
                else if (typeof(request.headers['accept']) == 'string')
                    accept = [ request.headers['accept'] ];
                else
                    accept = request.headers['accept'];

                var acceptParsed = accept.map(x => {
                    try {
                        return contentType.parse(x);
                    }
                    catch {
                        return undefined;
                    }
                }).filter(x => {
                    return x != undefined && returnTypes.has(x.type);
                });
    
                if (acceptParsed.length > 0)
                {
                    mimeType = acceptParsed[0].type;
                    mimeTypeParams = acceptParsed[0].parameters;
                }
                else
                {
                    mimeType = returnTypes.keys().next().value;
                    mimeTypeParams = returnTypes[mimeType];
                }
            }
        }

        var mimeTypeConverter: IMimeTypeConverter = mimeTypes.get(mimeType);
        if (mimeTypeConverter == undefined)
            return new HTTPResponse(500);

        if (result instanceof ExtendedReturn)
        {
            var headers = result.headers;
            if (headers == undefined)
                headers = {};
            
            if (headers['Content-Type'] == undefined)
                headers['Content-Type'] = mimeType;

            return new HTTPResponse(result.code, headers, await mimeTypeConverter.convertTo(result.body, mimeTypeParams));   
        }
        else
            return new HTTPResponse(200, { 'Content-Type': mimeType }, await mimeTypeConverter.convertTo(result, mimeTypeParams));
    }
};