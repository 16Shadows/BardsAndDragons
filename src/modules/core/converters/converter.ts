import 'reflect-metadata';
import { constructor } from '../types';
import { Metadata_Prefix } from '../constants';
import { DependencyContainer, injectable } from 'tsyringe';
import requireDirectory from 'require-directory';
import path from 'path';

module Converter {
    const Metadata_ConverterTypeId = `${Metadata_Prefix}ConverterTypeId`;

    export interface ITypeConverter {
        //Used for route parsing
        convertFromString(str: string): any | undefined;

        //Used for body conversion
        convertFrom(decodedMimeType: any): any | undefined;
        convertTo(value: any): any | undefined;
    };

    export function Converter(typeId: string) {
        return (target: constructor<ITypeConverter>) => {
            var typeIds : string | undefined = Reflect.getMetadata(Metadata_ConverterTypeId, target);
            
            if (typeIds != undefined)
                throw new Error('Only one @Converter decorator may be specified.');
            
            injectable()(target);
            Reflect.defineMetadata(Metadata_ConverterTypeId, typeId, target);
        }
    };
    
    export function getConverterType(converter: constructor<ITypeConverter>): string | undefined {
        return Reflect.getMetadata(Metadata_ConverterTypeId, converter) as string | undefined;
    }

    export function isConverter(converter: constructor<ITypeConverter>): boolean {
        return Reflect.hasMetadata(Metadata_ConverterTypeId, converter);
    }

    export type ConvertersDiscoveryOptions = {
        extensions?: string[] | undefined;
        include?: RegExp | requireDirectory.CheckPathFn | undefined;
        exclude?: RegExp | requireDirectory.CheckPathFn | undefined;
    }

    export function discoverConverters(pathToFolder: string, relativeTo: string = process.cwd(), options: ConvertersDiscoveryOptions = { extensions: ['js', 'ts'] }) {
        function* recursiveDiscovery(modulesList : any) : Generator<constructor<ITypeConverter>> {
            for (var entry in modulesList) {
                if (typeof modulesList[entry] == 'object')
                    yield* recursiveDiscovery(modulesList[entry]);
                else if (typeof modulesList[entry] == 'function' && isConverter(modulesList[entry]))
                    yield modulesList[entry];
            }
        }
    
        return recursiveDiscovery(requireDirectory(module, './' + path.relative(__dirname, path.resolve(relativeTo, pathToFolder)), options));
    }

    export interface IConvertersProvider {
        get(typeId: string): ITypeConverter | undefined;
    }

    export class ConvertersProvider implements IConvertersProvider {
        protected _DIContext: DependencyContainer;
        protected _TypeMapping: Map<string, constructor<ITypeConverter>>;

        constructor(diContext: DependencyContainer) {
            this._DIContext = diContext;
            this._TypeMapping = new Map<string, constructor<ITypeConverter>>();
        }

        register(converter: constructor<ITypeConverter>) {
            var typeId = getConverterType(converter);
            this._TypeMapping.set(typeId, converter);
            this._DIContext.registerSingleton(converter);
        }

        get(typeId: string): ITypeConverter | undefined {
            var converterType = this._TypeMapping.get(typeId);
            return converterType == undefined ? undefined : this._DIContext.resolve(converterType);
        }
    }
}

export = Converter;