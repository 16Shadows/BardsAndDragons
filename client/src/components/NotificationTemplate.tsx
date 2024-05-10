import { NotificationObject } from "../models/Notifications";
import avatar from "../resources/EmptyProfileAvatar_50px.png";
import "../css/Notifications.css";
import "../css/App.css";
import Button from "./Button";
import { NavLink, useNavigate } from "react-router-dom";
import TestPage from "../pages/TestPage";
import { userInfo } from "os";

const NotificationTemplate = (props: NotificationObject) => {
  const navigate = useNavigate();
  // TODO запросить аватарку отправившего увед юзера
  const profileAvatar = avatar;
  // TODO добавить к имени юзера ссылку на его профиль
  const senderName = props.displayName ? props.displayName : props.username;

  return (
    <div
      className={
        props.seen
          ? "d-flex border border-3 border-info rounded m-2"
          : "d-flex border border-3 border-ыусщтвфкн rounded m-2"
      }
    >
      <div className="row ms-1 w-100">
        <div className="d-grid col-sm-auto justify-content-center">
          <div className="row align-items-start mt-2">
            <img
              className="rounded-circle"
              alt="ProfileAvatar"
              src={profileAvatar}
            />
          </div>
        </div>
        <div className="col w-auto">
          {props.type === "friendRequest" ? (
            <div>
              <p className="mt-2">
                {/* TODO добавить ссылку на страницу профиля */}
                Пользователь{" "}
                <a href="/" className="text-decoration-none">
                  {senderName}
                </a>
                отправил вам заявку в друзья!
              </p>
              <div className="d-flex justify-content-evenly mb-2">
                {/* TODO добавить иконку стрелки */}
                <Button
                  children={"Мои друзья >>"}
                  onClick={() => {
                    navigate("/my-friends");
                    console.log("ddd");
                  }}
                ></Button>
                {/* <button
                  className="btn btn-primary"
                  onClick={() => {
                    navigate("/my-friends");
                    console.log("ddd");
                  }}
                >
                  Мои друзья
                  <FontAwesomeIcon icon="fa-solid fa-arrow-right" />
                </button> */}
              </div>
            </div>
          ) : (
            <div>
              <p className="mt-2">
                {/* TODO добавить ссылку на страницу профиля */}
                Пользователь{" "}
                <a href="/" className="text-decoration-none">
                  {senderName}
                </a>
                принял вашу заявку в друзья
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationTemplate;
