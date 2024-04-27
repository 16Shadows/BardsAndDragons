import { useEffect, useState } from "react";

const NotificationsPanel = () => {
  // Список уведомлений, каждое из которых нужно отрендерить через map
  const [notifications, fetchNotifications] = useState(null);
  // TODO запрос к бд https://www.youtube.com/watch?v=qdCHEUaFhBk&list=PL4cUxeGkcC9gZD-Tvwfod2gaISzfRiP9d&index=17
  // useEffect(() => {
  //     fetch()
  //     парс респонса
  //     fetchNotifications вызвать, чтобы обновить переменную и динамически отобразить
  // });

  // TODO Добавить уведомления
  return <div className="notifications_panel ">Заглушка для уведомлений</div>;
};

export default NotificationsPanel;
