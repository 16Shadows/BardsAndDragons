import React, {useCallback, useEffect, useState} from "react";
import {Col, Row} from "react-bootstrap";
import PlayerCard from "./PlayerCard";
import {PlayerData} from "./PlayerData";
import {errorLoadingData} from "../../utils/errorMessages";
import useApi from "../../http-common";

const PlayersPage = () => {
    const [matches, setMatches] = useState<PlayerData[]>([]);
    const [currentMatchId, setCurrentMatchId] = useState(0);

    const api = useApi();

    // Function to show error message
    const showError = (message: string) => {
        alert(message);
    };

    // Function to get matches from API
    const getMatches = useCallback(async () => {
        try {
            const response = await api.get('matching/get-players');
            setMatches(response.data);
            setCurrentMatchId(0);
        } catch {
            showError(errorLoadingData);
        }
    }, [api, showError]);

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
        getMatches().catch(() => showError(errorLoadingData));
    }, []);

    // TODO: add page with explanation what to do when there are no matches
    // TODO: add is loading state
    if (!matches.length || !matches[currentMatchId]) {
        return (
            <div>
                <h1>Нет мэтчей!</h1>
            </div>
        );
    }

    // TODO: prohibit matching if user hasn't filled all required fields in profile
    // Render player card
    return (
        <Row className="justify-content-md-center">
            <Col md="8">
                <PlayerCard
                    {...matches[currentMatchId]}
                    onAccept={handleAccept}
                    onReject={handleReject}
                />
            </Col>
        </Row>
    );
};

export default PlayersPage;
