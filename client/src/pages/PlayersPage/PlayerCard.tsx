import React from "react";
import {Card, Button, Row, Col} from "react-bootstrap";
import "./PlayerCard.css";
import NoAvatarImage from "../../resources/EmptyProfileAvatar_200px.png";
import {PlayerData} from "./PlayerData";
import CenteredCardWithItem from "../../components/CenteredCardWithItem";
import GameList from "./GameList";
import {FaHeart} from "react-icons/fa";
import {ImCross} from "react-icons/im";

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
    // Number of games to show per page
    const gamesPerPage = 6;

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
                            <Card.Title>{displayName}{age && `, ${age}`}</Card.Title>
                            <Card.Subtitle
                                className="mb-2 text-muted">{city ?? 'город не указан'}</Card.Subtitle>
                            <Card.Text>{description}</Card.Text>
                        </Col>
                    </Row>

                    <Card.Text>
                        <GameList key={username} games={games} gamesPerPage={gamesPerPage}/>
                    </Card.Text>

                    <div className={"d-flex justify-content-between"}>
                        <Button variant="danger" className={"round-button cross-size"}
                                onClick={() => onReject(username)}><ImCross/></Button>
                        <Button variant="success" className={"round-button"}
                                onClick={() => onAccept(username)}><FaHeart/></Button>
                    </div>
                </>
            }
        />
    );
};

export default PlayerCard;