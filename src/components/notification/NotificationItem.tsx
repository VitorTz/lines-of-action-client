import { useState, useEffect } from "react";
import { useNotification } from "./NotificationContext";
import { type Notification } from "./NotificationType";
import './Notification.css'


const SuccessIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2"/>
    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ErrorIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2"/>
    <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const WarningIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M12 2L2 20h20L12 2z" fill="currentColor" opacity="0.2"/>
    <path d="M12 9v4M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const InfoIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2"/>
    <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// Componente de Notificação Individual
const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => {
  
    const { removeNotification } = useNotification();
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const duration = notification.duration || 5000;
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [notification]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      removeNotification(notification.id);
    }, 300);
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success': return <SuccessIcon />;
      case 'error': return <ErrorIcon />;
      case 'warning': return <WarningIcon />;
      case 'info': return <InfoIcon />;
    }
  };

  return (
    <div className={`notification notification--${notification.type} ${isExiting ? 'notification--exit' : ''}`}>
      <div className="notification__icon">
        {getIcon()}
      </div>
      <div className="notification__content">
        <div className="notification__title">{notification.title}</div>
        {notification.message && (
          <div className="notification__message">{notification.message}</div>
        )}
      </div>
      <button className="notification__close" onClick={handleClose}>
        <CloseIcon />
      </button>
    </div>
  );
};


export default NotificationItem;