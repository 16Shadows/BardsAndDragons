import 'reflect-metadata';
import { constructor } from "../types";
import { Endpoint } from "./decorators";
import { Metadata_Prefix } from '../constants';

module Query {
    const Metadata_QueryParams = `${Metadata_Prefix}QueryParams`;

    export type QueryArgumentOptions = {
        typeId?: string;
        optional?: boolean;
        canHaveMultipleValues?: boolean;
    }
    export type QueryArgumentParams = Required<QueryArgumentOptions>;

    export type QueryBag = {
        [key: string]: any[] | any;
    };

    export function QueryArgument(name: string, params?: QueryArgumentOptions) {
        return (target: Object, handlerName: string, prop: TypedPropertyDescriptor<Endpoint>) => {
            var handlerInfo: Map<string, Map<string, QueryArgumentParams>> = Reflect.getMetadata(Metadata_QueryParams, target);
            if (handlerInfo == undefined)
                Reflect.defineMetadata(Metadata_QueryParams, handlerInfo = new Map<string, Map<string, QueryArgumentParams>>(), target);

            var queryArgs: Map<string, QueryArgumentParams> = handlerInfo.get(handlerName);
            if (queryArgs == undefined)
                handlerInfo.set(handlerName, queryArgs = new Map<string, QueryArgumentParams>);

            if (queryArgs.has(name))
                throw new Error(`Duplicate query argument ${name}`);

            queryArgs.set(name, {
                typeId: params?.typeId ?? '',
                optional: params?.optional ?? false,
                canHaveMultipleValues: params?.canHaveMultipleValues ?? true
            });
        }
    }

    export function getQueryArguments(target: constructor<Object>, hanlderName: string): ReadonlyMap<string, QueryArgumentParams> | undefined {
        var handlerInfo: Map<string, Map<string, QueryArgumentParams>> = Reflect.getMetadata(Metadata_QueryParams, target.prototype);
        if (handlerInfo == undefined)
            return undefined;
        return handlerInfo.get(hanlderName);
    }
}

export = Query;