import { FormEvent, useEffect, useRef, useState } from "react";
import GameItem, { IGameProps } from "../../components/GameItem/GameItem";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import useApi from '../../http-common'
import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated'
// import useAuthUser from 'react-auth-kit/hooks/useAuthUser'
import "./SearchGamesPage.css"
// import { UserData } from "../../models/UserData";
// import Alert from "../../components/Alert";
// import Popup from "../../components/Popup";

const SearchGamesPage = () => {

    // ===Авторизация===
    // Проверка, авторизован ли пользователь
    const isAuthenticated = useIsAuthenticated()

    const gameRequestName = isAuthenticated ? 'game/subscribes' : 'game/games'

    // Имя пользователя
    // const username = useAuthUser<UserData>()?.username

    // ===Пагинация===
    // Количество запрашиваемых за раз игр
    const [requestSize, setRequestSize] = useState<number>()

    // Общее число игр, которые соответствуют текущим условиям выбора
    const totalGamesNumberRef = useRef(0)

    // Номер текущей игры, с которого начнётся выборка из БД
    const currentGameNumberRef = useRef(0)

    // ===Запрос данных из БД===
    // Индикатор, что нужно выполнить запрос игр из БД
    const [fetching, setFetching] = useState(false)

    // Строка запроса для поиска
    const [searchQuery, setSearchQuery] = useState('')

    // Передача строки для запроса данных
    const [searchQueryEvent, setSearchQueryEvent] = useState('')

    /// Список игр
    const [games, setGames] = useState<IGameProps[]>()

    // Axios API для запросов к беку
    const api = useApi();

    // ===Сортировка===
    // Список опций
    const sortTypes = new Map([["По номеру", "id"], ["По названию", "name"]])

    // Выбранная опция
    const [selectedSort, setSelectedSort] = useState(Array.from(sortTypes.keys())[0])

    // ===Функции===
    // Обработчик прокрутки страницы
    function scrollHandler(event: Event) {
        // Условие: до конца полосы прокрутки меньше 100 единиц И номер текущей игры меньше их общего количества
        if (document.documentElement.scrollHeight - document.documentElement.scrollTop - window.innerHeight < 100 && currentGameNumberRef.current < totalGamesNumberRef.current) {
            // Запрашиваем игры из БД
            setFetching(true);
        }
    }

    // Обработчик для кнопки поиска игр
    function searchGames(e: FormEvent<HTMLFormElement>) 
    {
        e.preventDefault();
        setSearchQueryEvent(searchQuery);
    }

    const [modalIsShow, setModalIsShow] = useState(false)

    // Если изменится сортировка или строка запроса - делаем запрос игр из БД
    useEffect(getTotalNumber, [searchQueryEvent, selectedSort])
    
    // Запрашиваем общее число игр из БД, а затем сами игры
    function getTotalNumber() {
        api.get('game/games-number', { params: {name: searchQueryEvent} }).then(function (response) {
            totalGamesNumberRef.current = response.data;
            console.log(totalGamesNumberRef.current);

            // Очищаем список и обнуляем счётчик
            setGames(undefined);
            currentGameNumberRef.current = 0;

            // Если игры нашлись, то делаем запрос
            if (response.data > 0) {
                setFetching(true);
            }
            else {
                // Для анимации
                setTimeout(() => setGames([]), 750);
            }
        }).catch(() => alert('Не удалось получить список игр'))
    }

    // Подписка на игру
    function subscribe(gameId: number) {
        api.post(`game/${gameId}/subscribe`, {headers: {
            'Content-Type': 'application/json'
        }}).then(function (response) {
            console.log("Subscribed");
            //console.log(response.data);
        })
    }

    // Отписка от игры
    function unsubscribe(gameId: number) {
        api.post(`game/${gameId}/unsubscribe`, {headers: {
            'Content-Type': 'application/json'
        }}).then(function (response) {
            console.log("Unsubscribed");
            //console.log(response.data);
        })
    }

    // Выполняется при первой загрузке страницы
    useEffect(() => {
        // Добавляем слушатель для прокрутки
        document.addEventListener("scroll", scrollHandler);

        // Устанавливаем количество игр для одного запроса
        setRequestSize(Math.round(document.documentElement.clientHeight / 100));
        //console.log(`requestSize: ${requestSize}`);

        // Запрашиваем игры из БД
        setFetching(true);

        return function() {
            document.removeEventListener("scroll", scrollHandler);
        }
    }, [])

    // Выполняется при изменении состояния индикатора fetching
    useEffect(() => {
        if (fetching) {
            //console.log("fetching games");
            //console.log(`Current: ${currentGameNumberRef.current}`);

            // Запрашиваем игры, передаём лимит, стартовую позицию, искомое имя, id пользователя и тип сортировки
            api.get(gameRequestName, { params: {limit: requestSize, start: currentGameNumberRef.current, name: searchQueryEvent, sort: sortTypes.get(selectedSort)} }).then(function (response) {
                if (!games) {
                    //setGames((response.data as IGameProps[]).sort((a, b) => a["id"] - b["id"]));
                    setGames(response.data);
                }
                else {
                    setGames([...games, ...response.data]);
                }
                
                // Увеличиваем текущую позицию
                currentGameNumberRef.current += requestSize ?? 0;
            }).catch(() => alert('Не удалось получить список игр')).finally(() => setFetching(false))
        }
    }, [fetching])

    // Основной компонент
    return (
        <Row className="gx-5">
            {/* Поиск и сортировка */}
            <Col md="6">
                <div id="search-box" className="static-item">
                    <Form onSubmit={searchGames}>
                        {/* Поиск по названию */}
                        <div style={{fontSize: "24px"}}><b>Название</b></div>
                        <input style={{width: "100%"}} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />

                        <div style={{marginTop: "15px", textAlign: "center"}}>
                            {/* Сортировка */}
                            <span style={{width: "48%", display: "inline-block", verticalAlign: "middle"}}>
                                <span style={{fontWeight: "bolder", fontSize: "20px"}}>Сортировка:</span>
                                <select id="select-list" value={selectedSort} onChange={event => setSelectedSort(event.target.value)}>
                                    <option disabled value={""}>Сортировка</option>
                                    {Array.from(sortTypes.keys()).map((option) =>
                                        <option key={option}>{option}</option>
                                    )}
                                </select>      
                            </span>
                            
                            {/* Кнопка поиска */}
                            <span id="search-button-block">                   
                                <Button type="submit" id="search-button">Поиск</Button>
                            </span>  
                        </div>
                    </Form>
                </div>
            </Col>
            {/* Список игр */}
            <Col md="6">
                <h2 id="game-header">Игры</h2>
                <div id="game-box">
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
            <Modal show={modalIsShow} onHide={() => setModalIsShow(false)}>
                <Modal.Header closeButton>
                    <Modal.Title style={{ color: "red" }}>{"Произошла ошибка"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>{"Сообщение"}</Modal.Body>
            </Modal>
        </Row>
    );
};

export default SearchGamesPage;
