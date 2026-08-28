export type PlannerNotification = {
  id: string;
  title: string;
  description: string;
  href: string;
  createdAt: string;
  read: boolean;
};

export const NOTIFICATIONS_CHANGED_EVENT = "planner:notifications-changed";
const NOTIFICATIONS_STORAGE_KEY = "planner_notifications";

export function getPlannerNotifications(): PlannerNotification[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = window.localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function savePlannerNotifications(notifications: PlannerNotification[]) {
  try {
    window.localStorage.setItem(
      NOTIFICATIONS_STORAGE_KEY,
      JSON.stringify(notifications)
    );
    window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT));
  } catch {
    // Storage may be unavailable in private browsing or restricted contexts.
  }
}

export function saveSwatGptNotification() {
  if (typeof window === "undefined") return;

  const notifications = getPlannerNotifications();
  if (notifications.some(({ id }) => id === "swatgpt-welcome")) return;

  savePlannerNotifications([
    {
      id: "swatgpt-welcome",
      title: "You may like SwatGPT",
      description:
        "Ask questions about Swarthmore, campus resources, and student life.",
      href: "https://chat.sccs.swarthmore.edu",
      createdAt: new Date().toISOString(),
      read: false,
    },
    ...notifications,
  ]);
}

export function markPlannerNotificationsRead() {
  if (typeof window === "undefined") return;

  const notifications = getPlannerNotifications();
  if (!notifications.some(({ read }) => !read)) return;

  savePlannerNotifications(
    notifications.map((notification) => ({ ...notification, read: true }))
  );
}
