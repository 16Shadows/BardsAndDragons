module Types {
    export type constructor<T> = {
        new (...args: any[]): T;
    };

    export function isOfClass<T extends Object>(item: T, type: constructor<T>): boolean {
        return type.prototype.isPrototypeOf(item);
    }
}

export = Types;