module Constants {
    export const Metadata_Prefix : string = "MVC-netlike:";

    export const HTTPMethod = {
        GET: 0,
        POST: 1,
        DELETE: 2,
        HEAD: 3,
        PATCH: 4,
        PUT: 5
    } as const;
    export type HTTPMethod = typeof HTTPMethod[keyof typeof HTTPMethod];

    export function getHttpMethodFromString(method: string): HTTPMethod | undefined {
        method = method.toUpperCase();
        return method in HTTPMethod ? HTTPMethod[method] : undefined;
    }
}

export = Constants;