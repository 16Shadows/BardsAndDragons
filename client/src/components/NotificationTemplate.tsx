import { NotificationObject } from "../models/Notifications";
import defaultAvatarPic from "../resources/EmptyProfileAvatar_50px.png";
import "../css/Notifications.css";
import "../css/App.css";
import Button from "./Button";
import { useNavigate } from "react-router-dom";
import { getUserProfileRoute } from "./routes/Navigation";

const NotificationTemplate = (props: NotificationObject) => {
  const navigate = useNavigate();
  const senderName = props.displayName ? props.displayName : props.username;

  return (
    <div
      id={"notification_" + props.id}
      className={
        props.seen
          ? "notification-template d-flex border border-3 rounded m-2"
          : "notification-template d-flex border border-3 border-info rounded m-2"
      }
    >
      <div className="row ms-1 w-100">
        <div className="d-grid col-2 col-sm-auto justify-content-center">
          <div className="row align-items-start mt-2">
            <img
              className="rounded-circle"
              alt="ProfileAvatar"
              src={props.avatar ? "/" + props.avatar : defaultAvatarPic}
            />
          </div>
        </div>
        <div className="col w-auto">
          {props.type === "friendRequest" ? (
            <div>
              <p className="mt-2">
                {/* TODO добавить ссылку на страницу профиля */}
                Пользователь
                <a href="/" className="text-decoration-none">
                  {senderName}
                </a>
                отправил вам заявку в друзья!
              </p>
              <div className="d-flex justify-content-evenly mb-2">
                <Button
                  children={"Мои друзья >>"}
                  onClick={() => {
                    navigate("/my-friends");
                    console.log("ddd");
                  }}
                ></Button>
              </div>
            </div>
          ) : (
            <div>
              <p className="mt-2">
                Пользователь
                <a
                  href={getUserProfileRoute(props.username)}
                  className="text-decoration-none"
                >
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
