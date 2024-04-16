import { constructor } from "tsyringe/dist/typings/types";
import { Converter, ITypeConverter } from "./converter";

module DefaultConverters {
    @Converter('int')
    export class IntConverter implements ITypeConverter {
        convertFromString(str: string): number | undefined {
            var value = +str;
            return Number.isInteger(value) ? value : undefined;
        }

        convertToString(item: any): string | undefined {
            return Number.isInteger(item) ? item.toString() : undefined;
        }
    }

    @Converter('float')
    export class FloatConverter implements ITypeConverter {
        convertFromString(str: string): number | undefined {
            var value = +str;
            return Number.isNaN(value) ? undefined : value;
        }
        
        convertToString(item: any): string | undefined {
            return item.toString();
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