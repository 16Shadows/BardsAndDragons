import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import GameItem, { IGameProps } from "../../components/GameItem/GameItem";
import { Button, Col, Form, Row } from "react-bootstrap";
import useApi from '../../http-common'
import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated'
import "./SearchGamesPage.css"
import ModalWindowAlertError from "../../components/ModalWindowAlert/ModalWindowAlertError";

const SearchGamesPage = () => {
    // ===Авторизация===
    // Проверка, авторизован ли пользователь
    const isAuthenticated = useIsAuthenticated()

    // Определение запроса в зависимости от статуса авторизации
    const gameRequestName = isAuthenticated ? 'games/games-with-subscription' : 'games/games'

    // ===Пагинация===
    // Количество запрашиваемых за раз игр
    const requestSize = useMemo(() => 5 + Math.round(document.documentElement.clientHeight / 200), [])

    // Общее число игр, которые соответствуют текущим условиям выбора
    const totalGamesNumber = useRef<number>(0)

    // Номер текущей игры, с которого начнётся выборка из БД
    const currentGameNumber = useRef<number>(0)

    // Номер текущего запроса, с которого начнётся выборка из БД
    const currentRequestVersion = useRef<number>(0)
    
    // Номер текущего запроса, с которого начнётся запрос количества игр
    const currentRequestNumberVersion = useRef<number>(0)

    // ===Запрос данных из БД===
    // Индикатор, что выполяется запрос игр из БД
    const fetching = useRef(false)

    // Строка запроса для поиска
    const [searchQuery, setSearchQuery] = useState('')

    // Передача строки для запроса данных
    const [searchQueryEvent, setSearchQueryEvent] = useState('')

    /// Список игр
    const [games, setGames] = useState<IGameProps[]>()

    // Axios API для запросов к беку
    const api = useApi();

    // ===Модальное окно===
    // Таймер закрытия окна
    const modalTimeoutHandler = useRef<NodeJS.Timeout>()

    // Сообщение об ошибке
    const [modalMessage, setModalMessage ] = useState("Сообщение")

    // Состояние модального окна скрыто/открыто
    const modalIsShow = useRef<boolean>(false)

    // ===Сортировка===
    // Список опций
    const sortTypes = useMemo(() => new Map([["По номеру", "id"], ["По названию", "name"]]), [])

    // Выбранная опция
    const [selectedSort, setSelectedSort] = useState(Array.from(sortTypes.keys())[0])

    // ===Функции===
    // Обработчик для кнопки поиска игр
    const searchGames = useCallback((e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSearchQueryEvent(searchQuery);
    }, [searchQuery])

    // Получение игр из БД
    const getGames = useCallback(() => {
        // Проверяем окончание данных в БД
        if (currentGameNumber.current >= totalGamesNumber.current && totalGamesNumber.current != 0)
            return;

        // Указываем, что выполняем новый запрос
        currentRequestVersion.current += 1;
        let currentVersion = currentRequestVersion.current;
        
        if (!fetching.current)
            fetching.current = true;

        if (totalGamesNumber.current == 0) {
            // Для анимации
            setTimeout(() => {
                // Проверяем, что этот запрос ещё актуален
                if (currentVersion != currentRequestVersion.current)
                    return;

                setGames([]);
                
                if (fetching.current)
                    fetching.current = false;
            }, 750);
            return;
        }

        // Запрашиваем игры, передаём лимит, стартовую позицию, искомое имя, id пользователя и тип сортировки
        api.get(gameRequestName, { params: { limit: requestSize, start: currentGameNumber.current, name: searchQueryEvent, sort: sortTypes.get(selectedSort) } }).then(function (response) {
            // Проверяем, что этот запрос ещё актуален
            if (currentVersion != currentRequestVersion.current)
                return;
            
            setGames(gms => {
                if (!gms) {
                    return response.data;
                }
                else {
                    return gms.concat(response.data);
                }
            })

            // Увеличиваем текущую позицию
            currentGameNumber.current += requestSize;
        }).catch(() => {
            if (!modalIsShow.current)
                showModal("Не удалось получить список игр");
            setGames([]);
        }).finally(() => {
            if (fetching.current)
                fetching.current = false;
        })
    }, [requestSize, searchQueryEvent, selectedSort, api])

    // Если изменятся сортировка или строка запроса - делаем запрос игр из БД
    useEffect(() => {
        // Указываем, что выполняем новый запрос
        currentRequestNumberVersion.current += 1;
        let currentVersion = currentRequestNumberVersion.current;

        // Запрашиваем общее число игр из БД
        api.get('games/games-number', { params: {name: searchQueryEvent} }).then(function (response) {
            // Проверяем, что этот запрос ещё актуален
            if (currentVersion != currentRequestNumberVersion.current)
                return;
            totalGamesNumber.current = response.data;

            // Очищаем список и обнуляем счётчик
            setGames(undefined);
            currentGameNumber.current = 0;

            // Делаем запрос игр
            getGames();
        }).catch(() => {
            if (!modalIsShow.current)
                showModal("Не удалось получить список игр");
            setGames([]);
        })
    }, [requestSize, searchQueryEvent, selectedSort, api])

    // Подписка на игру
    const subscribe = useCallback(async (gameId: number): Promise<boolean | undefined> => {
        let result;
        await api.post(`games/${gameId}/subscribe`).then(function (response) {
            result = true;
        }).catch((error) => {
            showModal(error.response?.data?.message || "Не удалось подписаться на игру");
            result = false;
        });
        return result;
    }, [])

    // Отписка от игры
    const unsubscribe = useCallback(async (gameId: number): Promise<boolean | undefined> => {
        let result;
        await api.post(`games/${gameId}/unsubscribe`).then(function (response) {
            result = true;
        }).catch((error) => {
            showModal(error.response?.data?.message || "Игра не найдена");
            result = false;
        })
        return result;
    }, [])

    // Закрыть модальное окно
    const hideModal = useCallback(() => {
        if (modalIsShow.current) {
            clearTimeout(modalTimeoutHandler.current);
            modalIsShow.current = false;
        }
    }, [])

    // Открыть модальное окно с сообщением
    const showModal = useCallback((message: string, timeout = 5000) => {
        setModalMessage(message);
        modalIsShow.current = true;
        modalTimeoutHandler.current = setTimeout(hideModal, timeout);
    }, [hideModal])

    // Выполняется при изменении обработчика
    useEffect(() => {
        // Обработчик прокрутки страницы
        function scrollHandler(event: Event) {
            console.log(document.documentElement.scrollHeight)
            console.log(document.documentElement.scrollTop)
            console.log(window.innerHeight)
            console.log("===")
            if (!fetching.current) {
                // Условие: до конца полосы прокрутки меньше 100 единиц
                if (document.documentElement.scrollHeight - document.documentElement.scrollTop - window.innerHeight < 100) {
                    // Запрашиваем игры из БД
                    getGames();
                }
            }
        }

        // Добавляем слушатель для прокрутки
        document.addEventListener("scroll", scrollHandler);
        return function() {
            console.log("quit");
            document.removeEventListener("scroll", scrollHandler);
        }
    }, [getGames])

    // Основной компонент
    return (
        <Row className="gx-5">
            {/* Поиск и сортировка */}
            <Col md="6">
                <div id="search-search-box" className="static-item">
                    <Form onSubmit={searchGames}>
                        {/* Поиск по названию */}
                        <div style={{ fontSize: "24px" }}><b>Название</b></div>
                        <input style={{ width: "100%" }} value={searchQuery} onChange={e => setSearchQuery(e.currentTarget.value)} />

                        <div style={{ marginTop: "15px", textAlign: "center" }}>
                            {/* Сортировка */}
                            <span id="search-sort-component">
                                <span style={{ fontWeight: "bolder", fontSize: "20px" }}>Сортировка:</span>
                                <select id="search-select-list" value={selectedSort} onChange={event => {setSelectedSort(event.currentTarget.value)}}>
                                    <option disabled value={""}>Сортировка</option>
                                    {Array.from(sortTypes.keys()).map((option) =>
                                        <option key={option}>{option}</option>
                                    )}
                                </select>
                            </span>

                            {/* Кнопка поиска */}
                            <span id="search-search-button-block">
                                <Button type="submit" id="search-search-button">Поиск</Button>
                            </span>
                        </div>
                    </Form>
                </div>
            </Col>
            {/* Список игр */}
            <Col md="6">
                <h2 id="search-game-header">Игры</h2>
                <div id="search-game-box">
                    {
                        // Если games = undefined, то "Игры загружаются..."
                        games
                            ?
                            // Если не undefined, но список пуст, то "Игр не найдено"
                            games.length > 0
                                ?
                                <div>
                                    {games.map((game) => 
                                        <GameItem game={game} subscribe={subscribe} unsubscribe={unsubscribe} logined={isAuthenticated} key={game.id}></GameItem>
                                    )}
                                </div>
                                :
                                <div>
                                    <h2> Игр не найдено </h2>
                                </div>
                            : <h2> Игры загружаются... </h2>
                    }
                </div>
            </Col>
            {/* Отображение ошибок */}
            <ModalWindowAlertError show={modalIsShow.current} onHide={hideModal} message={modalMessage} />
        </Row>
    );
};

export default SearchGamesPage;
