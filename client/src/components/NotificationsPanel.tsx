import { useCallback, useEffect, useRef, useState } from "react";
import useApi from "../http-common";
import NotificationTemplate from "./NotificationTemplate";
import notificationPic from "../resources/notification_50px.png";
import notificationRedPic from "../resources/notification_red_50px.png";
import { NotificationObject } from "../models/Notifications";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import Button from "./Button";
import useDynamicList from "../utils/useDynamicList";

const NotificationsPanel = () => {
  const api = useApi();

  const authHeader = useAuthHeader();

  const abortSignal = useRef(new AbortController());

  const getNotificationsQuery = useCallback(
    async (oldArr: ReadonlyArray<NotificationObject>) => {
      try {
        const response = await api.get("notifications", {
          params: { start: oldArr.length, count: notifOnPageCount },
        });
        const items = response.data;
        setGotNotifications(
          items.some((elem: NotificationObject) => elem.seen === false)
        );

        return {
          list: oldArr.concat(items),
          isFinal: !(items.length === notifOnPageCount),
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
  const [
    notifications,
    setNotifications,
    isNotificationsFinal,
    updateNotifications,
  ] = useDynamicList(getNotificationsQuery);

  useEffect(() => {
    abortSignal.current.abort();
    abortSignal.current = new AbortController();
    // Подписка на уведомления от сервера, новые уведомления пользователю
    if (authHeader) {
      fetchEventSource("api/v1/notifications/subscribe", {
        onmessage(event) {
          setGotNotifications(true);
          let notif = JSON.parse(event.data);
          updateNotifications((x) => [notif].concat(x));
        },
        headers: { Authorization: authHeader },
        signal: abortSignal.current.signal,
      });
    }
  }, [authHeader, abortSignal, api, updateNotifications]);

  // Индикатор наличия уведомлений
  const [gotNotifications, setGotNotifications] = useState(false);

  // Индикатор открытости списка панели уведомлений, для ререндера
  const [openState, setOpenState] = useState(false);

  // Количество уведомлений, отображаемых/добавляемых за раз
  const notifOnPageCount = 2;

  const setSeenNotifications = (event: any) => {
    // При открытии меню отправляем в БД запрос на изменение статуса уведомлений
    if (event.target.classList.contains("show")) {
      setOpenState(true);
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
    else {
      setOpenState(false);
      notifications?.forEach((notif) => {
        notif.seen = true;
      });
    }
  };

  async function loadMoreNotificationsHandler() {
    setNotifications();
    setOpenState(true);
  }

  return (
    <div>
      {/* Для дебага */}
      {/* <Button
        color={"primary"}
        children="Тестовая отправка уведомления от сервера"
        onClick={function (): void {
          api
            .get("notifications/testSourceEvent", {})
            .then(async (response) => {
              console.log("Тестовая отправка уведомления от сервиса", response);
            })
            .catch((error) => {
              console.error(error);
            });
        }}
      ></Button> */}
      <div
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
            alt="Новые уведомления"
            src={notificationRedPic}
          />
        ) : (
          <img
            className="rounded-circle me-2"
            alt="Нет новых уведомлений"
            src={notificationPic}
          />
        )}
      </div>
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
              color={"primary"}
              disabled={isNotificationsFinal}
              children={
                !isNotificationsFinal
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
