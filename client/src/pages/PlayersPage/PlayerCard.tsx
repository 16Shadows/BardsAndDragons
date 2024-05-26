import React from "react";
import {Card, Button} from "react-bootstrap";
import "./PlayerCard.css"
import NoAvatarImage from "../../resources/EmptyProfileAvatar_200px.png";
import {PlayerData} from "./PlayerData";

interface PlayerCardProps extends PlayerData {
    onAccept: (username: string) => void;
    onReject: (username: string) => void;
}

const PlayerCard = ({
                        username,
                        displayName,
                        age,
                        city,
                        description,
                        avatarPath,
                        games,
                        onAccept,
                        onReject,
                    }: PlayerCardProps) => {
    return (
        <Card className="player-card">
            <Card.Body>
                <div className="card-content">
                    <Card.Img variant="top"
                        // TODO: how to show avatar?
                              src={avatarPath ? `http://localhost:3000/${avatarPath}` : NoAvatarImage}
                              className="card-img"/>
                    <div className="card-text">
                        <Card.Title>{displayName}, {age ?? 'возраст не указан'}</Card.Title>
                        <Card.Subtitle className="mb-2 text-muted">{city ?? 'город не указан'}</Card.Subtitle>
                        <Card.Text>{description}</Card.Text>
                    </div>
                </div>
                <Card.Text>
                    <strong>Игры:</strong>
                    <ul>
                        {games.map((game, index) => (
                            <li key={index}>{game}</li>
                        ))}
                    </ul>
                </Card.Text>
                <div className="card-buttons">
                    <Button variant="danger" onClick={() => onReject(username)}>Отклонить</Button>
                    <Button variant="success" onClick={() => onAccept(username)}>Принять</Button>
                </div>
            </Card.Body>
        </Card>
    );
};

export default PlayerCard;