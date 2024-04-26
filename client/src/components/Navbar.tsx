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
                <a className="nav-link" aria-current="page" href="#">
                  Главная
                </a>
              </li>

              <li className="nav-item">
                <a className="nav-link" href="#">
                  Поиск игроков
                </a>
              </li>

              <li className="nav-item">
                <a className="nav-link" href="#">
                  Поиск игр
                </a>
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
                  href="#"
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
                  href="#"
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
                    <a className="dropdown-item" href="#">
                      Мои игры
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">
                      Мои друзья
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">
                      Профиль
                    </a>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">
                      Выйти
                    </a>
                  </li>
                </ul>
              </li>
            </div>
          ) : (
            // Кнопки входа/регистрации, если пользователь не вошел в аккаунт
            <div className="nav-item login_reg_bundle ms-auto">
              <button type="button" className="btn btn-primary me-2">
                Вход
              </button>
              <button type="button" className="btn btn-outline-primary">
                Регистрация
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
