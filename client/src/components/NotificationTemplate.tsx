import { NotificationObject } from "../models/Notifications";
import defaultAvatarPic from "../resources/EmptyProfileAvatar_50px.png";
import "../css/Notifications.css";
import "../css/App.css";
import Button from "./Button";
import { useNavigate } from "react-router-dom";
import { getFriendsPageRoute, getUserProfileRoute } from "./routes/Navigation";

const NotificationTemplateFriendRequest = (props: {
  username: string;
  displayName: string | null;
}) => {
  const navigate = useNavigate();

  return (
    <div>
      <p className="mt-2">
        Пользователь
        <a
          href={getUserProfileRoute(props.username)}
          className="text-decoration-none"
        >
          {props.displayName ?? props.username}
        </a>
        отправил вам заявку в друзья!
      </p>
      <div className="d-flex justify-content-evenly mb-2">
        <Button
          color={"primary"}
          children={"Мои друзья >>"}
          onClick={() => {
            navigate(getFriendsPageRoute());
          }}
        ></Button>
      </div>
    </div>
  );
};
const NotificationTemplateRequestAccepted = (props: {
  username: string;
  displayName: string | null;
}) => {
  return (
    <div>
      <p className="mt-2">
        Пользователь
        <a
          href={getUserProfileRoute(props.username)}
          className="text-decoration-none"
        >
          {props.displayName ?? props.username}
        </a>
        принял вашу заявку в друзья
      </p>
    </div>
  );
};

const NotificationTemplate = (props: NotificationObject) => {
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
              alt="Ошибка загрузка аватара"
              src={props.avatar ? "/" + props.avatar : defaultAvatarPic}
            />
          </div>
        </div>
        <div className="col w-auto">
          {props.type === "friendRequest" ? (
            <NotificationTemplateFriendRequest
              username={props.username}
              displayName={props.displayName}
            />
          ) : (
            <NotificationTemplateRequestAccepted
              username={props.username}
              displayName={props.displayName}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationTemplate;
