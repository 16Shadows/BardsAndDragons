import {useCallback, useEffect, useState} from "react";
import {PlayerData, UserMatchingValidationResult} from "./PlayerData";
import useApi from "../../http-common";
import {errorLoadingData} from "../../utils/errorMessages";

// Function to show error message
const showError = (error: any, message: string) => {
    if (error.response?.status !== 401) {
        alert(message);
    }
};

const usePlayersMatching = () => {
    const [matches, setMatches] = useState<PlayerData[]>([]);
    const [currentMatchId, setCurrentMatchId] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [userValidation, setUserValidation] = useState<UserMatchingValidationResult>({
        isValid: true,
        missingFields: {
            birthday: false,
            displayName: false,
            avatar: false,
            profileDescription: false,
            contactInfo: false,
            city: false,
            games: false,
        }
    });

    const api = useApi();

    // Get whether user is valid for matching from API on page load. If valid, get matches
    useEffect(() => {
        const fetchUserValidity = async () => {
            try {
                setIsLoading(true);
                const response = await api.get<UserMatchingValidationResult>('matching/is-valid-for-matching');
                const userValidation = response.data;
                setUserValidation(userValidation);

                if (userValidation.isValid) {
                    // Continue state is loading
                    // Get matches
                    await getMatches();
                } else {
                    // Stop state is loading
                    setIsLoading(false);
                }
            } catch (error) {
                showError(error, errorLoadingData);
            }
        }
        fetchUserValidity();
    }, [api]);

    // Function to get matches from API
    const getMatches = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await api.get('matching/get-players');
            setMatches(response.data);
            setCurrentMatchId(0);
        } catch (error) {
            showError(error, errorLoadingData);
        } finally {
            setIsLoading(false);
        }
    }, [api]);

    // Function to handle next match
    const handleNextMatch = useCallback(async () => {
        if (currentMatchId < matches.length - 1) {
            // Move to the next match
            setCurrentMatchId(prevId => prevId + 1);
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
        } catch (error) {
            showError(error, errorLoadingData);
        }
    }, [api, handleNextMatch]);

    // Function to handle player reject
    const handleReject = useCallback(async (username: string) => {
        try {
            // Send friend request
            await api.post(`matching/${username}/rejectMatch`);
            await handleNextMatch();
        } catch (error) {
            showError(error, errorLoadingData);
        }
    }, [api, handleNextMatch]);

    return {
        matches,
        currentMatchId,
        handleAccept,
        handleReject,
        isLoading,
        userValidation
    };
};

export default usePlayersMatching;
