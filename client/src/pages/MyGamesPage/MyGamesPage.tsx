import { Button, Tab, Tabs } from "react-bootstrap";
import GamesList from "./GamesList";
import GameItem from "./GameItem";
import { useCallback, useState } from "react";
import useApi from "../../http-common";
import GameData from "./GameData";
import './GameItem.css';

function GameButtons({ game }: { game: GameData }) {
    const api = useApi();
    const [justDeleted, setJustDeleted] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [playsOnline, setPlaysOnline] = useState(game.playsOnline);

    const handleCheckboxChange = useCallback(async () => {
        const newStatus = !playsOnline;
        try {
            await api.post(`user/${game.gamename}/updateOnlineStatus`, {
                playsOnline: newStatus
            });
            setPlaysOnline(newStatus);
        } catch (error) {
            console.error('Error:', error);
        }
    }, [api, playsOnline, game.gamename]);

    const addGame = useCallback(async () => {
        try {
            setDisabled(true);
            await api.post(`user/${game.gamename}/addGame`);
            setPlaysOnline(false);
            setJustDeleted(false);
            setDisabled(false);
        }
        catch { }
    }, [api, game]);

    const deleteGame = useCallback(async () => {
        try {
            setDisabled(true);
            await api.post(`user/${game.gamename}/removeGame`);
            setJustDeleted(true);
            setDisabled(false);
        }
        catch { }
    }, [api, game]);

    if (justDeleted) {
        return (
            <Button disabled={disabled} onClick={addGame} variant='outline-success'>
                Подписаться
            </Button>

        );
    }
    else
        return (
    
            <div className="game-header">
                <div className="online-status">
                    <span>Играю онлайн</span>
                    <input
                        type="checkbox"
                        checked={playsOnline}
                        className="styled-checkbox"
                        onChange={handleCheckboxChange}
                    />
                </div>
                <Button disabled={disabled} onClick={deleteGame} variant='outline-danger'>
                    -
                </Button>
            </div>
        );
}

function MyGamesPage() {
    return (
        <Tabs>
            <Tab title='Мои игры' eventKey='game-list' className="p-2">
                <GamesList
                    gameItemTemplate={(x) => {
                        return (
                            <GameItem game={x} key={x.gamename}>
                                <GameButtons game={x} />
                            </GameItem>
                        )
                    }}
                    gameListUrlBuilder={(len, sortBy, sortOrder) => `user/@current/games/current?start=${len}&sortBy=${sortBy}&sortOrder=${sortOrder}`}
                />
            </Tab>
        </Tabs>
    );
};

export default MyGamesPage;
