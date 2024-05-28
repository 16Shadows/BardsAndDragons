import { useCallback, useEffect, useRef, useState } from "react";

export type ListStateConversionResult<ItemType> = {
    isFinal: boolean;
    list: ReadonlyArray<ItemType>;
}

export type ListStateConverter<ItemType> = {
    (current: ReadonlyArray<ItemType>): Promise<ListStateConversionResult<ItemType>>;
}

/**
 * Creates a dynamic list the state of which can be updated as needed
 * @param nextState A function converting the current list into its next state
 * @returns The result of converting to the next state which contains list - new list state - and isFinal - indicating whether this is the final state of the list with no further changes
 */
function useDynamicList<ItemType>(nextState: ListStateConverter<ItemType>): [ReadonlyArray<ItemType> | null, () => void, boolean] {
    const [items, setItems] = useState<ReadonlyArray<ItemType> | null>(null);
    const requestChain = useRef<Promise<ReadonlyArray<ItemType>>>(Promise.resolve([]));
    const version = useRef(0);
    const listFinalized = useRef(false);

    useEffect(() => {
        let localVersion = ++version.current;
        listFinalized.current = false;
        setItems(null);
        requestChain.current = nextState([]).then(x => {
            listFinalized.current = x.isFinal;
            if (localVersion === version.current)
                setItems(x.list);
            return x.list;
        });
    }, [nextState]);

    var requestNextBatch = useCallback(() => {
        if (listFinalized.current === true)
            return;

        let localVersion = version.current;
        
        requestChain.current = requestChain.current.then(x => {
            return listFinalized.current ? {list: x, isFinal: true} : nextState(x);
        }).then(x => {
            if (!listFinalized.current && localVersion === version.current)
                setItems(x.list);

            if (listFinalized.current !== x.isFinal)
                listFinalized.current = x.isFinal;

            return x.list;
        });
    }, [nextState]);

    return [items, requestNextBatch, listFinalized.current];
}

export default useDynamicList;