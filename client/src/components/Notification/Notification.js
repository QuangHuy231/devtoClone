import React from "react";
import Avatar from "../Avatar/Avatar";
import NotificationBody from "./NotificationBody";
import { Link } from "react-router-dom";

const Notification = ({ notification, type, children }) => {
  return (
    <div className="notif">
      <Avatar
        src={notification.sender && notification.sender.avatar}
        link={`/users/${notification.sender.id}`}
      />

      <div className="notif__details">
        {notification.post ? (
          <Link to={`/posts/${notification.post._id}`}>
            <NotificationBody
              type={notification.notificationType}
              notification={notification}
            />
          </Link>
        ) : (
          <NotificationBody
            type={notification.notificationType}
            notification={notification}
          />
        )}
      </div>
    </div>
  );
};

export default Notification;
