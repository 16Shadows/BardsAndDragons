import React, { useEffect, useMemo, useReducer, useRef, useState } from "react";
import Button from "../components/Button";
import GameItem, { IGameProps } from "../components/GameItem";
import { Col, Container, Row } from "react-bootstrap";
import useApi from '../http-common'

const GamesPage = () => {

    //const [totalGamesCount, setTotalGamesCount] = useState(0)
    //const [currentGameNumber, setCurrentGameNumber] = useState(0)

    const requestSize = 3

    const totalGamesNumberRef = useRef(0)

    const currentGameNumberRef = useRef(0)

    const [fetching, setFetching] = useState(true)

    const [games, setGames] = useState<IGameProps[]>()
    //{ id: 1, name: "Uno Flip", description: "карточная игра", playerCount: "5", ageRating: "12+" }

    const [searchQuery, setSearchQuery] = useState('')

    function scrollHandler(event: Event) {
        //let doc: Document = (event.target) as Document;
        //console.log(doc.documentElement.scrollHeight)
        
        //console.log(`Current count: ${currentGameNumberRef.current}`);
        //console.log(`Total count: ${totalGamesNumberRef.current}`);
        if (document.documentElement.scrollHeight - document.documentElement.scrollTop - window.innerHeight < 100 && currentGameNumberRef.current < totalGamesNumberRef.current) {
            setFetching(true);
        }
    }

    function searchGames() {

    }

    const api = useApi();

    useEffect(() => {
        document.addEventListener("scroll", scrollHandler);

        api.get('game/games-number').then(function (response) {
            totalGamesNumberRef.current = response.data + requestSize;
        })

        return function() {
            document.removeEventListener("scroll", scrollHandler);
        }
    }, [])

    useEffect(() => {
        if (fetching) {
            console.log("fetching games");
            console.log(`Current: ${currentGameNumberRef.current}`);
            api.get('game/games', { params: {limit: requestSize, start: currentGameNumberRef.current}}).then(function (response) {
                if (!games)
                    setGames(response.data);
                else
                    setGames([...games, ...response.data]);
                
                //setCurrentGameNumber(currentGameNumber + requestSize);
                currentGameNumberRef.current += requestSize;
            }).finally(() => setFetching(false))
        }
    }, [fetching])

    return (
        <div>
            <Container>
                <Row>
                    <Col md="6">
                        <div style={{backgroundColor: "rgba(179, 179, 181, 0.3)", padding: "15px 15px 15px 15px", borderRadius: "10px"}} className="static-item">
                            <div style={{fontSize: "24px"}}><b>Название</b></div>
                            <input style={{width: "100%"}} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                            <Button onClick={searchGames} style={{width: "40%", marginTop: "15px", fontSize: "20px"}}>Поиск</Button>
                        </div>
                    </Col>
                    <Col md="6">
                        <h2 style={{ backgroundColor: "white", paddingTop: "115px", marginBottom: "0px", paddingBottom: "10px", top: "0px", position: "fixed", width: "100%" }}>Игры</h2>
                        <div style={{ backgroundColor: "rgba(179, 179, 181, 0.3)", padding: "15px 15px 15px 15px", borderRadius: "10px", marginTop: "50px", marginBottom: "20px" }}>
                            {
                                games
                                    ?
                                    games.length > 0
                                        ?
                                        <div>
                                            {games.map((game) =>
                                                <GameItem game={game} key={game.id}></GameItem>
                                            )}
                                        </div>
                                        :
                                        <div>
                                            <h2> Игр не найдено </h2>
                                            {games.map((game) =>
                                                <GameItem game={game} key={game.id}></GameItem>
                                            )}
                                        </div>
                                    : <h2> Игры загружаются... </h2>
                            }
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default GamesPage;
