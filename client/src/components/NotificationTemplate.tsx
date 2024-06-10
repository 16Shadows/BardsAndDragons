import {
  QueryNotificationObjectFriendRequest,
  QueryNotificationObjectFriendRequestAccepted,
} from "../models/Notifications";
import defaultAvatarPic from "../resources/EmptyProfileAvatar_50px.png";
import "../css/Notifications.css";
import "../css/App.css";
import Button from "./Button";
import { Link, useNavigate } from "react-router-dom";
import { getFriendsPageRoute, getUserProfileRoute } from "./routes/Navigation";
import { IoMdArrowForward } from "react-icons/io";
import { PropsWithChildren } from "react";

export const NotificationTemplateFriendRequest = (props: {
  item: QueryNotificationObjectFriendRequest;
}) => {
  const navigate = useNavigate();

  return (
    <div className="row ms-1 w-100">
      <div className="d-grid col-2 col-sm-auto justify-content-center">
        <div className="row align-items-start mt-2">
          <img
            className="rounded-circle"
            alt="Ошибка загрузки аватара"
            src={
              props.item.friendRequestSentBy.avatar
                ? "/" + props.item.friendRequestSentBy.avatar
                : defaultAvatarPic
            }
          />
        </div>
      </div>
      <div className="col w-auto">
        <div>
          <p className="mt-2">
            Пользователь
            <Link
              to={getUserProfileRoute(props.item.friendRequestSentBy.username)}
              className="text-decoration-none"
            >
              {props.item.friendRequestSentBy.displayName ??
                props.item.friendRequestSentBy.username}
            </Link>
            отправил вам заявку в друзья!
          </p>
          <div className="d-flex justify-content-evenly mb-2">
            <Button
              color={"primary"}
              onClick={() => {
                navigate(getFriendsPageRoute());
              }}
            >
              Мои друзья <IoMdArrowForward />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const NotificationTemplateRequestAccepted = (props: {
  item: QueryNotificationObjectFriendRequestAccepted;
}) => {
  return (
    <div className="row ms-1 w-100">
      <div className="d-grid col-2 col-sm-auto justify-content-center">
        <div className="row align-items-start mt-2">
          <img
            className="rounded-circle"
            alt="Ошибка загрузки аватара"
            src={
              props.item.friendRequestAcceptedBy.avatar
                ? "/" + props.item.friendRequestAcceptedBy.avatar
                : defaultAvatarPic
            }
          />
        </div>
      </div>
      <div className="col w-auto">
        <div>
          <p className="mt-2">
            Пользователь
            <Link
              to={getUserProfileRoute(
                props.item.friendRequestAcceptedBy.username
              )}
              className="text-decoration-none"
            >
              {props.item.friendRequestAcceptedBy.displayName ??
                props.item.friendRequestAcceptedBy.username}
            </Link>
            принял вашу заявку в друзья
          </p>
        </div>
      </div>
    </div>
  );
};

interface Props {
  id: number;
  seen: boolean;
}
const NotificationTemplate = (props: PropsWithChildren<Props>) => {
  return (
    <div
      id={"notification_" + props.id}
      className={
        props.seen
          ? "notification-template d-flex border border-3 rounded m-2"
          : "notification-template d-flex border border-3 border-info rounded m-2"
      }
    >
      {props.children}
    </div>
  );
};

export default NotificationTemplate;
