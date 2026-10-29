import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";
import { disableDevLogs } from "serwist";

disableDevLogs();

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    // Change this attribute's name to your `injectionPoint`.
    // `injectionPoint` is an InjectManifest option.
    // See https://serwist.pages.dev/docs/build/configuring
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

// @ts-expect-error
declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();

/* Push Notifs */
self.addEventListener("push", function (event: any) {
  if (event.data) {
    let body;
    let icon;
    let title;
    try {
      const data = event.data.json();
      body = data.body;
      icon = data.icon || "/icon.png";
      title = data.title;
    } catch (e) {
      console.log("clearly not a JSON notif");
      body = "";
      icon = "/icon.png";
      title = event.data;
    }

    const options = {
      body: body,
      icon: icon,
      badge: "/icon.png",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: "2",
      },
    };
    event.waitUntil(self.registration.showNotification(title, options));
  }
});

self.addEventListener("notificationclick", function (event: any) {
  console.log("Notification click received.");
  event.notification.close();
  event.waitUntil(
    //@ts-ignore
    clients.openWindow("https://schedulerv2.sccs.swarthmore.edu/")
  );
});
