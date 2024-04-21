import { DependencyContainer } from 'tsyringe';
import { ITypeConverter, getConverterType } from './converter';
import { constructor } from '../types';

module ConvertersStorage {
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
            this._DIContext.register(converter, {useClass:converter});
        }

        get(typeId: string): ITypeConverter | undefined {
            var converterType = this._TypeMapping.get(typeId);
            return converterType == undefined ? undefined : this._DIContext.resolve(converterType);
        }
    }
}

export = ConvertersStorage;