import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Spinner, Tab, Tabs } from "react-bootstrap";
import "../../css/App.css";
import "../../css/ProfilePage.css";

import GamesList from "./GameList";
import GameItem from "./GameItem";
import defaultAvatarPic from "../../resources/EmptyProfileAvatar_200px.png";
import useApi from "../../http-common";

function FriendButtons({ playerUsername }: { playerUsername: string }) {
    const api = useApi();
    const [justDeleted, setJustDeleted] = useState(false);
    const [disabled, setDisabled] = useState(false);

    const addFriend = useCallback(async () => {
        try {
            setDisabled(true);
            await api.post(`user/${playerUsername}/addFriend`);
            setJustDeleted(false);
            setDisabled(false);
        } catch {
            setDisabled(false);
        }
    }, [api, playerUsername]);

    const deleteFriend = useCallback(async () => {
        try {
            setDisabled(true);
            await api.post(`user/${playerUsername}/removeFriend`);
            setJustDeleted(true);
            setDisabled(false);
        } catch {
            setDisabled(false);
        }
    }, [api, playerUsername]);

    if (justDeleted)
        return (
            <Button disabled={disabled} onClick={addFriend} variant='outline-success'>
                Принять заявку
            </Button>
        );
    else
        return (
            <Button disabled={disabled} onClick={deleteFriend} variant='outline-danger'>
                Удалить из друзей
            </Button>
        );
}

function IncomingRequestButtons({ playerUsername }: { playerUsername: string }) {
    const api = useApi();
    const [justDeleted, setJustDeleted] = useState(true);
    const [disabled, setDisabled] = useState(false);

    const addFriend = useCallback(async () => {
        try {
            setDisabled(true);
            await api.post(`user/${playerUsername}/addFriend`);
            setJustDeleted(false);
            setDisabled(false);
        } catch {
            setDisabled(false);
        }
    }, [api, playerUsername]);

    const deleteFriend = useCallback(async () => {
        try {
            setDisabled(true);
            await api.post(`user/${playerUsername}/removeFriend`);
            setJustDeleted(true);
            setDisabled(false);
        } catch {
            setDisabled(false);
        }
    }, [api, playerUsername]);

    if (justDeleted)
        return (
            <Button disabled={disabled} onClick={addFriend} variant='outline-success'>
                Принять заявку
            </Button>
        );
    else
        return (
            <Button disabled={disabled} onClick={deleteFriend} variant='outline-danger'>
                Удалить из друзей
            </Button>
        );
}

function OutgoingRequestButtons({ playerUsername }: { playerUsername: string }) {
    const api = useApi();
    const [justDeleted, setJustDeleted] = useState(false);
    const [disabled, setDisabled] = useState(false);

    const addFriend = useCallback(async () => {
        try {
            setDisabled(true);
            await api.post(`user/${playerUsername}/addFriend`);
            setJustDeleted(false);
            setDisabled(false);
        } catch {
            setDisabled(false);
        }
    }, [api, playerUsername]);

    const deleteFriend = useCallback(async () => {
        try {
            setDisabled(true);
            await api.post(`user/${playerUsername}/removeFriend`);
            setJustDeleted(true);
            setDisabled(false);
        } catch {
            setDisabled(false);
        }
    }, [api, playerUsername]);

    if (justDeleted)
        return (
            <Button disabled={disabled} onClick={addFriend} variant='outline-success'>
                Отправить заявку
            </Button>
        );
    else
        return (
            <Button disabled={disabled} onClick={deleteFriend} variant='outline-danger'>
                Отозвать заявку
            </Button>
        );
}

