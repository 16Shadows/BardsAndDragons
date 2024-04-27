import 'reflect-metadata';
import { Metadata_Prefix } from "../constants";
import { constructor } from '../types';
import { MimeTypeParams } from './mimeTypeConverter';
import { Endpoint } from '../routing/decorators';

module MimeTypeDecorators {
    const Metadata_AcceptMimeType : string = `${Metadata_Prefix}AcceptMimeType`;
    const Metadata_ReturnMimeType : string = `${Metadata_Prefix}ReturnMimeType`;

    export function getAcceptContentTypes(target: constructor<Object>, handlerName: string): ReadonlySet<string> | undefined {
        var accept: Map<string, Set<string>> = Reflect.getMetadata(Metadata_AcceptMimeType, target.prototype);
        if (accept == undefined)
            return undefined;
        return accept.get(handlerName);
    }

    export function Accept(first: string, ...args: string[]) {
        return (target : Object, name: string, prop: TypedPropertyDescriptor<Endpoint>) => {
            var accept: Map<string, Set<string>> = Reflect.getMetadata(Metadata_AcceptMimeType, target);
            if (accept == undefined)
                Reflect.defineMetadata(Metadata_AcceptMimeType, accept = new Map<string, Set<string>>(), target);
            
            var functionAccept: Set<string> = accept.get(name);
            if (functionAccept == undefined)
                accept.set(name, functionAccept = new Set<string>());

            functionAccept.add(first.toLowerCase());
            for (var item of args)
                functionAccept.add(item.toLowerCase());
        };
    }

    export function getReturnContentTypes(target: constructor<Object>, handlerName: string): ReadonlyMap<string, MimeTypeParams> | undefined {
        var accept: Map<string, Map<string, MimeTypeParams>> = Reflect.getMetadata(Metadata_ReturnMimeType, target.prototype);
        if (accept == undefined)
            return undefined;
        return accept.get(handlerName);
    }

    export function Return(type: string, params?: MimeTypeParams) {
        type = type.toLowerCase();
        return (target : Object, name: string, prop: TypedPropertyDescriptor<Endpoint>) => {
            var accept: Map<string, Map<string, MimeTypeParams>> = Reflect.getMetadata(Metadata_ReturnMimeType, target);
            if (accept == undefined)
                Reflect.defineMetadata(Metadata_ReturnMimeType, accept = new Map<string, Map<string, MimeTypeParams>>(), target);
            
            var functionReturn: Map<string, MimeTypeParams> = accept.get(name);
            if (functionReturn == undefined)
                accept.set(name, functionReturn = new Map<string, MimeTypeParams>());

            if (functionReturn.has(type))
                throw new Error(`A function cannot have multiple @Return decorators with the same type ${type}`);

            functionReturn.set(type, {});
        };
    }
};

export = MimeTypeDecorators;