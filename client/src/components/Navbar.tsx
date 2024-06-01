import { Link, NavLink, useNavigate } from "react-router-dom";
import logo from "../resources/bdlogo_mini.png";
import avatar from "../resources/EmptyProfileAvatar_50px.png";
import notificationPic from "../resources/notification_50px.png";
import notificationRedPic from "../resources/notification_red_50px.png";
import NotificationsPanel from "./NotificationsPanel";
import { useState, useEffect } from "react";
import useIsAuthenticated from "react-auth-kit/hooks/useIsAuthenticated";
import useSignOut from "../utils/useSignOut";
import useApi from "../http-common";
import { FaUserFriends } from "react-icons/fa";
import { IoDice } from "react-icons/io5";
import { LuLogOut } from "react-icons/lu";
import { FaDice } from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";
import { LuDices } from "react-icons/lu";
import { IoSettingsOutline } from "react-icons/io5";
import { LuUsers2 } from "react-icons/lu";

const Navbar = () => {
  // Запрос, вошел ли пользователь в профиль или нет
  const isAuthenticated = useIsAuthenticated();

  // TODO Добавить запрос на данные профиля
  const [profileName, setProfileName] = useState("Тестовое имя профиля");

  const [profileAvatar, setProfileAvatar] = useState(avatar);
  // TODO Добавить запрос на наличие уведомлений
  const [gotNotifications, setGotNotifications] = useState(false);

  const navigate = useNavigate();

  const { signOut } = useSignOut();

  const api = useApi();
  const iconSize = 20;

  const getProfileInfoQuery = async () => {
    // GET запрос списка городов к серверу
    api
      .get("user/@current", {})
      .then((response) => {
        console.log(response.data);
        // TODO заменить на хранение на клиенте, не запрашивать
        if (response.data.displayName)
          setProfileName(response.data.displayName);
        else setProfileName(response.data.username);

        // TODO обработка установки картинки
        // response.data.avatar && set...
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(
    () => {
      if (isAuthenticated) getProfileInfoQuery();
    },
    [] // Запуск только после первого рендера страницы/объекта navbar
  );

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary bg-white mb-4">
      <div className="container-fluid">
        <img src={logo} className="BD-logo" alt="logo" />

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
                <NavLink
                  // data-bs-toggle="collapse"
                  // data-bs-target=".navbar-collapse.show"
                  className="nav-link"
                  aria-current="page"
                  to="/"
                >
                  <span
                    data-bs-toggle="collapse"
                    data-bs-target=".navbar-collapse.show"
                  >
                    Главная
                  </span>
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink className="nav-link" to="/players">
                  <span
                    data-bs-toggle="collapse"
                    data-bs-target=".navbar-collapse.show"
                  >
                    Поиск игроков
                  </span>
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink className="nav-link" to="/games">
                  <span
                    data-bs-toggle="collapse"
                    data-bs-target=".navbar-collapse.show"
                  >
                    Поиск игр
                  </span>
                </NavLink>
              </li>
            </ul>
          </div>

          {isAuthenticated ? (
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
                    <NavLink className="dropdown-item" to="/my-profile">
                      <span
                        data-bs-toggle="collapse"
                        data-bs-target=".navbar-collapse.show"
                      >
                        <IoMdSettings size={iconSize} />
                        Профиль
                      </span>
                    </NavLink>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <NavLink className="dropdown-item" to="/my-games">
                      <span
                        data-bs-toggle="collapse"
                        data-bs-target=".navbar-collapse.show"
                      >
                        <IoDice size={iconSize} />
                        Мои игры
                      </span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink className="dropdown-item" to="/my-friends">
                      <span
                        data-bs-toggle="collapse"
                        data-bs-target=".navbar-collapse.show"
                      >
                        <FaUserFriends size={iconSize} />
                        Мои друзья
                      </span>
                    </NavLink>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    {/* Выход из аккаунта с переходом на главную страницу */}
                    <Link
                      className="dropdown-item"
                      onClick={() => signOut()}
                      to="#"
                    >
                      <span
                        data-bs-toggle="collapse"
                        data-bs-target=".navbar-collapse.show"
                      >
                        <LuLogOut size={iconSize} /> Выйти
                      </span>
                    </Link>
                  </li>
                </ul>
              </li>
            </div>
          ) : (
            // Кнопки входа/регистрации, если пользователь не вошел в аккаунт
            <div className="nav-item login_reg_bundle ms-auto">
              <button
                data-bs-toggle="collapse"
                data-bs-target=".navbar-collapse.show"
                type="button"
                onClick={() => navigate("/login")}
                className="btn btn-primary me-2"
              >
                Вход
              </button>
              <button
                data-bs-toggle="collapse"
                data-bs-target=".navbar-collapse.show"
                type="button"
                onClick={() => navigate("/register")}
                className="btn btn-outline-primary"
              >
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
