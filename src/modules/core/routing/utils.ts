import { trimStart } from "../utils/stringUtils";

module RoutingUtils {
    export function sanitizeRoute(route: string): string {
        return trimStart(route, '/');
    }
}

export = RoutingUtils;
