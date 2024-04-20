module Types {
    export type constructor<T> = {
        new (...args: any[]): T;
    };

    export type Endpoint = {
        (...args: any[]): Promise<any>
    };
}

export = Types;