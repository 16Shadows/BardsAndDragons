import { useCallback, useEffect, useRef, useState } from "react";

export type ListStateConversionResult<ItemType> = {
    isFinal: boolean;
    list: ReadonlyArray<ItemType>;
}

export type ListStateConverter<ItemType> = {
    (current: ReadonlyArray<ItemType>): Promise<ListStateConversionResult<ItemType>>;
}

export type ListStateUpdateDispatcher<ItemType> = {
    (update: (current: ReadonlyArray<ItemType>) => ReadonlyArray<ItemType>, isSourceIndependent?: boolean): void;
}

/**
 * Creates a dynamic list the state of which can be updated as needed
 * @param nextState A function converting the current list into its next state. It should return the result of converting to the next state which contains list - new list state - and isFinal - indicating whether this is the final state of the list with no further changes @see ListStateConversionResult
 * @returns An array where:
 * The first element is the list's current in-memory state
 * The second element is a function which is used to request loading of the next batch
 * The third element is a boolean indicating whether the list isFinal (meaning that no more batches can be requested). It does not mean that the list can no longer change.
 * The fourth element is an updater function which can be used to manually update the list when it is safe to do so. Updates the list even if it is currently final. It accepts two arguments: an updater function which synchronyously updates the array and a boolean indicating whether the update should be performed regardless of nextState changing.
 */
function useDynamicList<ItemType>(nextState: ListStateConverter<ItemType>): [ReadonlyArray<ItemType> | null, () => void, boolean, ListStateUpdateDispatcher<ItemType>] {
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
    }, [nextState, requestChain, listFinalized, version]);

    const requestNextBatch = useCallback(() => {
        if (listFinalized.current === true)
            return;

        let localVersion = version.current;
        
        requestChain.current = requestChain.current.then(x => {
            return listFinalized.current || localVersion !== version.current ? {list: x, isFinal: true} : nextState(x);
        }).then(x => {
            if (!listFinalized.current && localVersion === version.current)
                setItems(x.list);

            if (listFinalized.current !== x.isFinal)
                listFinalized.current = x.isFinal;

            return x.list;
        });
    }, [nextState, requestChain, listFinalized, version]);

    const dispatchListUpdate = useCallback<ListStateUpdateDispatcher<ItemType>>((updater: (current: ReadonlyArray<ItemType>) => ReadonlyArray<ItemType>, isSourceIndependent?: boolean) => {
        let localVersion = version.current;

        requestChain.current = requestChain.current.then(x => {
            if (localVersion !== version.current && !isSourceIndependent)
                return x;

            x = updater(x);
            setItems(x);
            return x;
        });
    }, [requestChain, version]);

    return [items, requestNextBatch, listFinalized.current, dispatchListUpdate];
}

export default useDynamicList;