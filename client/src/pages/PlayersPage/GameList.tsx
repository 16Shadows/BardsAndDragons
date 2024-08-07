import React, {useCallback, useMemo, useState} from "react";
import {FaChevronLeft, FaChevronRight} from "react-icons/fa";
import {Button, Row, Col, Badge, Card} from "react-bootstrap";
import {GameData} from "./PlayerData";
import {MdGames} from "react-icons/md";
import "./GameList.css";

interface GameListProps {
    games: GameData[];
    gamesPerPage: number;
}

const OnlineItem = React.memo(() => (
    <Badge pill className="online-item-badge">online</Badge>
));

const GameItem = React.memo(({name, playsOnline}: GameData) => (
    <Badge className="game-item-badge mb-1 mt-1">
        <MdGames className="game-item-icon"/>&nbsp;
        {name}&nbsp;
        {playsOnline ? <OnlineItem/> : null}
    </Badge>
));

const GameList = ({games, gamesPerPage}: GameListProps) => {
    const [currentPage, setCurrentPage] = useState(0);
    const totalPages = useMemo(() => Math.ceil(games.length / gamesPerPage), [games.length, gamesPerPage]);

    const handlePrevious = useCallback(() => {
        setCurrentPage(page => page > 0 ? page - 1 : page);
    }, []);

    const handleNext = useCallback(() => {
        setCurrentPage(page => page < totalPages - 1 ? page + 1 : page);
    }, [totalPages]);

    const currentGames = useMemo(() => {
        const startIndex = currentPage * gamesPerPage;
        return games.slice(startIndex, startIndex + gamesPerPage);
    }, [currentPage, games, gamesPerPage]);

    return (
        <div>
            <div className={"border-top mt-2"}></div>
            <Card.Title className={"text-center mt-2"}>Игры</Card.Title>
            <div className={"d-flex justify-content-between align-items-center game-items"}>
                <Button variant={"link"} onClick={handlePrevious} disabled={currentPage === 0}>
                    <FaChevronLeft/>
                </Button>
                <Row className={"justify-content-center"}>
                    {currentGames.map((game, index) => (
                        <Col xs={"auto"} sm={"auto"} key={index}>
                            <GameItem {...game} />
                        </Col>
                    ))}
                </Row>
                <Button variant={"link"} onClick={handleNext} disabled={currentPage === totalPages - 1}>
                    <FaChevronRight/>
                </Button>
            </div>
        </div>
    );
};

export default GameList;
