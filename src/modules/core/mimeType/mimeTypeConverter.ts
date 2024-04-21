import requireDirectory from "require-directory";
import { Metadata_Prefix } from "../constants";
import { constructor } from "../types";
import { DependencyContainer, injectable } from "tsyringe";
import path from 'path';

module MimeTypeConverter {
    const Metadata_MimeConverterTypeIds = `${Metadata_Prefix}MimeConverterTypeIds`;

    export type MimeTypeParams = {
        [key: string]: string;
    }

    export interface IMimeTypeConverter {
        convertFrom(input: NodeJS.ReadableStream, params?: MimeTypeParams): Promise<any | undefined>;
        convertTo(value: any, params?: MimeTypeParams): Promise<NodeJS.ReadableStream | undefined>;
    }

    export function MimeTypeConverter(typeId: string) {
        return (target: constructor<IMimeTypeConverter>) => {
            var typeIds : Set<string> | undefined = Reflect.getMetadata(Metadata_MimeConverterTypeIds, target);
            
            if (typeIds == undefined)
            {
                injectable()(target);
                Reflect.defineMetadata(Metadata_MimeConverterTypeIds, typeIds = new Set<string>(), target)
            }
            
            typeIds.add(typeId.toLowerCase());
        }
    };

    export function getMimeTypeConverterTypes(converter: constructor<IMimeTypeConverter>): Iterable<string> | undefined {
        return Reflect.getMetadata(Metadata_MimeConverterTypeIds, converter) as Iterable<string> | undefined;
    }

    export function isMimeTypeConverter(converter: constructor<IMimeTypeConverter>): boolean {
        return Reflect.hasMetadata(Metadata_MimeConverterTypeIds, converter);
    }

    export type MimeTypeConvertersDiscoveryOptions = {
        extensions?: string[] | undefined;
        include?: RegExp | requireDirectory.CheckPathFn | undefined;
        exclude?: RegExp | requireDirectory.CheckPathFn | undefined;
    }

    export function discoverMimeTypeConverters(pathToFolder: string, relativeTo: string = process.cwd(), options: MimeTypeConvertersDiscoveryOptions = { extensions: ['js', 'ts'] }) {
        function* recursiveDiscovery(modulesList : any) : Generator<constructor<IMimeTypeConverter>> {
            for (var entry in modulesList) {
                if (typeof modulesList[entry] == 'object')
                    yield* recursiveDiscovery(modulesList[entry]);
                else if (typeof modulesList[entry] == 'function' && isMimeTypeConverter(modulesList[entry]))
                    yield modulesList[entry];
            }
        }
    
        return recursiveDiscovery(requireDirectory(module, './' + path.relative(__dirname, path.resolve(relativeTo, pathToFolder)), options));
    }

    export interface IMimeTypesProvider {
        get(typeId: string): IMimeTypeConverter | undefined;
    }

    export class MimeTypesProvider implements IMimeTypesProvider {
        protected _DIContext: DependencyContainer;
        protected _TypeMapping: Map<string, constructor<IMimeTypeConverter>>;

        constructor(diContext: DependencyContainer) {
            this._DIContext = diContext;
            this._TypeMapping = new Map<string, constructor<IMimeTypeConverter>>();
        }

        register(converter: constructor<IMimeTypeConverter>) {
            var typeIds = getMimeTypeConverterTypes(converter);
            for (var typeId of typeIds)
                this._TypeMapping.set(typeId, converter);
            this._DIContext.register(converter, {useClass: converter});
        }

        get(typeId: string): IMimeTypeConverter | undefined {
            var converterType = this._TypeMapping.get(typeId);
            return converterType == undefined ? undefined : this._DIContext.resolve(converterType);
        }
    }
}

export = MimeTypeConverter;