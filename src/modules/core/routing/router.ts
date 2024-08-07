import { DependencyContainer } from "tsyringe";
import { IConvertersProvider } from "../converters/storage";
import { getAcceptContentTypes, getReturnContentTypes } from "../mimeType/decorators";
import { IMimeTypeConverter, IMimeTypesProvider, MimeTypeParams } from "../mimeType/mimeTypeConverter";
import { HTTPResponseConvertBody, HTTPRequest, HTTPResponse, IRouteRegistry, IRouter, ResolvedRoute, Route, RouteEndpoint, IncomingHttpHeaders } from "./core";
import contentType from 'content-type';
import { HTTPMethod } from "../constants";
import { constructor } from "../types";
import { IMiddleware, MiddlewareBag, MiddlewareContext, getControllerMiddleware, getHandlerMiddleware } from "../middleware/middleware";
import { QueryArgumentParams, QueryBag, getQueryArguments } from "./query";
import { ParsedUrlQuery } from 'querystring';

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

    async resolve(request: HTTPRequest, context: DependencyContainer, converters: IConvertersProvider, mimeTypes: IMimeTypesProvider): Promise<ResolvedRoute | undefined> {
        var endpoints: Route | undefined = await this._RouteRegistry.match(request.method, request.path, converters);
        var self = this;
        if (endpoints == undefined)
            return undefined;
        return {
            executeHandlers: async function(): Promise<HTTPResponse> {
                var args = endpoints.arguments.map(x => x.value);
                return await self.executeHandlers(request, endpoints.endpoints, args, mimeTypes, context, converters);
            },
            resolvedPattern: endpoints.pattern
        };
    }

    private async executeHandlers(request: HTTPRequest, handlers: RouteEndpoint[], args: any[], mimeTypes: IMimeTypesProvider, context: DependencyContainer, typeConverters: IConvertersProvider): Promise<HTTPResponse | undefined> {
        
        if (handlers.length == 0)
            return new HTTPResponse(404);

        var body: any = undefined;

        //Payload needs to be handled
        if (Router.shouldProcessBody(request.method))
        {
            var mimeType = request.headers['content-type'] ?? this._DefaultMimeType;
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
                return getAcceptContentTypes(x.controller, x.handlerName)?.has(parsedType.type) ?? false;
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
            result = await this.executeHandler(request, handler, args, body, mimeTypes, context, typeConverters);
            if (result != undefined)
                results.push(result);
        }
        return results[0];
    }

    private static async parseQuery(query: ParsedUrlQuery, endpoint: RouteEndpoint, typeConverters: IConvertersProvider) : Promise<QueryBag | undefined> {
        var queryBag: QueryBag = {};

        var queryArgs: ReadonlyMap<string, QueryArgumentParams> = getQueryArguments(endpoint.controller, endpoint.handlerName);

        if (queryArgs?.size > 0) {
            var val: string[] | string | undefined;
            for (var arg of queryArgs.entries()) {
                val = query[arg[0]];
                if (val == undefined)
                {
                    if (arg[1].optional)
                        continue;
                    else
                        return undefined;
                }
                else if (typeof val == 'string')
                {
                    if (arg[1].typeId == '')
                    {
                        queryBag[arg[0]] = val;
                        continue;
                    }

                    var typeConverter = typeConverters.get(arg[1].typeId);
                    if (typeConverter == undefined)
                        throw new Error(`Missing type converter for typeId '${arg[1].typeId}'.`);

                    var converted = await typeConverter.convertFromString(val);

                    if (converted === undefined)
                        return undefined;

                    queryBag[arg[0]] = converted;
                }
                else if (!arg[1].canHaveMultipleValues)
                    return undefined;
                else
                {
                    if (arg[1].typeId == '')
                    {
                        queryBag[arg[0]] = val;
                        continue;
                    }

                    var convertedArr = await Promise.all(val.map(async x => {
                        var typeConverter = typeConverters.get(arg[1].typeId);
                        if (typeConverter == undefined)
                            throw new Error(`Missing type converter for typeId '${arg[1].typeId}'.`);

                        return typeConverter.convertFromString(x);
                    }));

                    if (convertedArr.some(x => x === undefined))
                        return undefined;

                    queryBag[arg[0]] = convertedArr;
                }
            }
        }

        return queryBag;
    }

    private selectMimeType(headers: IncomingHttpHeaders, endpoint: RouteEndpoint): { mimeType: string; mimeTypeParams: MimeTypeParams } {
        var returnTypes : ReadonlyMap<string, MimeTypeParams> = getReturnContentTypes(endpoint.controller, endpoint.handlerName);
        var mimeType: string, mimeTypeParams: MimeTypeParams;
        if (returnTypes == undefined || returnTypes.size == 0)
            mimeType = this._DefaultMimeType;
        else
        {
            var accept: string[];
            if (headers['accept'] == undefined)
                accept = [ this._DefaultMimeType ];
            else if (typeof(headers['accept']) == 'string')
                accept = [ headers['accept'] ];
            else
                accept = headers['accept'];

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
        return {
            mimeType: mimeType,
            mimeTypeParams: mimeTypeParams
        };
    }

    private async executeHandler(request: HTTPRequest, endpoint: RouteEndpoint, args: ReadonlyArray<any>, body:any, mimeTypes: IMimeTypesProvider, context: DependencyContainer, typeConverters: IConvertersProvider): Promise<HTTPResponse | undefined> {
        var queryBag = await Router.parseQuery(request.query, endpoint, typeConverters);
        
        if (queryBag == undefined)
            return undefined;

        var middlewareBag: MiddlewareBag = {};

        var controllerMiddleware: ReadonlyArray<constructor<IMiddleware>> = getControllerMiddleware(endpoint.controller);
        var handlerMiddleware: ReadonlyArray<constructor<IMiddleware>> = getHandlerMiddleware(endpoint.controller, endpoint.handlerName);

        var headers = request.headers;

        if (controllerMiddleware?.length > 0 || handlerMiddleware?.length > 0)
        {
            var middlewareContext: MiddlewareContext = {
                handler: endpoint,
                body: body,
                query: queryBag,
                headers: headers,
                args: args,
                res: request.res
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

            endpoint = middlewareContext.handler;
            body = middlewareContext.body;
            headers = middlewareContext.headers;
            queryBag = middlewareContext.query;
            args = middlewareContext.args;
        }


        //Instantiate handler and find its method
        var controllerInstance: Object = context.resolve(endpoint.controller);
        var handlerMethod: Function = controllerInstance[endpoint.handlerName];
    
        //Invoke the method
        var result: any;
        if (Router.shouldProcessBody(request.method))
            result = await handlerMethod.call(controllerInstance, middlewareBag, ...args, body, queryBag);
        else
            result = await handlerMethod.call(controllerInstance, middlewareBag, ...args, queryBag);
        //Return value is an already processed response, return as is.
        if (result instanceof HTTPResponse)
            return result;
        
        var mimeType: string = undefined, mimeTypeParams: MimeTypeParams;
        if (result instanceof HTTPResponseConvertBody && result.bodyMimeType != undefined)
        {
            try {
                var parsed = contentType.parse(result.bodyMimeType);
                mimeType = parsed.type;
                mimeTypeParams = parsed.parameters;
            }
            catch {}
        }
        
        if (mimeType == undefined)
            ({ mimeType, mimeTypeParams } = this.selectMimeType(headers, endpoint));

        var mimeTypeConverter: IMimeTypeConverter = mimeTypes.get(mimeType);
        if (mimeTypeConverter == undefined)
            return new HTTPResponse(500);

        if (result instanceof HTTPResponseConvertBody)
        {
            var headers = result.headers;
            if (headers == undefined)
                headers = {};
            
            if (headers['content-type'] == undefined)
                headers['content-type'] = mimeType;

            return new HTTPResponse(result.code, headers, await mimeTypeConverter.convertTo(result.body, mimeTypeParams));   
        }
        else
            return new HTTPResponse(200, { 'content-type': mimeType }, await mimeTypeConverter.convertTo(result, mimeTypeParams));
    }

    protected static shouldProcessBody(method: HTTPMethod): boolean {
        return method == HTTPMethod.PUT || method == HTTPMethod.POST;
    }
};