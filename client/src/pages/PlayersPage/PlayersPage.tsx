// client/src/pages/PlayersPage/PlayersPage.tsx
import React from "react";
import PlayerCard from "./PlayerCard";
import usePlayersMatching from "./usePlayersMatching";
import {getFriendsPageRoute, getGamesPageRoute, getMyProfilePageRoute} from "../../components/routes/Navigation";
import {Button, Row, Spinner} from "react-bootstrap";
import {useNavigate} from "react-router-dom";
import CenteredCardWithItem from "../../components/CenteredCardWithItem";

const title = "Поиск игроков";

const PlayersPage = () => {
    const navigate = useNavigate();

    const {
        matches,
        currentMatchId,
        handleAccept,
        handleReject,
        isLoading,
        isUserValidForMatching
    } = usePlayersMatching();

    // Matches are loading from API
    if (isLoading) {
        return (<CenteredCardWithItem
            title={title}
            columnWidth={8}
            cardBody={
                <div className="text-center mt-5 mb-5">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Загрузка...</span>
                    </Spinner>
                </div>
            }/>);
    }

    // User is not valid for matching
    if (!isUserValidForMatching) {
        return (<CenteredCardWithItem
            title={title}
            columnWidth={8}
            cardBody={
                <div>
                    <h4>Для поиска других игроков, пожалуйста, заполните следующие поля в вашем профиле:</h4>
                    <ul>
                        {["Дата рождения", "Ваше имя", "Аватар", "Город", "Описание профиля", "Контактная информация"].map(field => (
                            <li key={field}>{field}</li>
                        ))}
                    </ul>
                    <Button variant="primary" className="w-25 mb-3" onClick={() => navigate(getMyProfilePageRoute())}>
                        Мой профиль
                    </Button>
                    <h4 className={"mt-4"}>Для участия в мэтчинге, у вас должна быть хотя бы одна игра в подписках</h4>
                    <Button variant="primary" className="w-25" onClick={() => navigate(getGamesPageRoute())}>
                        Все игры
                    </Button>
                </div>
            }/>);
    }

    // No matches
    if (!matches.length || !matches[currentMatchId]) {
        return (<CenteredCardWithItem
            title={title}
            columnWidth={8}
            cardBody={
                <div>
                    <h4 className="text-center">
                        Упс... кажется, мы пока не можем найти новых друзей для игры :(
                    </h4>
                    <Row className="justify-content-center">
                        <Button variant="primary" className="w-50 mt-3 mb-3"
                                onClick={() => navigate(getFriendsPageRoute())}>
                            Посмотреть, кого можно позвать поиграть!
                        </Button>
                    </Row>
                    <Row className="justify-content-center mb-5">
                        <Button variant="primary" className="w-50" onClick={() => navigate(getGamesPageRoute())}>
                            Поискать новые интересные игры!
                        </Button>
                    </Row>
                </div>
            }/>);
    }

    // Render player card
    return (
        <PlayerCard
            {...matches[currentMatchId]}
            onAccept={handleAccept}
            onReject={handleReject}/>
    );
};

export default PlayersPage;
