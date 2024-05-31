import React, {useCallback, useMemo, useState} from "react";
import {FaChevronLeft, FaChevronRight} from "react-icons/fa";
import {Button, Row, Col, Badge} from "react-bootstrap";
import {GameData} from "./PlayerData";
import {MdGames} from "react-icons/md";
import "./GameList.css";

interface GameListProps {
    games: GameData[];
    gamesPerPage: number;
}

const OnlineItem = React.memo(() => {
    return (
        <Badge pill className="onlineItemBadge">online</Badge>
    )
});

const GameItem = React.memo(({name, playsOnline}: GameData) => {
    return (
        <Badge className="gameItemBadge mb-1 mt-1">
            <MdGames className="gameItemIcon"/>&nbsp;
            {name}&nbsp;
            {playsOnline ? <OnlineItem/> : null}
        </Badge>
    )
});

const GameList = ({games, gamesPerPage}: GameListProps) => {
    const [currentPage, setCurrentPage] = useState(0);
    const totalPages = useMemo(() => Math.ceil(games.length / gamesPerPage), [games.length, gamesPerPage]);

    const handlePrevious = useCallback(() => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    }, [currentPage]);

    const handleNext = useCallback(() => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
        }
    }, [currentPage, totalPages]);

    const currentGames = useMemo(() => {
        const startIndex = currentPage * gamesPerPage;
        const endIndex = startIndex + gamesPerPage;
        return games.slice(startIndex, endIndex);
    }, [currentPage, games, gamesPerPage]);

    return (
        <div>
            <h4 className={"mt-2"}>Игры</h4>
            <div className={"d-flex justify-content-between align-items-center"}>
                <Button variant={"link"} onClick={handlePrevious} disabled={currentPage === 0}>
                    <FaChevronLeft/>
                </Button>
                <Row className={"justify-content-center"}>
                    {currentGames.map((game, index) => (
                        <Col xs={"auto"} sm={"auto"} key={index}>
                            <GameItem {...game}/>
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
