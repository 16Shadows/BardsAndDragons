import 'reflect-metadata';
import { constructor } from '../types';
import { Metadata_Prefix } from '../constants';
import { injectable } from 'tsyringe';

module Converters {
    const Metadata_ConverterTypeId = `${Metadata_Prefix}ConverterTypeId`;

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

    export interface ITypeConverter {
        //Used for route parsing
        convertFromString(str: string): any | undefined;
    };
}

export = Converters;