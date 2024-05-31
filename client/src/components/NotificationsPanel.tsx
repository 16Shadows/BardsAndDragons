import { MouseEvent, useCallback, useEffect, useRef, useState } from "react";
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
import React from "react";
import { Int32 } from "typeorm";
import Button from "./Button";
import { start } from "repl";
import useDynamicList from "../utils/useDynamicList";

const NotificationsPanel = () => {
  const api = useApi();

  const authHeader = useAuthHeader();

  const abortSignal = useRef(new AbortController());

  useEffect(() => {
    abortSignal.current.abort();
    abortSignal.current = new AbortController();
    // Подписка на уведомления от сервера, новые уведомления пользователю
    if (authHeader) {
      fetchEventSource("api/v1/notifications/subscribe", {
        onmessage(event) {
          setGotNotifications(true);
          getNotificationsQuery(notifications ? notifications : []);
        },
        headers: { Authorization: authHeader },
        signal: abortSignal.current.signal,
      });
      api
        .get("notifications/testSourceEvent", {})
        .then(async (response) => {
          console.log("Тестовая отправка уведомления от сервиса", response);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [authHeader, abortSignal, api]);

  const getNotificationsQuery = useCallback(
    async (oldArr: ReadonlyArray<NotificationObject>) => {
      try {
        const response = await api.get("notifications", {
          params: { start: oldArr.length, count: notifOnPageCount },
        });

        let gotNotif = false;
        const items = response.data;

        const resPromise = items.map((item: QueryNotificationObject) => {
          const resultItem: NotificationObject = {
            id: item.id,
            type: item.type,
            seen: item.seen,
            displayName: null,
            username: null,
            avatar: null,
          };

          if (resultItem.type === "friendRequest") {
            resultItem.username = item.friendRequestSentBy
              ? item.friendRequestSentBy.username
              : null;
            resultItem.displayName = item.friendRequestSentBy
              ? item.friendRequestSentBy.displayName
              : null;
            resultItem.avatar = item.friendRequestSentBy ? item.avatar : null;
          } else if (resultItem.type === "friendRequestAccepted") {
            resultItem.username = item.friendRequestAcceptedBy
              ? item.friendRequestAcceptedBy.username
              : null;
            resultItem.displayName = item.friendRequestAcceptedBy
              ? item.friendRequestAcceptedBy.displayName
              : null;
            resultItem.avatar = item.friendRequestAcceptedBy
              ? item.avatar
              : null;
          }

          if (!gotNotif && resultItem.seen === false) gotNotif = true;

          return resultItem;
        });
        const res = await Promise.all(resPromise);

        setGotNotifications(gotNotif);

        // console.log(items.length);
        return {
          list: oldArr.concat(res),
          isFinal: items.length === 0,
        };
      } catch {
        return {
          list: oldArr,
          isFinal: false,
        };
      }
    },
    [api]
  );

  // Список уведомлений
  // TODO понять, почему надо два раза вызывать без новых уведов, чтобы кнопку отключило, починить
  const [notifications, setNotifications, isNotificationsFinal] =
    useDynamicList(getNotificationsQuery);

  // Индикатор наличия уведомлений
  const [gotNotifications, setGotNotifications] = useState(false);

  // Индикатор открытости списка панели уведомлений
  const [openState, setOpenState] = useState(false);

  // Состояние для кнопки "загрузить еще" уведомления. false, когда больше загрузить нельзя
  const [canLoadMoreNotif, setCanLoadMoreNotif] = useState(true);

  // Количество уведомлений, отображаемых/добавляемых за раз
  const notifOnPageCount = 2;

  //const pomogite = useRef(isNotificationsFinal);

  const setSeenNotifications = (event: any) => {
    // При открытии меню отправляем в БД запрос на изменение статуса уведомлений
    if (event.target.classList.contains("show")) {
      setOpenState(true);
      // console.log(notifications);
      notifications?.forEach((notif) => {
        if (!notif.seen) {
          api
            .post("notifications/" + notif.id + "/seen", {})
            .then(async (response) => {})
            .catch((error) => {
              console.error(error);
            });
        }
      });
    } // При закрытии - обновляем поле seen и рамку вокруг прочитанных объектов
    // + делаем кнопку "загрузить еще" доступной
    else {
      setCanLoadMoreNotif(true);
      setOpenState(false);
      notifications?.forEach((notif) => {
        notif.seen = true;
      });
    }
  };

  async function loadMoreNotificationsHandler() {
    setNotifications();
    if (isNotificationsFinal) {
      setCanLoadMoreNotif(false);
    }
  }

  return (
    <div>
      <a
        id="notification_dropdown_toggle"
        className="nav-link dropdown-toggle "
        onClick={(event) => {
          setGotNotifications(false);
          setSeenNotifications(event);
        }}
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
          "overflow-auto dropdown-menu notifications-menu dropdown-menu-end "
        }
      >
        <div>
          {notifications
            ? notifications.map((item, index) => (
                <NotificationTemplate
                  key={index}
                  id={item.id}
                  type={item.type}
                  seen={item.seen}
                  displayName={item.displayName}
                  username={item.username}
                  avatar={item.avatar}
                />
              ))
            : "Уведомлений пока нет"}
          <div className="d-flex justify-content-center">
            <Button
              disabled={!canLoadMoreNotif}
              children={
                canLoadMoreNotif
                  ? "Загрузить еще"
                  : "Новых уведомлений пока нет"
              }
              onClick={() => {
                loadMoreNotificationsHandler();
              }}
            ></Button>
          </div>
        </div>
      </ul>
    </div>
  );
};

export default NotificationsPanel;
