module RoutingUtils {
    export function sanitizeRoute(route: string): string {
        return route.startsWith('/') ? route.substring(1) : route;
    }
}

export = RoutingUtils;
