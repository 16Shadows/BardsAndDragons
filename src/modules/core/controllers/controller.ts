import 'reflect-metadata';
import { injectable } from "tsyringe"
import { constructor } from '../types';
import { Metadata_Prefix } from "../constants";
import requireDirectory from 'require-directory';
import path from 'path';
import { RouteDefinitionPart } from '../routing/core';
import { sanitizeRoute } from '../routing/utils';

module Controller {
    const Metadata_ControllerRoutes : string = `${Metadata_Prefix}ControllerRoutes`;

    export function Controller(route: string = '', caseSensitive: boolean = true) {        
        return (target: constructor<Object>) => {    
            var routes: Set<RouteDefinitionPart> | undefined = Reflect.getMetadata(Metadata_ControllerRoutes, target.prototype);
            if (routes == undefined)
            {
                Reflect.defineMetadata(Metadata_ControllerRoutes, routes = new Set<RouteDefinitionPart>(), target.prototype)
                injectable()(target);
            }

            routes.add({ pattern: sanitizeRoute(route), isCaseSensitive: caseSensitive });
        }
    };
    
    export function isController(target: constructor<Object>): boolean {
        return Reflect.hasMetadata(Metadata_ControllerRoutes, target.prototype);
    }
    
    export function getContollerRoutes(controller: constructor<Object>): Iterable<RouteDefinitionPart> | undefined {
        return Reflect.getMetadata(Metadata_ControllerRoutes, controller.prototype) ?? [{pattern: '', isCaseSensitive: false}];
    }
    
    export type ControllerDiscoveryOptions = {
        extensions?: string[] | undefined;
        include?: RegExp | requireDirectory.CheckPathFn | undefined;
        exclude?: RegExp | requireDirectory.CheckPathFn | undefined;
    }
    
    export function discoverControllers(pathToFolder: string, relativeTo: string = process.cwd(), options: ControllerDiscoveryOptions = { extensions: ['js', 'ts'] }) {
        function* recursiveDiscovery(modulesList : any) : Generator<constructor<Object>> {
            for (var entry in modulesList) {
                if (typeof modulesList[entry] == 'object')
                    yield* recursiveDiscovery(modulesList[entry]);
                else if (typeof modulesList[entry] == 'function' && isController(modulesList[entry]))
                    yield modulesList[entry];
            }
        }
    
        return recursiveDiscovery(requireDirectory(module, './' + path.relative(__dirname, path.resolve(relativeTo, pathToFolder)), options));
    }
}

export = Controller;