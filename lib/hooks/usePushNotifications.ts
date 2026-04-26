"use client";

import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const registerPush = async (userId: string) => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      toast.error("Push notifications are not supported in this browser.");
      return false;
    }

    try {
      // 1. Request permission
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error("Notification permission denied.");
        return false;
      }

      // 2. Register Service Worker if not already registered
      const registration = await navigator.serviceWorker.register("/sw.js");

      // 3. Get existing subscription or create new one
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        if (!VAPID_PUBLIC_KEY) {
          console.error("VAPID_PUBLIC_KEY is not configured.");
          return false;
        }

        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
      }

      // 4. Save subscription to Supabase
      const supabase = createClient();
      const { error } = await supabase.from("push_subscriptions").upsert({
        user_id: userId,
        subscription: subscription.toJSON(),
        device_info: navigator.userAgent,
      }, { onConflict: 'user_id, subscription' });

      if (error) throw error;

      return true;
    } catch (error) {
      console.error("Push registration error:", error);
      const message = error instanceof Error ? error.message : "Failed to enable push notifications.";
      toast.error(message);
      return false;
    }
  };

  const unregisterPush = async (userId: string) => {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
          
          // Remove from Supabase
          const supabase = createClient();
          await supabase
            .from("push_subscriptions")
            .delete()
            .eq("user_id", userId)
            .eq("subscription", subscription.toJSON());
        }
      }
      return true;
    } catch (error) {
      console.error("Push unregistration error:", error);
      return false;
    }
  };

  return { registerPush, unregisterPush };
}
