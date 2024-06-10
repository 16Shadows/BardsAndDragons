import { Link, NavLink, useNavigate } from "react-router-dom";
import logo from "../resources/bdlogo_mini.png";
import avatar from "../resources/EmptyProfileAvatar_50px.png";
import NotificationsPanel from "./NotificationsPanel";
import { useState, useEffect, useCallback } from "react";
import useIsAuthenticated from "react-auth-kit/hooks/useIsAuthenticated";
import useSignOut from "../utils/useSignOut";
import useApi from "../http-common";
import "../css/Notifications.css";
import { FaUserFriends } from "react-icons/fa";
import { IoDice } from "react-icons/io5";
import { LuLogOut } from "react-icons/lu";
import { IoMdSettings } from "react-icons/io";

const iconSize = 20;

const Navbar = () => {
  // Запрос, вошел пользователь в профиль или нет
  const isAuthenticated = useIsAuthenticated();
  // TODO добавить обновление навбара после изменения, добавлено в feat-notifications
  const [profileName, setProfileName] = useState("");
  const [profileAvatar, setProfileAvatar] = useState(avatar);
  const [isOpenCollapseState, setIsOpenCollapseState] = useState(false);

  const navigate = useNavigate();
  const api = useApi();

  const signOut = useSignOut(
    useCallback(async () => {
      try {
        await api.post("user/logout", {});
        return true;
      } catch (e) {
        alert(e);
        return false;
      }
    }, [api])
  );

  useEffect(() => {
    async function getProfileInfoQuery() {
      try {
        const response = await api.get("user/@current", {});

        // TODO заменить на хранение на клиенте, не запрашивать
        setProfileName(response.data.displayName ?? response.data.username);
        if (response.data.avatar) {
          setProfileAvatar("/" + response.data.avatar);
        }
      } catch (e) {
        alert("Не удалось загрузить информацию профиля.\n" + e);
      }
    }

    if (isAuthenticated) {
      getProfileInfoQuery();
    }
  }, [api, isAuthenticated]);

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary bg-white mb-4">
      <div className="container-fluid">
        <img src={logo} className="BD-logo" alt="logo" />

        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setIsOpenCollapseState(!isOpenCollapseState)}
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div
          className={
            isOpenCollapseState
              ? "links collapse navbar-collapse show"
              : "links collapse navbar-collapse"
          }
          id="navbarSupportedContent"
        >
          <div>
            <ul className="navbar-nav mb-2 mb-lg-0">
              <li className="nav-item">
                <NavLink
                  className="nav-link"
                  aria-current="page"
                  to="/"
                  onClick={() => setIsOpenCollapseState(false)}
                >
                  Главная
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink
                  className="nav-link"
                  to="/players"
                  onClick={() => setIsOpenCollapseState(false)}
                >
                  Поиск игроков
                </NavLink>{" "}
              </li>

              <li className="nav-item">
                <NavLink
                  className="nav-link"
                  to="/games"
                  onClick={() => setIsOpenCollapseState(false)}
                >
                  Поиск игр
                </NavLink>
              </li>
            </ul>
          </div>

          {isAuthenticated ? (
            // Кнопка профиля, если пользователь вошел в аккаунт
            <div className="navbar-nav  ms-auto">
              <li className="nav-item dropdown">
                <NotificationsPanel />
              </li>

              <li className="nav-item dropdown">
                <div
                  className="nav-link dropdown-toggle"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <img
                    className="rounded-circle me-2 navbar-image"
                    alt="Ошибка загрузки аватара"
                    src={profileAvatar}
                  />
                  {profileName}
                </div>

                <ul className="dropdown-menu">
                  <li>
                    <NavLink
                      className="dropdown-item"
                      to="/my-profile"
                      onClick={() => setIsOpenCollapseState(false)}
                    >
                      <IoMdSettings size={iconSize} />
                      Профиль
                    </NavLink>{" "}
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <NavLink
                      className="dropdown-item"
                      to="/my-games"
                      onClick={() => setIsOpenCollapseState(false)}
                    >
                      <IoDice size={iconSize} />
                      Мои игры
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      className="dropdown-item"
                      to="/my-friends"
                      onClick={() => setIsOpenCollapseState(false)}
                    >
                      <FaUserFriends size={iconSize} />
                      Мои друзья
                    </NavLink>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    {/* Выход из аккаунта с переходом на главную страницу */}
                    <Link
                      className="dropdown-item"
                      onClick={() => {
                        signOut();
                        setIsOpenCollapseState(false);
                      }}
                      to="#"
                    >
                      <LuLogOut size={iconSize} /> Выйти
                    </Link>{" "}
                  </li>
                </ul>
              </li>
            </div>
          ) : (
            // Кнопки входа/регистрации, если пользователь не вошел в аккаунт
            <div className="nav-item login_reg_bundle ms-auto">
              <button
                type="button"
                onClick={() => {
                  navigate("/login");
                  setIsOpenCollapseState(false);
                }}
                className="btn btn-primary me-2"
              >
                Вход
              </button>
              <button
                type="button"
                onClick={() => {
                  navigate("/register");
                  setIsOpenCollapseState(false);
                }}
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
