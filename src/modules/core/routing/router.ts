import { HTTPMethod } from "../constants";
import { IConvertersProvider } from "../converters/converter";
import { isOfClass } from "../types";
import { HTTPResponse, IRouteRegistry, IRouter, ResolvedRoute, RouteEndpoint } from "./core";

export class Router implements IRouter {
    protected _RouteRegistry : IRouteRegistry;

    get registry(): IRouteRegistry {
        return this._RouteRegistry;
    }

    constructor(registry: IRouteRegistry) {
        this._RouteRegistry = registry;
    }

    resolve(method: HTTPMethod, path: string, converters: IConvertersProvider): ResolvedRoute | undefined {
        var endpoints: RouteEndpoint | undefined = this._RouteRegistry.match(method, path, converters);
        if (endpoints == undefined)
            return undefined;
        return {
            execute: async function(): Promise<HTTPResponse> {
                //TODO: Add filtering by headers (Accept/Content-type, Accept-Encoding/Content-encoding)
                //TODO: Add proper handling of responses from multiple handlers 
                var result: any, finalResult: any;
                var args = endpoints.arguments.map(x => x.value);
                for (var handler of endpoints.handlers)
                {
                    result = await handler(...args);
                    if (result != undefined)
                        finalResult = result;
                }
                if (isOfClass(result, HTTPResponse))
                    return result;
                else
                    return {
                        body: (finalResult ?? "").toString(),
                        code: 200
                    };
            },
            resolvedPattern: endpoints.pattern
        };
    }
};