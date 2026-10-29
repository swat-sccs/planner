"use client";

import {
  Badge,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import { useCallback, useEffect, useState } from "react";

import {
  getPlannerNotifications,
  markPlannerNotificationsRead,
  NOTIFICATIONS_CHANGED_EVENT,
  PlannerNotification,
} from "@/lib/plannerNotifications";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<PlannerNotification[]>([]);

  const refreshNotifications = useCallback(() => {
    setNotifications(getPlannerNotifications());
  }, []);

  useEffect(() => {
    refreshNotifications();
    window.addEventListener(
      NOTIFICATIONS_CHANGED_EVENT,
      refreshNotifications
    );
    window.addEventListener("storage", refreshNotifications);

    return () => {
      window.removeEventListener(
        NOTIFICATIONS_CHANGED_EVENT,
        refreshNotifications
      );
      window.removeEventListener("storage", refreshNotifications);
    };
  }, [refreshNotifications]);

  const unreadCount = notifications.filter(({ read }) => !read).length;

  function handleOpenChange(isOpen: boolean) {
    if (isOpen) {
      markPlannerNotificationsRead();
      refreshNotifications();
    }
  }

  return (
    <Dropdown placement="bottom-end" onOpenChange={handleOpenChange}>
      <DropdownTrigger>
        <Button
          isIconOnly
          aria-label={
            unreadCount
              ? `Notifications, ${unreadCount} unread`
              : "Notifications"
          }
          className="text-primary"
          variant="light"
        >
          <Badge
            color="secondary"
            content={unreadCount}
            isInvisible={unreadCount === 0}
            shape="circle"
            size="sm"
          >
            <NotificationsNoneRoundedIcon />
          </Badge>
        </Button>
      </DropdownTrigger>

      <DropdownMenu
        aria-label="Notifications"
        className="w-[min(22rem,calc(100vw-2rem))]"
        emptyContent="No notifications yet"
        items={notifications}
      >
        {(notification) => (
          <DropdownItem
            key={notification.id}
            className="py-3"
            description={notification.description}
            endContent={<OpenInNewRoundedIcon fontSize="small" />}
            href={notification.href}
            startContent={
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary/10 text-secondary">
                <AutoAwesomeRoundedIcon fontSize="small" />
              </div>
            }
            target="_blank"
          >
            <span className="font-semibold">{notification.title}</span>
          </DropdownItem>
        )}
      </DropdownMenu>
    </Dropdown>
  );
}
