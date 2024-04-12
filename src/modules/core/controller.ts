import { injectable } from "tsyringe"
import { constructor } from "tsyringe/dist/typings/types";

interface IControllersList extends Iterable<constructor<ControllerBase>> {
    isController(type: constructor<ControllerBase>) : boolean;
}

class ControllersDatabase implements IControllersList {
    protected _ControllerTypes : Set<constructor<ControllerBase>>;

    constructor() {
        this._ControllerTypes = new Set<constructor<ControllerBase>>;
    }

    isController(type: constructor<ControllerBase>): boolean {
        return this._ControllerTypes.has(type);
    }
    
    [Symbol.iterator](): Iterator<constructor<ControllerBase>, any, undefined> {
        return this._ControllerTypes[Symbol.iterator]();
    }

    register(controllerType : constructor<ControllerBase>) {
        this._ControllerTypes.add(controllerType);
    }
}

const ControllersDB : ControllersDatabase = new ControllersDatabase();

export function Controller<T extends ControllerBase> (route: string = '') {
    return (target: constructor<T>) => {
        ControllersDB.register(target)
        injectable()(target);
    }
};

export class ControllerBase {}

export const DiscoveredControllers : IControllersList = ControllersDB;