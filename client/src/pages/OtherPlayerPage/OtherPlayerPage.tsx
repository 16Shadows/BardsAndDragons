import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Container, Spinner, Tab, Tabs } from "react-bootstrap";
import "../../css/App.css";
import "./OtherPlayerPage.css";
import "../../css/Main.css";

import GamesList from "./GameList";
import GameItem from "./GameItem";
import defaultAvatarPic from "../../resources/EmptyProfileAvatar_200px.png";
import useApi from "../../http-common";
import { AxiosError } from "axios";
import { getNotFoundRoute } from "../../components/routes/Navigation";

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

function NewRequestButtons({ playerUsername }: { playerUsername: string }) {
    const api = useApi();
    const [justDeleted, setJustDeleted] = useState(false);
    const [disabled, setDisabled] = useState(false);

    const addFriend = useCallback(async () => {
        try {
            setDisabled(true);
            await api.post(`user/${playerUsername}/addFriend`);
            setJustDeleted(true);
            setDisabled(false);
        } catch {
            setDisabled(false);
        }
    }, [api, playerUsername]);

    const deleteFriend = useCallback(async () => {
        try {
            setDisabled(true);
            await api.post(`user/${playerUsername}/removeFriend`);
            setJustDeleted(false);
            setDisabled(false);
        } catch {
            setDisabled(false);
        }
    }, [api, playerUsername]);

    if (!justDeleted)
        return (
            <Button disabled={disabled} onClick={addFriend} variant='outline-success'>
                Добавить в друзья
            </Button>
        );
    else
        return (
            <Button disabled={disabled} onClick={deleteFriend} variant='outline-danger'>
                Отозвать заявку
            </Button>
        );
}

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

const OtherPlayerPage = () => {

    const api = useApi();

    // Extract username from URL parameters
    const { username: playerUsername } = useParams<{ username: string }>();

    // Status of friendship for button
    const [friendshipStatus, setFriendshipStatus] = useState<string | null>(null);

    // Add loading state
    const [loading, setLoading] = useState(true);

    // TODO сохранить на клиенте почту и никнейм, сделать константами и не запрашивать их
    const [displayName, setName] = useState<string | null>(null);
    const [description, setProfileDescription] = useState<string | null>(null);
    const [contactInfo, setContactInfo] = useState<string | null>(null);
    const [city, setCity] = useState<string>("");
    const [avatar, setAvatar] = useState<string | null>(null);
    const [age, setAge] = useState<number | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchPlayerProfile = async () => {
            setLoading(true);
            try {
                const response = await api.get(`user/${playerUsername}`);
                const data = response.data;

                setFriendshipStatus(data.friendstatus);

                data.displayName && setName(data.displayName);
                data.description && setProfileDescription(data.description);
                data.city && setCity(data.city);
                data.avatar && setAvatar("/" + data.avatar);
                if (data.age !== undefined) {
                    setAge(data.age);
                }
                if (data.contactInfo !== undefined) {
                    setContactInfo(data.contactInfo);
                }
            } catch (e) {
                if (e instanceof AxiosError && e.response && e.response.status === 404) {
                    navigate(getNotFoundRoute())
                } else {
                    alert("Не удалось загрузить данные профиля.\n" + e);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchPlayerProfile();
    }, [api, navigate, playerUsername]);

    const renderFriendButton = useCallback(() => {
        if (!playerUsername) return null;
        switch (friendshipStatus) {
            case "friends":
                return <FriendButtons playerUsername={playerUsername} />;
            case "incomingRequest":
                return <IncomingRequestButtons playerUsername={playerUsername} />;
            case "outgoingRequest":
                return <OutgoingRequestButtons playerUsername={playerUsername} />;
            case "none":
                return <NewRequestButtons playerUsername={playerUsername} />;

        }
    }, [playerUsername, friendshipStatus]);

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
        <Container className="page-container">
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
                            <span className="d-block font-weight-bold">{displayName ?? playerUsername}</span>
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
                            {(friendshipStatus === "friends" || friendshipStatus === "youprofile") ? (
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
                                    value={"Для просмотра контактов необходимо быть в друзьях у пользователя"}
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
                                    <GameItem game={x} key={x.gamename}></GameItem>
                                )
                            }}
                            gameListUrlBuilder={(len, sortBy, sortOrder) => `user/${playerUsername}/games?start=${len}&sortBy=${sortBy}&sortOrder=${sortOrder}`}
                        />
                    </Tab>
                </Tabs >
            </div >
        </Container>
    );
};
export default OtherPlayerPage;
