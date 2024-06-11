import { useCallback, useEffect, useRef, useState } from "react";

export type ListStateConversionResult<ItemType> = {
    isFinal: boolean; //If true, the resulting list is 
    list: ReadonlyArray<ItemType>;
}

export type ListStateConverter<ItemType> = {
    (current: ReadonlyArray<ItemType>): Promise<ListStateConversionResult<ItemType>>;
}

/**
 * Creates a dynamic list the state of which can be updated as needed
 * @param nextState A function converting the current list into its next state. SHOULD BE A PURE FUNCTION. It returns the result of converting to the next state which contains list - new list state - and isFinal - indicating whether this is the final state of the list with no further changes
 * @returns Current state of the list (or null if no items have been loaded yet) and a function calling which requests the next state.
 */
function useDynamicList<ItemType>(nextState: ListStateConverter<ItemType>): [ReadonlyArray<ItemType> | null, () => void] {
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
    var requestNextBatch = useCallback(() => {
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
    }, [nextState]);

    return [items, requestNextBatch];
}

export default useDynamicList;