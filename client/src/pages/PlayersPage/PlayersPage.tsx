import React from "react";
import {Col, Row} from "react-bootstrap";
import PlayerCard from "./PlayerCard";
import usePlayersPage from "./usePlayersPage";

const PlayersPage = () => {
    const {
        matches,
        currentMatchId,
        handleAccept,
        handleReject,
        isLoading,
        isUserValidForMatching
    } = usePlayersPage();

    // Matches are loading from API
    if (isLoading) {
        return (
            <div>
                <h1>Загрузка...</h1>
            </div>
        );
    }

    // User is not valid for matching
    if (!isUserValidForMatching) {
        // TODO: add explanation about required fields in profile and button on profile
        return (
            <div>
                <h1>Обязательные поля не заполнены для поиска других игроков!</h1>
            </div>
        );
    }

    // No matches
    if (!matches.length || !matches[currentMatchId]) {
        // TODO: add explanation what to do when there are no matches
        return (
            <div>
                <h1>Нет мэтчей!</h1>
            </div>
        );
    }

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
