import { useNotification } from "./NotificationContext";
import NotificationItem from "./NotificationItem";
import './Notification.css'

const NotificationContainer: React.FC = () => {
  const { notifications } = useNotification();

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </div>
  );
};


export default NotificationContainer