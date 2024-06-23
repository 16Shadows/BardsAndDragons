import React from "react";
import PlayerCard from "./PlayerCard";
import usePlayersMatching from "./usePlayersMatching";
import { getFriendsPageRoute, getGamesPageRoute, getMyProfilePageRoute } from "../../components/routes/Navigation";
import { Button, Container, Row, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import CenteredCardWithItem from "../../components/CenteredCardWithItem";
import "../../css/Main.css";

const title = "Поиск игроков";

type RequiredField = {
    key: string;
    message: string;
};

const requiredFields: RequiredField[] = [
    { key: "birthday", message: "Дата рождения" },
    { key: "displayName", message: "Ваше имя" },
    { key: "avatar", message: "Аватар" },
    { key: "profileDescription", message: "Описание профиля" },
    { key: "contactInfo", message: "Контактная информация" },
    { key: "city", message: "Город" }
];

const PlayersPage = () => {
    const navigate = useNavigate();

    const {
        matches,
        currentMatchId,
        handleAccept,
        handleReject,
        isLoading,
        userValidation
    } = usePlayersMatching();

    // Matches are loading from API
    if (isLoading) {
        return (<Container className="page-container"><CenteredCardWithItem
            title={title}
            columnWidth={8}
            cardBody={
                <div className="text-center mt-5 mb-5">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Загрузка...</span>
                    </Spinner>
                </div>
            } /></Container>);
    }

    // User is not valid for matching
    if (!userValidation || !userValidation.isValid) {
        const missingFields = requiredFields.filter(field => userValidation.missingFields[field.key]);

        return (
            <Container className="page-container">
                <CenteredCardWithItem
                    title={title}
                    columnWidth={8}
                    cardBody={
                        <div>
                            {missingFields.length > 0 && (
                                <div>
                                    <h4>Для поиска других игроков, пожалуйста, заполните следующие поля в вашем профиле:</h4>
                                    <ul>
                                        {missingFields.map(field => (
                                            <li key={field.key}><h5>{field.message}</h5></li>
                                        ))}
                                    </ul>
                                    <div className={"text-end"}>
                                        <Button variant="primary" className="w-25 mb-3"
                                            onClick={() => navigate(getMyProfilePageRoute())}>
                                            Мой профиль
                                        </Button>
                                    </div>
                                </div>
                            )}
                            {userValidation.missingFields.games && (
                                <div>
                                    <h4 className={"mt-4"}>Для участия в мэтчинге, у вас должна быть хотя бы одна игра в
                                        подписках</h4>
                                    <div className={"text-end"}>
                                        <Button variant="primary" className="w-25 mt-3"
                                            onClick={() => navigate(getGamesPageRoute())}>
                                            Все игры
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    } /></Container>);
    }

    // No matches
    if (!matches || !matches.length || !matches[currentMatchId]) {
        return (<Container className="page-container">
            <CenteredCardWithItem
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
                } /> </Container>);
    }

    // Render player card
    return (
        <Container className="page-container">
            <PlayerCard
                {...matches[currentMatchId]}
                onAccept={handleAccept}
                onReject={handleReject} />
        </Container>);
};

export default PlayersPage;
