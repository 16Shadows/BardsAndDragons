import { HTTPMethod } from "../constants";
import { HTTPResponse, IncomingHttpHeaders, RouteDefinitionPart, RouteHandler } from "../routing/core";
import { ParsedUrlQuery } from 'querystring';
import { Metadata_Prefix } from "../constants";
import { constructor } from "../types";

module Middleware {
    export type MiddlewareContext = {
        readonly handler: Readonly<RouteHandler>;
        readonly body: Readonly<any>;
        readonly query: Readonly<ParsedUrlQuery>;
        readonly headers: Readonly<IncomingHttpHeaders>;
        readonly args: ReadonlyArray<any>;
    };

    export type MiddlewareBag = {};

    export interface IMiddleware {
        run(ctx: MiddlewareContext, bag: MiddlewareBag): Promise<HTTPResponse | MiddlewareContext | undefined>;
    }

    const Metadata_ControllerMiddleware = `${Metadata_Prefix}ControllerMiddleware`;
    const Metadata_HandlerMiddleware = `${Metadata_Prefix}HandlerMiddleware`;

    export function getControllerMiddleware(target: constructor<Object>): ReadonlyArray<constructor<IMiddleware>> | undefined {
        return Reflect.getMetadata(Metadata_ControllerMiddleware, target.prototype);
    }

    export function getHandlerMiddleware(target: constructor<Object>, handlerName: string): ReadonlyArray<constructor<IMiddleware>> | undefined {
        return (Reflect.getMetadata(Metadata_HandlerMiddleware, target.prototype) as Map<string, constructor<IMiddleware>[]>)?.get(handlerName);
    }

    export function Middleware(middlewareType: constructor<IMiddleware>) {
        return (target: constructor<Object> | Object, handlerName?: string) => {
            var middlewareList: constructor<IMiddleware>[];
            if (typeof target == 'function')
            {
                middlewareList = Reflect.getMetadata(Metadata_ControllerMiddleware, target.prototype);
                if (middlewareList == undefined)
                    Reflect.defineMetadata(Metadata_ControllerMiddleware, middlewareList = [], target.prototype);
            }
            else
            {
                var handlersMiddleware: Map<string, constructor<IMiddleware>[]> = Reflect.getMetadata(Metadata_HandlerMiddleware, target);
                if (handlersMiddleware == undefined)
                    Reflect.defineMetadata(Metadata_HandlerMiddleware, handlersMiddleware = new Map<string, constructor<IMiddleware>[]>(), target);

                middlewareList = handlersMiddleware.get(handlerName);
                if (middlewareList == undefined)
                    handlersMiddleware.set(handlerName, middlewareList = []);
            }

            //Since decorators are executed bottom to top, insert this middleware into the first position. This way middleware will be returned in the top to bottom order.
            middlewareList.splice(0, 0, middlewareType);
        };
    }
}

export = Middleware;