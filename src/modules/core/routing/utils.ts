import { trim } from "../utils/stringUtils";

module RoutingUtils {
    export function sanitizeRoute(route: string): string {
        return trim(route.trim(), '/');
    }
}

export = RoutingUtils;
