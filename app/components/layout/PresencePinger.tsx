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

    pingPresence(); 
    
    const interval = setInterval(pingPresence, 4 * 60 * 1000); 

    return () => clearInterval(interval);
  }, []);

  return null;
}