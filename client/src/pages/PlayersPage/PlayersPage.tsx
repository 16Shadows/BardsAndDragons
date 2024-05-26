import React from "react";
import {Col, Row} from "react-bootstrap";
import PlayerCard from "./PlayerCard";

const PlayersPage = () => {
    const handleAccept = () => {
        console.log('Player accepted');
    };

    const handleReject = () => {
        console.log('Player rejected');
    };

    const playerData = {
        name: 'Иван Иванов',
        age: 25,
        city: 'Москва',
        description: 'Являюсь заядлым геймером с детства. Играю в различные игры от шутеров до стратегий.',
        avatarUrl: 'http://localhost:3000/userimages/avatar2.png',
        games: ['Dota 2', 'CS: GO', 'World of Warcraft'],
    };

    return (
        <Row className="justify-content-md-center">
            <Col md="8">
                <PlayerCard
                    name={playerData.name}
                    age={playerData.age}
                    city={playerData.city}
                    description={playerData.description}
                    avatarUrl={playerData.avatarUrl}
                    games={playerData.games}
                    onAccept={handleAccept}
                    onReject={handleReject}
                />
            </Col>
        </Row>
    );
};

export default PlayersPage;
