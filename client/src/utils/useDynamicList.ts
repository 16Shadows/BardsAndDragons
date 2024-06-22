import { useCallback, useEffect, useRef, useState } from "react";

export type ListStateConversionResult<ItemType> = {
    isFinal: boolean; //If true, the resulting list is 
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
    const [items, setItems] = useState<ReadonlyArray<ItemType> | null>(null); //Stores current state of the list and facilitates re-renders when the list changes.
    const requestChain = useRef<Promise<ReadonlyArray<ItemType>>>(Promise.resolve([])); //A chain of promises for current and future calls of nextState requested by requestNextBatch
    const version = useRef(0); //Version number. Used to track changes of nextState
    const listFinalized = useRef(false); //Indicates whether the list is 'finalized', meaning that further calls to nextState won't change it.

    //The effect is invoked when nextState is changed.
    //It causes the list to reset
    useEffect(() => {
        let localVersion = ++version.current; //Increment version number and capture its newValue locally. If the effect triggers while waiting for nextState, local version number won't match the one stored in the ref.
        listFinalized.current = false; //A new list is never finalized.
        setItems(null); //Reset items to null to indicate that no items have been loaded yet.
        requestChain.current = nextState([]).then(x => { //Start request chain. Call next state with empty array (initial state; empty array instead of null to streamline nextState's logic) followed by internal logic
            if (localVersion === version.current) //Only process the results if local version matches version in the ref (nextState hasn't changed)
            {
                listFinalized.current = x.isFinal;
                setItems(x.list);
            }
            return x.list;
        });
    }, [nextState]);

    //A function returned by the hook. Requests further batches by calling nextState.
    const requestNextBatch = useCallback(() => {
        if (listFinalized.current === true) //If list has been finalized, skip this call
            return;

        let localVersion = version.current; //Capture version at the moment of call
        
        requestChain.current = requestChain.current.then(x => { //Attach a new handler to the end of the request chain. It will run once all previous complete
            return listFinalized.current || localVersion !== version.current ? {list: x, isFinal: true} : nextState(x); //If the list has been finalized or the the version number has changed (thus nextState has changed and the list has been reset), skip call of the nextState - either if won't cause changes or we don't need the data it will provide.
        }).then(x => {
            if (!listFinalized.current && localVersion === version.current) //If the list hasn't been finalized yet and the version is still the same, we can update the values. Otherwise we can or have to skip the updates
            {
                listFinalized.current = x.isFinal;
                setItems(x.list);
            }

            return x.list; //Pass the lists current state to the next promise in the chain.
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