import React, {useEffect, useState} from "react";
import {Col, Row} from "react-bootstrap";
import PlayerCard from "./PlayerCard";
import {PlayerData} from "./PlayerData";
import usePlayersApi from "./usePlayersApi";

const PlayersPage = () => {
    const [matches, setMatches] = useState<PlayerData[]>([]);
    const [currentMatchId, setCurrentMatchId] = useState(0);

    const {getMatches} = usePlayersApi();

    useEffect(() => {
        getMatches().then((data) => {
            setMatches(data);
            setCurrentMatchId(0);
        });
    }, []);

    const handleAccept = (username: string) => {
        console.log(`Player accepted: ${username}`);

        // Обработка принятия мэтча
        if (currentMatchId < matches.length - 1) {
            setCurrentMatchId(currentMatchId + 1);
        } else {
            // Если это последний мэтч, выполнить соответствующую обработку
            alert('All players accepted!');
            setCurrentMatchId(0);
        }

    };

    const handleReject = (username: string) => {
        console.log(`Player rejected ${username}`);

        // Обработка отклонения мэтча
        if (currentMatchId < matches.length - 1) {
            setCurrentMatchId(currentMatchId + 1);
        } else {
            // Если это последний мэтч, выполнить соответствующую обработку
            alert('All players rejected!');
            setCurrentMatchId(0);
        }
    };

    return (
        <Row className="justify-content-md-center">
            <Col md="8">
                {matches[currentMatchId] && (() => {
                    const playerData = matches[currentMatchId];
                    return (
                        <PlayerCard
                            {...playerData}
                            onAccept={handleAccept}
                            onReject={handleReject}
                        />
                    );
                })()}
            </Col>
        </Row>
    );
};

export default PlayersPage;
