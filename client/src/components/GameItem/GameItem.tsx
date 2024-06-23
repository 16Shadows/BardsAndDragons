import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./GameItem.css"
import { CiSquareMinus } from "react-icons/ci";
import { Button } from "react-bootstrap";
import { getGamePageRoute } from "../routes/Navigation";

// Игра
export interface IGameProps {
    id: number;
    name: string;
    description: string;
    playerCount: string;
    ageRating: string; 
    subscribed?: boolean;
    image: string;
    tags: string[];
}

// Функция подписки/отписки
interface ISubscribe {
    (gameId: number): Promise<boolean | undefined>
}

// Принимаемые параметры
interface IProps {
    game: IGameProps;
    logined?: boolean;
    subscribe: ISubscribe;
    unsubscribe: ISubscribe;
}

const Game = ({game, logined=false, subscribe, unsubscribe}: IProps) => {
    // Для перехода к странице игры
    const navigate = useNavigate()

    // Состояние подписки
    const [subscribeState, setSubscribeState] = useState(game.subscribed ?? false)

    // Функции подписки и отписки
    async function subscribed() {
        if (await subscribe(game.id)) 
            setSubscribeState(true);
    }

    async function unsubscribed() {
        if (await unsubscribe(game.id))
            setSubscribeState(false);
    }

    //console.log("Game")
    return (
        <div className="game-game-item">
            {/* Картинка игры */}
            <div className="game-game-icon">
                <img width={"100%"} height={"100%"} alt="Картинка?" src={'/'+game.image} ></img>
            </div>

            {/* Описание игры */}
            <div className="game-game-describe">
                <div>
                    {/* Переход к игре */}
                    <span className="game-game-button-block">
                        <button className="game-game-button" onClick={() => navigate(getGamePageRoute(String(game.id)))}>{game.name}</button>
                    </span>
                    {
                        // Панель для подписки/отписки
                        logined &&
                        <span className="game-game-subscribing-panel">
                            {
                                subscribeState
                                    ?
                                    //<Button style={{ width: "100%", padding: "0px 2px 1px 2px", border: "none", background: "rgb(232, 65, 65)" }}>Отписаться</Button>
                                    <button onClick={unsubscribed} className="game-game-unsubscribe-button">
                                        <CiSquareMinus id="icon-image" size={30} color="red" />
                                    </button>

                                    :
                                    <Button onClick={subscribed} className="game-game-subscribe-button">Подписаться</Button>
                            }
                        </span>
                    }
                </div>
                <div>{game.description}</div>
                <div>
                    <span style={{ fontWeight: "bolder" }}>{game.playerCount} игроков, {game.ageRating}</span>, 
                    {game.tags.map(tag => ' #'+tag)}
                </div>
            </div>
        </div>
    )
}

// Можно ещё каждое свойство/поле через useMemo сделать
// При перерендеринге страницы проверяет (наверно по хешу), изменилось ли какое-либо из полей компонента
// Если нет, то перерендеринг компонента не происходит
export default React.memo(Game);