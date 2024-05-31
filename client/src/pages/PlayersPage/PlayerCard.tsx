import React from "react";
import {Card, Button, Row, Col} from "react-bootstrap";
import "./PlayerCard.css";
import NoAvatarImage from "../../resources/EmptyProfileAvatar_200px.png";
import {PlayerData} from "./PlayerData";
import CenteredCardWithItem from "../../components/CenteredCardWithItem";

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
        <CenteredCardWithItem
            columnWidth={8}
            cardClassName="player-card mb-3"
            cardBody={
                <>
                    <Row>
                        <Col md={5}>
                            <Card.Img variant="top"
                                // TODO: how to show avatar?
                                      src={avatarPath ? `http://localhost:3000/${avatarPath}` : NoAvatarImage}
                                      className="card-img mb-2"/>
                        </Col>

                        <Col>
                            <Card.Title>{displayName}, {age ?? 'возраст не указан'}</Card.Title>
                            <Card.Subtitle
                                className="mb-2 text-muted">{city ?? 'город не указан'}</Card.Subtitle>
                            <Card.Text>{description}</Card.Text>
                        </Col>
                    </Row>

                    <Card.Text>
                        <strong>Игры:</strong>
                        <ul>
                            {games.map((game, index) => (
                                    <li key={index}>{game.name}, {game.playsOnline ? 'онлайн' : 'оффлайн'}</li>
                                )
                            )}
                        </ul>
                    </Card.Text>

                    <Row>
                        <Col xs="auto" sm="auto" xl="2">
                            <Button className="w-100" variant="danger"
                                    onClick={() => onReject(username)}>Отклонить</Button>
                        </Col>
                        <Col></Col>
                        <Col xs="auto" sm="auto" xl="2">
                            <Button className="w-100" variant="success"
                                    onClick={() => onAccept(username)}>Принять</Button>
                        </Col>
                    </Row>
                </>
            }
        />
    );
};

export default PlayerCard;