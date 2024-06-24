import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./GameItem.css"
import { CiSquareMinus } from "react-icons/ci";
import { IconContext } from "react-icons";
import { Button } from "react-bootstrap";
import gameImage from "../../resources/Uno flip.jpg"
import { getGamePageRoute } from "../routes/Navigation";

// Игра
export interface IGameProps {
    id: number;
    name: string;
    description: string;
    playerCount: string;
    ageRating: string; 
    subscribed?: boolean;
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

// Иконка для кнопки отписки
// function RemoveButton() {
//     return (
//       <IconContext.Provider value={{ color: 'red', size: '30px' }}>
//           <CiSquareMinus />
//       </IconContext.Provider>
//     );
// }

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
        <div className="show-game-item">
            {/* Картинка игры */}
            <div className="show-game-icon">
                <img width={"100%"} height={"100%"} src={gameImage} ></img>
            </div>

            {/* Описание игры */}
            <div className="show-game-describe">
                <div>
                    {/* Переход к игре */}
                    <span className="show-game-button-block">
                        <button className="show-game-button" onClick={() => navigate(getGamePageRoute(String(game.id)))}>{game.name}</button>
                    </span>
                    {
                        // Панель для подписки/отписки
                        logined &&
                        <span className="show-game-subscribing-panel">
                            {
                                subscribeState
                                    ?
                                    //<Button style={{ width: "100%", padding: "0px 2px 1px 2px", border: "none", background: "rgb(232, 65, 65)" }}>Отписаться</Button>
                                    <button onClick={unsubscribed} className="show-game-unsubscribe-button">
                                        <CiSquareMinus id="show-icon-image" size={30} color="red" />
                                    </button>

                                    :
                                    <Button onClick={subscribed} className="show-game-subscribe-button">Подписаться</Button>
                            }
                        </span>
                    }
                </div>
                <div>{game.description}</div>
                <div style={{ fontWeight: "bolder" }}>{game.playerCount} игроков, {game.ageRating}</div>
            </div>
        </div>
    )
}

// Можно ещё каждое свойство/поле через useMemo сделать
// При перерендеринге страницы проверяет (наверно по хешу), изменилось ли какое-либо из полей компонента
// Если нет, то перерендеринг компонента не происходит
export default React.memo(Game);