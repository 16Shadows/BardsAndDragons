import {Link, useNavigate} from "react-router-dom";
import logo from "../resources/bdlogo_mini.png";
import avatar from "../resources/EmptyProfileAvatar_50px.png";
import notificationPic from "../resources/notification_50px.png";
import notificationRedPic from "../resources/notification_red_50px.png";
import NotificationsPanel from "./NotificationsPanel";
import {useState, useEffect} from "react";

const Navbar = () => {
    // TODO Добавить запрос, вошел ли пользователь в профиль или нет
    const [loggedOn, setLoggedOn] = useState(false);
    // TODO Добавить запрос на данные профиля
    const [profileName, setProfileName] = useState("Тестовое имя профиля");
    const [profileAvatar, setProfileAvatar] = useState(avatar);
    // TODO Добавить запрос на наличие уведомлений
    const [gotNotifications, setGotNotifications] = useState(false);

    const navigate = useNavigate();

    // Для запроса уведомлений при рендере навбара
    useEffect(
        () => {
            console.log("Надо сделать запрос к уведомлениям, прочитанным и новым");
        }
        //[] // Запуск только после первого рендера страницы/объекта navbar
    );

    return (
        <nav className="navbar navbar-expand-lg bg-body-tertiary bg-white">
            <div className="container-fluid">
                <img src={logo} className="BD-logo" alt="bdlogo"/>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarSupportedContent"
                    aria-controls="navbarSupportedContent"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div
                    className="links collapse navbar-collapse"
                    id="navbarSupportedContent"
                >
                    <div>
                        <ul className="navbar-nav mb-2 mb-lg-0">
                            <li className="nav-item">
                                <Link className="nav-link" aria-current="page" to="/">
                                    Главная
                                </Link>
                            </li>

                            <li className="nav-item">
                                <Link className="nav-link" to="/players">
                                    Поиск игроков
                                </Link>
                            </li>

                            <li className="nav-item">
                                <Link className="nav-link" to="/games">
                                    Поиск игр
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Я думаю это не MVP */}
                    {/* <ul className="navbar-nav">
            <li className="nav-item search">
              <form className="d-flex" role="search">
                <input
                  className="form-control me-2"
                  type="search"
                  placeholder="Поиск"
                  aria-label="Search"
                />
                <button className="btn btn-outline-success" type="submit">
                  Поиск
                </button>
              </form>
            </li>
          </ul> */}

                    {loggedOn ? (
                        // Кнопка профиля, если пользователь вошел в аккаунт
                        <div className="navbar-nav  ms-auto">
                            <li className="nav-item dropdown">
                                <a
                                    className="nav-link dropdown-toggle"
                                    // TODO При открытии меню вызываем фетч данных об уведомлениях
                                    onClick={() => console.log("Открыли уведомления")}
                                    role="button"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    {/* Изменение иконки уведомлений в зависимости от состояния gotNotifications */}
                                    {gotNotifications ? (
                                        <img
                                            className="rounded-circle me-2"
                                            alt="Notifications"
                                            src={notificationRedPic}
                                        />
                                    ) : (
                                        <img
                                            className="rounded-circle me-2"
                                            alt="Notifications"
                                            src={notificationPic}
                                        />
                                    )}
                                </a>
                                <ul className="dropdown-menu notifications_panel">
                                    <NotificationsPanel/>
                                </ul>
                            </li>

                            <li className="nav-item dropdown">
                                <a
                                    className="nav-link dropdown-toggle"
                                    role="button"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    <img
                                        className="rounded-circle me-2"
                                        alt="ProfileAvatar"
                                        src={profileAvatar}
                                    />
                                    {profileName}
                                </a>
                                <ul className="dropdown-menu">
                                    <li>
                                        <Link className="dropdown-item" to="/my-games">
                                            Мои игры
                                        </Link>
                                    </li>
                                    <li>
                                        <Link className="dropdown-item" to="/my-friends">
                                            Мои друзья
                                        </Link>
                                    </li>
                                    <li>
                                        <Link className="dropdown-item" to="/my-profile">
                                            Профиль
                                        </Link>
                                    </li>
                                    <li>
                                        <hr className="dropdown-divider"/>
                                    </li>
                                    <li>
                                        {/* TODO сделать выход из логина при переходе на главную страницу */}
                                        <Link className="dropdown-item" to="/">
                                            Выйти
                                        </Link>
                                    </li>
                                </ul>
                            </li>
                        </div>
                    ) : (
                        // Кнопки входа/регистрации, если пользователь не вошел в аккаунт
                        <div className="nav-item login_reg_bundle ms-auto">
                            <button type="button" onClick={() => navigate('/login')}
                                    className="btn btn-primary me-2">Вход
                            </button>
                            <button type="button" onClick={() => navigate('/register')}
                                    className="btn btn-outline-primary">Регистрация
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
