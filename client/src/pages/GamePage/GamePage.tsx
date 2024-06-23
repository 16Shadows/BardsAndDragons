import { useEffect, useRef, useState } from "react";
import { Button, Col, Row } from "react-bootstrap";
import useApi from '../../http-common'
import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated'
import "./GamePage.css"
import ModalWindowAlert from "../../components/ModalWindowAlert/ModalWindowAlert";
import { IoMdPeople } from "react-icons/io";
import { FaArrowLeft } from "react-icons/fa";
import { FaArrowRight } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { getNotFoundRoute } from "../../components/routes/Navigation";

const GamePage = () => {
    // ===Авторизация===
    // Проверка, авторизован ли пользователь
    const isAuthenticated = useIsAuthenticated()

    // ===Модальное окно===
    // Таймер закрытия окна
    const modalTimeoutHandler = useRef<NodeJS.Timeout>()

    // Сообщение об ошибке
    const [modalMessage, setModalMessage ] = useState("Сообщение")

    // Состояние модального окна скрыто/открыто
    const [modalIsShow, setModalIsShow] = useState(false)

    const [game, setGame] = useState<Game | undefined>(undefined)

    const [imageId, setImageId] = useState<number>(0)

    const [subscribeState, setSubscribeState] = useState<boolean | undefined>(undefined)

    const { id: gameId }  = useParams<{ id: string }>();

    // Для перехода к странице ошибки
    const navigate = useNavigate()

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
        api.get(`games/${gameId}`).then(function (response) {
            setGame(response.data);
        }).catch(() => {
            navigate(getNotFoundRoute());
        })

        if (isAuthenticated)
            api.get(`games/${gameId}/subscription`).then(function (response) {
                setSubscribeState(response.data);
            }).catch((error) => {
                showModal("Не удалось получить информацию о подписке на игру");
            })
    }, [])

    function nextImage() {
        if (game?.images.length) {
            if (imageId < game?.images.length - 1)
                setImageId(im => im + 1)
            else
                setImageId(0)
        }
    }

    function predImage() {
        if (game?.images.length) {
            if (imageId > 0)
                setImageId(im => im - 1)
            else
                setImageId(game?.images.length - 1)
        }
    }

    // Функции подписки и отписки
    async function subscribed() {
        if (game)
            if (await subscribe(game?.id)) 
                setSubscribeState(true);
    }

    async function unsubscribed() {
        if (game)
            if (await unsubscribe(game?.id))
                setSubscribeState(false);
    }

    // Подписка на игру
    async function subscribe(currentGameId: number): Promise<boolean | undefined> {
        let result;
        await api.post(`games/${currentGameId}/subscribe`).then(function (response) {
            result = true;
        }).catch((error) => {
            showModal(error.response?.data?.message || "Не удалось подписаться на игру");
            result = false;
        });
        return result;
    }

    // Отписка от игры
    async function unsubscribe(currentGameId: number): Promise<boolean | undefined> {
        let result;
        await api.post(`games/${currentGameId}/unsubscribe`).then(function (response) {
            result = true;
        }).catch((error) => {
            showModal(error.response?.data?.message || "Игра не найдена");
            result = false;
        })
        return result;
    }

    // Открыть модальное окно с сообщением
    function showModal(message: string, timeout = 5000) {
        setModalMessage(message);
        setModalIsShow(true);
        modalTimeoutHandler.current = setTimeout(hideModal, timeout);
    }

    // Закрыть модальное окно
    function hideModal() {
        setModalIsShow(state => {
            // Действия, если окно ещё не закрыто
            if (state) {
                clearTimeout(modalTimeoutHandler.current);
                return false;
            }
            // Если закрыто, то состояние не сменится
            else
                return false;
        });
    }
    

    // Основной компонент
    return (
        <Row className="gx-5 d-flex justify-content-center">
            {/* Игра */}
            <Col md="8">
                {!game
                    && <h1>Загружаем игру...</h1>
                }
                <div id="game-game-image">
                    <button disabled={!game?.images.length || game?.images.length < 2} className="game-image-arrow-button" onClick={predImage} style={{ marginRight: "10px" }}><FaArrowLeft className="game-image-arrow" size={"50px"} color="rgb(106, 180, 241)" /></button>
                    <img style={{ aspectRatio: "1/1" }} height={"100%"} alt="Куда же подевалась картинка..?" src={'/'+game?.images[imageId]} ></img>
                    <button disabled={!game?.images.length || game?.images.length < 2} className="game-image-arrow-button" onClick={nextImage} style={{ marginLeft: "10px" }}><FaArrowRight className="game-image-arrow" size={"50px"} color="rgb(106, 180, 241)" /></button>
                </div>
                {
                    isAuthenticated ?
                        <div style={{ marginTop: "10px", width: "100%", textAlign: "right"}}>
                            {
                                subscribeState ?
                                    <Button onClick={unsubscribed} style={{fontSize: "20px", background: "rgb(232, 65, 65)", borderColor: "rgb(232, 65, 65)"}}>Отписаться</Button>
                                    :
                                    <Button onClick={subscribed} style={{fontSize: "20px"}}>Подписаться</Button>
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
                                        game.tags.map(tag => <span key={tag}>#{tag} </span>)
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
                {/* Отображение ошибок */}
                <ModalWindowAlert show={modalIsShow} onHide={hideModal} message={modalMessage} />
            </Col>
        </Row>
    );
};

export default GamePage;
