"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function PresencePinger() {
  useEffect(() => {
    const pingPresence = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase
          .from("profiles")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", user.id);
      }
    };

    const registerServiceWorker = async () => {
      if ("serviceWorker" in navigator) {
        try {
          await navigator.serviceWorker.register("/sw.js");
        } catch (error) {
          console.error("Service Worker registration failed:", error);
        }
      }
    };

    pingPresence(); 
    registerServiceWorker();
    
    const interval = setInterval(pingPresence, 4 * 60 * 1000); 

    return () => clearInterval(interval);
  }, []);

  return null;
}