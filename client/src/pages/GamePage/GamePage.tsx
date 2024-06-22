import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import GameItem, { IGameProps } from "../../components/GameItem/GameItem";
import { Button, Col, Form, Row } from "react-bootstrap";
import useApi from '../../http-common'
import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated'
import "./GamePage.css"
import ModalWindowAlert from "../../components/ModalWindowAlert/ModalWindowAlert";
import { json } from "stream/consumers";
import { join } from "path";
import { IoMdPeople } from "react-icons/io";
import gameImage from "../../resources/Uno flip.jpg"
import { FaArrowLeft } from "react-icons/fa";
import { FaArrowRight } from "react-icons/fa";

const GamePage = () => {
    // ===Авторизация===
    // Проверка, авторизован ли пользователь
    const isAuthenticated = useIsAuthenticated()

    // Определение запроса в зависимости от статуса авторизации
    const gameRequestName = isAuthenticated ? 'game/games-with-subscription' : 'game/games'

    const [game, setGame] = useState<Game | undefined>(undefined)

    const [image, setImage] = useState<string | undefined>(undefined)

    const [subscribed, setSubscribed] = useState<boolean>(false)

    // Axios API для запросов к беку
    const api = useApi();

    type Game = {
        id: number;
        name: string;
        description: string;
        playerCount: string;
        ageRating: string; 
        subscribed?: boolean;
        tags?: string[];
        images: string[];
    }
    
    useEffect(() => {
        console.log("get game");
        api.get(`games/${1}`).then(function (response) {
            setGame(response.data);
            console.log("set game");
        }).catch(() => {

        }).finally(() => {

        })
    }, [])

    // дописать префиксы к путям css на обоих страницах

    // Основной компонент
    return (
        <Row className="gx-5 d-flex justify-content-center">
            {/* Игра */}
            <Col md="8">
                <div id="game-game-image">
                    <button className="game-image-arrow-button" style={{ marginRight: "10px" }}><FaArrowLeft className="game-image-arrow" size={"50px"} color="rgb(106, 180, 241)" /></button>
                    {/* <img width={"100%"} height={"100%"} src={game?.images[0]} ></img> */}
                    <img style={{ aspectRatio: "1/1" }} height={"100%"} src={gameImage} ></img>
                    <button className="game-image-arrow-button" style={{ marginLeft: "10px" }}><FaArrowRight className="game-image-arrow" size={"50px"} color="rgb(106, 180, 241)" /></button>
                </div>
                {
                    isAuthenticated ?
                        <div style={{ marginTop: "10px", width: "100%", textAlign: "right"}}>
                            {
                                subscribed ?
                                    <Button style={{fontSize: "20px", background: "rgb(232, 65, 65)", borderColor: "rgb(232, 65, 65)"}}>Отписаться</Button>
                                    :
                                    <Button style={{fontSize: "20px"}}>Подписаться</Button>
                            }
                        </div>
                        :
                        <div style={{marginTop: "25px"}} />
                }
                <div id="game-info-box">
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div>
                            <div id="game-game-header">{game?.name}</div>
                            <div style={{ fontSize: "20px", fontWeight: "bold" }}>
                                {
                                    game?.tags ?
                                        game.tags.map(tag => <span>#{tag} </span>)
                                        :
                                        "У этой игры пока нет тегов"
                                }
                            </div>
                        </div>
                        <div style={{ fontSize: "20px", marginTop: "10px" }}>
                            <IoMdPeople size={"40px"} style={{ marginTop: "-2px" }} />
                            <span className="game-add-info-box" style={{ marginLeft: "8px", whiteSpace: "nowrap" }}>{game?.playerCount} игроков</span>
                            <span className="game-add-info-box" style={{ marginLeft: "15px" }}>{game?.ageRating}</span>
                        </div>
                    </div>
                    <div id="game-game-description">{game?.description}</div>
                </div>
            </Col>
        </Row>
    );
};

export default GamePage;
