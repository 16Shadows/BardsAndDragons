import React from "react";
import {Card, Button} from "react-bootstrap";
import "./PlayerCard.css"
import NoAvatarImage from "../../resources/EmptyProfileAvatar_200px.png";

interface PlayerCardProps {
    name: string;
    age?: number;
    city?: string;
    description: string;
    avatarUrl?: string;
    games: string[];
    onAccept: () => void;
    onReject: () => void;
}

const PlayerCard = ({
                        name,
                        age,
                        city,
                        description,
                        avatarUrl,
                        games,
                        onAccept,
                        onReject,
                    }: PlayerCardProps) => {
    return (
        <Card className="player-card">
            <Card.Body>
                <div className="card-content">
                    <Card.Img variant="top" src={avatarUrl ?? NoAvatarImage} className="card-img"/>
                    <div className="card-text">
                        <Card.Title>{name}, {age ?? 'возраст не указан'}</Card.Title>
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
                    <Button variant="danger" onClick={onReject}>Отклонить</Button>
                    <Button variant="success" onClick={onAccept}>Принять</Button>
                </div>
            </Card.Body>
        </Card>
    );
};

export default PlayerCard;