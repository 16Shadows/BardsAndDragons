import { Link } from "react-router-dom";
import bdlogo from "../resources/bdlogo_mini.png";
import avatarpic from "../resources/EmptyProfileAvatar_50px.png";
import notificationPic from "../resources/notification_50px.png";
import notificationRedPic from "../resources/notification_red_50px.png";
import NotificationsPanel from "./NotificationsPanel";
import { useState, useEffect } from "react";

const Navbar = () => {
  // TODO Добавить запрос, вошел ли пользователь в профиль или нет
  const [loggedOn, setLoggedOn] = useState(true);
  // TODO Добавить запрос на данные профиля
  const [profileName, setProfileName] = useState("Тестовое имя профиля");
  const [profileAvatar, setProfileAvatar] = useState(avatarpic);
  // TODO Добавить запрос на наличие уведомлений
  const [gotNotifications, setGotNotifications] = useState(false);

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
        <img src={bdlogo} className="BD-logo" alt="bdlogo" />

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
                <Link className="nav-link" to="/splayers">
                  Поиск игроков
                </Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link" to="/sgames">
                  Поиск игр
                </Link>
              </li>
            </ul>
          </div>
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
                  <NotificationsPanel />
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
                    <Link className="dropdown-item" to="/myprofile">
                      Профиль
                    </Link>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/mygames">
                      Мои игры
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/myfriends">
                      Мои друзья
                    </Link>
                  </li>

                  <li>
                    <hr className="dropdown-divider" />
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
              <button type="button" className="btn btn-primary me-2">
                {/* TODO страница входа */}
                <Link to="/login">Вход</Link>
              </button>
              <button type="button" className="btn btn-outline-primary">
                {/* TODO страница входа */}
                <Link to="/register">Регистрация</Link>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
