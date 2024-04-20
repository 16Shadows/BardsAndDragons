module Types {
    export type constructor<T> = {
        new (...args: any[]): T;
    };
}

export = Types;