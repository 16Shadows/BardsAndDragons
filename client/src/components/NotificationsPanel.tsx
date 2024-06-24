import { useCallback, useEffect, useRef, useState } from "react";
import useApi from "../http-common";
import NotificationTemplate, {
  NotificationTemplateFriendRequest,
  NotificationTemplateRequestAccepted,
} from "./NotificationTemplate";
import notificationPic from "../resources/notification_50px.png";
import notificationRedPic from "../resources/notification_red_50px.png";
import {
  NotificationTypes,
  QueryNotificationObjectBase,
  QueryNotificationObjectFriendRequest,
  QueryNotificationObjectFriendRequestAccepted,
} from "../models/Notifications";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import Button from "./Button";
import useDynamicList from "../utils/useDynamicList";
import { Dropdown } from "react-bootstrap";

const NotificationsPanel = () => {
  const api = useApi();

  const authHeader = useAuthHeader();

  const abortSignal = useRef(new AbortController());

  const getNotificationsQuery = useCallback(
    async (oldArr: ReadonlyArray<QueryNotificationObjectBase>) => {
      try {
        const response = await api.get("notifications", {
          params: { start: oldArr.length, count: notifOnPageCount },
        });
        const items = response.data;
        setGotNotifications(
          items.some((elem: QueryNotificationObjectBase) => elem.seen === false)
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
    requestMoreNotifications,
    isNotificationsFinal,
    updateNotifications,
  ] = useDynamicList(getNotificationsQuery);

  useEffect(() => {
    abortSignal.current.abort();
    abortSignal.current = new AbortController();
    // Подписка на уведомления от сервера, новые уведомления пользователю
    if (authHeader) {
      fetchEventSource("/api/v1/notifications/subscribe", {
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
  const [panelOpenState, setPanelOpenState] = useState(false);

  // Количество уведомлений, отображаемых/добавляемых за раз
  const notifOnPageCount = 2;

  const setSeenNotifications = (nextShow: boolean) => {
    // При открытии меню отправляем в БД запрос на изменение статуса уведомлений
    if (nextShow) {
      setPanelOpenState(true);
      setGotNotifications(false);
    } // При закрытии - обновляем поле seen и рамку вокруг прочитанных объектов
    else {
      setPanelOpenState(false);
      notifications?.forEach((notif) => {
        notif.seen = true;
      });
    }
  };

  useEffect(() => {
    async function SetSeenNotificationsQuery() {
      notifications?.forEach(async (notif) => {
        if (!notif.seen) {
          await api
            .post("notifications/" + notif.id + "/seen", {})
            .catch((error) => {
              console.error(error);
            });
        }
      });
    }

    if (panelOpenState) {
      SetSeenNotificationsQuery();
    }
  }, [api, notifications, panelOpenState]);

  return (
    <div>
      <Dropdown
        id="NotificationDropdown"
        autoClose="outside"
        onToggle={setSeenNotifications}
      >
        <Dropdown.Toggle variant="none">
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
        </Dropdown.Toggle>

        <Dropdown.Menu className="notifications-menu">
          {notifications
            ? notifications.map((item) => (
                <NotificationTemplate key={item.id} seen={item.seen}>
                  {(item.type === NotificationTypes.FriendRequest && (
                    <NotificationTemplateFriendRequest
                      item={item as QueryNotificationObjectFriendRequest}
                    />
                  )) ||
                    (item.type === NotificationTypes.FriendRequestAccepted && (
                      <NotificationTemplateRequestAccepted
                        item={
                          item as QueryNotificationObjectFriendRequestAccepted
                        }
                      />
                    ))}
                </NotificationTemplate>
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
                requestMoreNotifications();
              }}
            ></Button>
          </div>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

export default NotificationsPanel;
