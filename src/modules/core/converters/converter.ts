import 'reflect-metadata';
import { constructor } from '../types';
import { Metadata_Prefix } from '../constants';
import { DependencyContainer, injectable } from 'tsyringe';
import requireDirectory from 'require-directory';
import path from 'path';

module Converter {
    const Metadata_ConverterTypeIds = `${Metadata_Prefix}ConverterTypeIds`;

    export interface ITypeConverter {
        convertFromString(str: string): any | undefined;
        convertToString(item: any): string | undefined;
    };

    export function Converter(typeId: string) {
        return (target: constructor<ITypeConverter>) => {
            var typeIds : Set<string> | undefined = Reflect.getMetadata(Metadata_ConverterTypeIds, target);
            if (typeIds == undefined)
            {
                Reflect.defineMetadata(Metadata_ConverterTypeIds, typeIds = new Set<string>(), target);
                injectable()(target);
            }
            typeIds.add(typeId);
        }
    };
    
    export function getConverterTypes(converter: ITypeConverter | constructor<ITypeConverter>): Iterable<string> | undefined {
        return Reflect.getMetadata(Metadata_ConverterTypeIds, converter) as Set<string> | undefined;
    }

    export function isConverter(converter: constructor<ITypeConverter> | ITypeConverter): boolean {
        return Reflect.getMetadata(Metadata_ConverterTypeIds, converter);
    }

    export type ConvertersDiscoveryOptions = {
        extensions?: string[] | undefined;
        include?: RegExp | requireDirectory.CheckPathFn | undefined;
        exclude?: RegExp | requireDirectory.CheckPathFn | undefined;
    }

    export function discoverConverters(pathToFolder: string, relativeTo: string = process.cwd(), options: ConvertersDiscoveryOptions = { extensions: ['js', 'ts'] }) {
        function* recursiveDiscovery(modulesList : any) : Generator<constructor<Object>> {
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

        register(converter: constructor<ITypeConverter>, typeIds?: Iterable<string> | undefined) {
            typeIds = typeIds ?? getConverterTypes(converter);
            if (typeIds != undefined)
                for (var type of typeIds)
                    this._TypeMapping.set(type, converter);
            this._DIContext.registerSingleton(converter);
        }

        get(typeId: string): ITypeConverter | undefined {
            var converterType = this._TypeMapping.get(typeId);
            return converterType == undefined ? undefined : this._DIContext.resolve(converterType);
        }
    }
}

export = Converter;