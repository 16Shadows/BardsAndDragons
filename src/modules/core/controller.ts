import { injectable } from "tsyringe"
import { constructor } from "tsyringe/dist/typings/types";
import { Route } from "./routing";
import { Metadata_Prefix } from "./constants";

const Metadata_IsController : string = `${Metadata_Prefix}IsController`;

export function Controller<T extends ControllerBase> (route: string = '') {
    return (target: constructor<T>) => {
        Reflect.defineMetadata(Metadata_IsController, true, target);
        injectable()(target);
    }
};

export function isController(target: any) {
    return Reflect.hasMetadata(Metadata_IsController, target);
}

export class ControllerBase {}