import { createContext, useContext } from "react";
import { type NotificationContextType } from "./NotificationType";


export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);


export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};