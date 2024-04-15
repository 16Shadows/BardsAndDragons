import { IRouteRegistry } from "./core";
import { RoutingTree } from "./routingTree";

module RoutingDefaults {
    export function createDefaultRouteRegistry(): IRouteRegistry {
        return new RoutingTree();
    }
}

export = RoutingDefaults;