const OtherPlayerPage = () => {

    const api = useApi();

    // Extract username from URL parameters
    const { username: playerUsername } = useParams<{ username: string }>();

    // Status of friendship for button
    const [friendshipStatus, setFriendshipStatus] = useState<string | null>(null);

    // Add loading state
    const [loading, setLoading] = useState(true); 

    // TODO сохранить на клиенте почту и никнейм, сделать константами и не запрашивать их
    const [username, setUsername] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [displayName, setName] = useState<string | null>(null);
    const [description, setProfileDescription] = useState<string | null>(null);
    const [contactInfo, setContactInfo] = useState<string | null>(null);
    const [city, setCity] = useState<string>("");
    const [avatar, setAvatar] = useState<string | null>(null);
    const [age, setAge] = useState<number | null>(null);

    const fetchPlayerProfile = useCallback(async () => {
        setLoading(true); // Start loading
        try {
            const response = await api.get(`user/public/${playerUsername}`);
            const data = response.data;

            // Fetch friendship status
            const friendshipResponse = await api.get(`user/${playerUsername}/friendshipStatus`);
            setFriendshipStatus(friendshipResponse.data.status);

            setUsername(data.username);
            setEmail(data.email);
            data.displayName && setName(data.displayName);
            data.description && setProfileDescription(data.description);
            data.contactInfo && setContactInfo(data.contactInfo);
            data.city && setCity(data.city);
            data.avatar && setAvatar("/" + data.avatar);
            if (data.age !== undefined) {
                setAge(data.age);
            }

        } catch (e) {
            alert("Не удалось загрузить данные профиля.\n" + e);
        } finally {
            setLoading(false); // End loading
        }
    }, [api, playerUsername]);

    useEffect(() => {
        fetchPlayerProfile();
    }, [fetchPlayerProfile]);

    const renderFriendButton = () => {
        if (!playerUsername) return null;
        switch (friendshipStatus) {
            case "friends":
                return <FriendButtons playerUsername={playerUsername} />;
            case "incomingRequest":
                return <IncomingRequestButtons playerUsername={playerUsername} />;
            case "outgoingRequest":
                return <OutgoingRequestButtons playerUsername={playerUsername} />;
            case "none":
                return (
                    <Button onClick={() => api.post(`user/${username}/addFriend`).then(fetchPlayerProfile)} variant='outline-success'>
                        Добавить в друзья
                    </Button>
                );
        }
    };

    function getAgeString(age: number | null): string {
        if (age === null || age === undefined) {
            return "Возраст скрыт";
        }

        const lastDigit = age % 10;
        const lastTwoDigits = age % 100;
        if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
            return `${age} лет`;
        }
        switch (lastDigit) {
            case 1:
                return `${age} год`;
            case 2:
            case 3:
            case 4:
                return `${age} года`;
            default:
                return `${age} лет`;
        }
    }

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: "70vh" }}>
                <Spinner animation="border" role="status">
                    <span className="sr-only"></span>
                </Spinner>
            </div>
        );
    }

    return (
        <div className="d-flex flex-column content">
            <div className="bg-white row profile-row">
                <div className="pic-col">

                    <img
                        id="profile_pic"
                        className="profile_image mb-2"
                        alt="Ошибка загрузки аватара"
                        src={avatar ?? defaultAvatarPic}
                    />

                    <div className="row mb-2">
                        {renderFriendButton()}
                    </div>

                </div>

                <div className="label-col text_column col">

                    <div className="mb-2">
                        <span className="d-block font-weight-bold">{displayName ?? username}</span>
                        <span className="d-block text-weight-bold">{city === "" ? ("Город: не указан") : ("Город: " + city)}</span>
                        <span>{getAgeString(age)}</span>
                    </div>

                    <div className="mb-2">
                        <label htmlFor="ProfileDescription" className="d-block">Описание профиля:</label>
                        <textarea
                            rows={4}
                            maxLength={300}
                            className="form-control"
                            id="ProfileDescription"
                            disabled={true}
                            value={description ?? ""}
                        ></textarea>
                    </div>

                    <div>
                        <label htmlFor="ProfileContacts" className="d-block">Контакты:</label>
                        {friendshipStatus === "friends" ? (
                            <textarea
                                rows={4}
                                maxLength={300}
                                className="form-control"
                                id="ProfileContacts"
                                disabled={true}
                                value={contactInfo ?? "Нет доступных контактов"}
                            ></textarea>
                        ) : (
                            <textarea
                                rows={4}
                                maxLength={300}
                                className="form-control"
                                id="ProfileContacts"
                                disabled={true}
                                value={"Для просмотра контактов необдходимо быть в друзьях у пользователя"}
                            ></textarea>
                        )}
                    </div>

                </div>
            </div>

            <hr style={{ marginTop: 15 }} />

            <Tabs>
                <Tab title='Игры' eventKey='game-list' className="p-2">
                    <GamesList
                        gameItemTemplate={(x) => {
                            return (
                                <GameItem game={x} key={x.gamename}>

                                </GameItem>
                            )
                        }}
                        gameListUrlBuilder={(len, sortBy, sortOrder) => `user/public/games?start=${len}&sortBy=${sortBy}&sortOrder=${sortOrder}&username=${playerUsername}`}
                    />
                </Tab>
            </Tabs >
            
        </div >
    );
};
export default OtherPlayerPage;
