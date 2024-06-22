module ArrayUtils {
    export type ArrayView<T> = { [key: number]: T, readonly length: number, [Symbol.iterator](): Iterator<T>};

    class ArrayViewIterator<T> implements Iterator<T> {
        private _Index: number;
        private _Target: ArrayView<T> | T[];
        private _To: number;
        
        constructor(target: ArrayView<T> | T[], from: number, to: number) {
            this._Index = from;
            this._To = to;
            this._Target = target;
        }

        next(): IteratorResult<T> {
            var r = {
                done: this._Index >= this._To,
                value: this._Target[this._Index]
            }
            this._Index++;
            return r;
        }
    }

    export function getArrayView<T>(array: T[] | ArrayView<T>, from?: number, length?: number): ArrayView<T> {
        from = from ?? 0;
        length = length ?? array.length - from;
        var proxyTarget: ArrayView<T> = {
            length: Math.max(0, length),
            [Symbol.iterator]() {
                return new ArrayViewIterator(array, from, from+length);
            }
        };

        return new Proxy(proxyTarget, {
            get(target, prop, receiver) {
                var index = +prop.toString();
                if (isNaN(index))
                    return Reflect.get(target, prop, receiver);
                else if (index < 0 || index >= proxyTarget.length)
                    return undefined;
                else
                    return array[from + index];
            },
            set(target, prop, newValue, receiver) {
                var index = +prop.toString();
                if (isNaN(index))
                    return Reflect.set(target, prop, newValue, receiver);
                else if (index < 0 || index >= proxyTarget.length)
                    return false;
                else
                {
                    array[from + index] = newValue;
                    return true;
                }
            }
        });
    }
}

export = ArrayUtils;