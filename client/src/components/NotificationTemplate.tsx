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
    <div className="d-flex p-2">
      <img
            className="rounded-circle navbar-image me-2"
            alt="Ошибка загрузки аватара"
            src={
              props.item.friendRequestSentBy.avatar
                ? "/" + props.item.friendRequestSentBy.avatar
                : defaultAvatarPic
            }
          />
      <span className="text-wrap">
      Пользователь
            <Link
              to={getUserProfileRoute(props.item.friendRequestSentBy.username)}
              className="text-decoration-none"
            >
              {props.item.friendRequestSentBy.displayName ??
                props.item.friendRequestSentBy.username}
            </Link>
            отправил вам заявку в друзья!
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
      </span>
    </div>
  )
};

export const NotificationTemplateRequestAccepted = (props: {
  item: QueryNotificationObjectFriendRequestAccepted;
}) => {
  return (
    <div className="d-flex p-2">
      <img
        className="rounded-circle navbar-image me-2"
        alt="Ошибка загрузки аватара"
        src={
          props.item.friendRequestAcceptedBy.avatar
            ? "/" + props.item.friendRequestAcceptedBy.avatar
            : defaultAvatarPic
        }
      />
      <span className="text-wrap">
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
      </span>
    </div>
  )
};

interface Props {
  seen: boolean;
}
const NotificationTemplate = (props: PropsWithChildren<Props>) => {
  return (
    <div
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
