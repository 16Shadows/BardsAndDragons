import { constructor } from "tsyringe/dist/typings/types";
import { Converter, ITypeConverter } from "./converter";

module DefaultConverters {
    @Converter('int')
    export class IntConverter implements ITypeConverter {
        convertFrom(decodedMimeType: any) {
            throw new Error("Method not implemented.");
        }
        
        convertTo(value: any) {
            throw new Error("Method not implemented.");
        }

        convertFromString(str: string): number | undefined {
            var value = +str;
            return Number.isInteger(value) ? value : undefined;
        }
    }

    @Converter('float')
    export class FloatConverter implements ITypeConverter {
        convertFrom(decodedMimeType: any) {
            throw new Error("Method not implemented.");
        }

        convertTo(value: any) {
            throw new Error("Method not implemented.");
        }

        convertFromString(str: string): number | undefined {
            var value = +str;
            return Number.isNaN(value) ? undefined : value;
        }
    }

    export function getDefaultConverters(): Iterable<constructor<ITypeConverter>> {
        return [
            IntConverter,
            FloatConverter
        ];
    }
}

export = DefaultConverters;