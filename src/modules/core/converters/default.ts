import { constructor } from "tsyringe/dist/typings/types";
import { Converter, ITypeConverter } from "./converter";

module DefaultConverters {
    @Converter('int')
    export class IntConverter implements ITypeConverter {
        async convertFromString(str: string): Promise<number | undefined> {
            var value = +str;
            return Number.isInteger(value) ? value : undefined;
        }
    }

    @Converter('float')
    export class FloatConverter implements ITypeConverter {
        async convertFromString(str: string): Promise<number | undefined> {
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