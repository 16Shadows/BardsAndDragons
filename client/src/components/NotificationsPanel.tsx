import { useEffect, useState } from "react";
import useApi from "../http-common";
import NotificationTemplate from "./NotificationTemplate";
import notificationPic from "../resources/notification_50px.png";
import notificationRedPic from "../resources/notification_red_50px.png";
import {
  NotificationObject,
  QueryNotificationObject,
} from "../models/Notifications";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import { fetchEventSource } from "@microsoft/fetch-event-source";

const NotificationsPanel = () => {
  const api = useApi();

  const authHeader = useAuthHeader();

  // Подписка на уведомления от сервера, новые уведомления пользователю
  if (authHeader) {
    fetchEventSource("api/v1/notifications/subscribe", {
      onmessage(event) {
        setGotNotifications(true);
      },
      headers: { Authorization: authHeader },
    });
  }

  // Список уведомлений, каждое из которых нужно отрендерить через map
  const [notifications, setNotifications] = useState<NotificationObject[]>([]);
  const [gotNotifications, setGotNotifications] = useState(false);

  const getNotificationsQuery = async () => {
    // GET запрос списка городов к серверу
    api
      // TODO - добавить запрос только части уведомлений, например 10 штук, кнопку "загрузить еще"
      .get("notifications", {})
      .then(async (response) => {
        let gotNotif = false;
        const items = response.data;

        const resPromise = items.map((item: QueryNotificationObject) => {
          const resultItem: NotificationObject = {
            id: item.id,
            type: item.type,
            seen: item.seen,
            displayName: null,
            username: null,
          };

          if (resultItem.type === "friendRequest") {
            resultItem.username = item.friendRequestSentBy
              ? item.friendRequestSentBy.username
              : null;
            resultItem.displayName = item.friendRequestSentBy
              ? item.friendRequestSentBy.displayName
              : null;
          } else if (resultItem.type === "friendRequestAccepted") {
            resultItem.username = item.friendRequestAcceptedBy
              ? item.friendRequestAcceptedBy.username
              : null;
            resultItem.displayName = item.friendRequestAcceptedBy
              ? item.friendRequestAcceptedBy.displayName
              : null;
          }

          if (!gotNotif && resultItem.seen === false) gotNotif = true;

          return resultItem;
        });
        const res = await Promise.all(resPromise);

        setNotifications(res);
        setGotNotifications(gotNotif);
      })
      .catch((error) => {
        console.error(error);
      });
  };
  const sendTestSourceEvent = async () => {
    // GET запрос списка городов к серверу
    api
      // TODO - добавить запрос только части уведомлений, например 10 штук, кнопку "загрузить еще"
      .get("testSourceEvent", {})
      .then(async (response) => {
        console.log(response);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  // Тестовый запрос для проверки EventSource
  const sendTestSourceEvent = async () => {
    // GET запрос списка городов к серверу
    api
      .get("notifications/testSourceEvent", {})
      .then(async (response) => {
        console.log("Тестовая отправка уведомления от сервиса", response);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(
    () => {
      getNotificationsQuery();
      sendTestSourceEvent();
    },
    [] // Запуск только после первого рендера
  );

  return (
    <div>
      <script src="/eventsource-polyfill.js"></script>
      <a
        className="nav-link dropdown-toggle "
        // TODO при прочитывании уведов добавить запрос в бд - прочитаны
        onClick={() => setGotNotifications(false)}
        role="button"
        data-bs-toggle="dropdown"
        data-bs-auto-close="outside"
        aria-expanded="false"
      >
        {gotNotifications ? (
          <img
            className="rounded-circle me-2"
            alt="GotNotifications"
            src={notificationRedPic}
          />
        ) : (
          <img
            className="rounded-circle me-2"
            alt="NoNotifications"
            src={notificationPic}
          />
        )}
      </a>
      <ul
        className={
          false
            ? "overflow-auto dropdown-menu notifications-menu dropdown-menu-end "
            : "overflow-auto dropdown-menu notifications-menu dropdown-menu-end "
        }
      >
        {/* TODO Добавить изменение стиля в зависимости от дропдауна уведов */}
        <div className={"" + (true ? "a" : "b")}>
          {notifications
            ? notifications.map((item, index) => (
                <NotificationTemplate
                  key={index}
                  id={item.id}
                  type={item.type}
                  seen={item.seen}
                  displayName={item.displayName}
                  username={item.username}
                />
              ))
            : "Уведомлений пока нет"}
        </div>
      </ul>
    </div>
  );
};

export default NotificationsPanel;
