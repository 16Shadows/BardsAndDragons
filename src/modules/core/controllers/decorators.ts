import 'reflect-metadata';
import { injectable } from "tsyringe"
import { Metadata_Prefix } from "../constants";
import { RouteDefinitionPart } from '../routing/core';
import { constructor } from '../types';

module ControllerDecorators {
    const Metadata_ControllerRoutes : string = `${Metadata_Prefix}ControllerRoutes`;

    export function Controller(route: string = '', caseSensitive: boolean = true) {        
        return (target: constructor<Object>) => {    
            var routes: Set<RouteDefinitionPart> | undefined = Reflect.getMetadata(Metadata_ControllerRoutes, target.prototype);
            if (routes == undefined)
            {
                Reflect.defineMetadata(Metadata_ControllerRoutes, routes = new Set<RouteDefinitionPart>(), target.prototype)
                injectable()(target);
            }

            routes.add({ pattern: route, isCaseSensitive: caseSensitive });
        }
    };
    
    export function isController(target: constructor<Object>): boolean {
        return Reflect.hasMetadata(Metadata_ControllerRoutes, target.prototype);
    }
    
    export function getContollerRoutes(controller: constructor<Object>): Iterable<RouteDefinitionPart> | undefined {
        return Reflect.getMetadata(Metadata_ControllerRoutes, controller.prototype);
    }
}

export = ControllerDecorators;