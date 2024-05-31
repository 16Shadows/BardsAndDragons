import {useCallback, useEffect, useState} from "react";
import {PlayerData} from "./PlayerData";
import useApi from "../../http-common";
import {errorLoadingData} from "../../utils/errorMessages";

const usePlayersPage = () => {
    const [matches, setMatches] = useState<PlayerData[]>([]);
    const [currentMatchId, setCurrentMatchId] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isUserValidForMatching, setIsUserValidForMatching] = useState(false);

    const api = useApi();

    // Function to show error message
    const showError = (message: string) => {
        alert(message);
    };

    // Function to get whether user is valid for matching from API
    const getIsUserValidForMatching = useCallback(async () => {
        const response = await api.get('matching/is-valid-for-matching');
        setIsUserValidForMatching(response.data);
    }, [api]);

    // TODO: check handling error in matching
    // Function to get matches from API
    const getMatches = useCallback(async () => {
        setIsLoading(true);
        const response = await api.get('matching/get-players');
        setMatches(response.data);
        setCurrentMatchId(0);
        setIsLoading(false);
    }, [api]);

    // Function to handle next match
    const handleNextMatch = useCallback(async () => {
        if (currentMatchId < matches.length - 1) {
            // Move to the next match
            setCurrentMatchId(currentMatchId + 1);
        } else {
            // If it's the last match, fetch new matches
            await getMatches();
        }
    }, [currentMatchId, matches.length, getMatches]);

    // Function to handle player accept
    const handleAccept = useCallback(async (username: string) => {
        try {
            // Send friend request
            await api.post(`user/${username}/addFriend`);
            await handleNextMatch();
        } catch {
            showError(errorLoadingData);
        }
    }, [api, handleNextMatch, showError]);

    // Function to handle player reject
    const handleReject = useCallback(async (username: string) => {
        try {
            // Send friend request
            await api.post(`matching/${username}/rejectMatch`);
            await handleNextMatch();
        } catch {
            showError(errorLoadingData);
        }
    }, [api, handleNextMatch, showError]);

    // Get matches on page load
    useEffect(() => {
        getIsUserValidForMatching()
            .then(() => getMatches())
            .catch(() => showError(errorLoadingData));
    }, []);

    return {
        matches,
        currentMatchId,
        handleAccept,
        handleReject,
        isLoading,
        isUserValidForMatching
    };
};

export default usePlayersPage;