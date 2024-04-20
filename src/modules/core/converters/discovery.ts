import requireDirectory from 'require-directory';
import path from 'path';
import { constructor } from '../types';
import { ITypeConverter, isConverter } from './converter';

module ConvertersDiscovery {
    export type ConvertersDiscoveryOptions = {
        extensions?: string[] | undefined;
        include?: RegExp | requireDirectory.CheckPathFn | undefined;
        exclude?: RegExp | requireDirectory.CheckPathFn | undefined;
    }

    export function discoverConverters(pathToFolder: string, relativeTo: string = process.cwd(), options: ConvertersDiscoveryOptions = { extensions: ['js', 'ts'] }) {
        function* recursiveDiscovery(modulesList : any) : Generator<constructor<ITypeConverter>> {
            for (var entry in modulesList) {
                if (typeof modulesList[entry] == 'object')
                    yield* recursiveDiscovery(modulesList[entry]);
                else if (typeof modulesList[entry] == 'function' && isConverter(modulesList[entry]))
                    yield modulesList[entry];
            }
        }
    
        return recursiveDiscovery(requireDirectory(module, './' + path.relative(__dirname, path.resolve(relativeTo, pathToFolder)), options));
    }
}

export = ConvertersDiscovery;