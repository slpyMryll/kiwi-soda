import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')!
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!
    const vapidEmail = Deno.env.get('VAPID_EMAIL') || 'mailto:support@ontrack.vsu.edu.ph'

    const supabase = createClient(supabaseUrl, supabaseKey)

    // 1. Fetch all unique subscriptions to test
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('id, user_id, subscription');

    if (subError || !subscriptions) {
      return new Response(JSON.stringify({ error: "Failed to fetch subscriptions" }), { status: 500 })
    }

    const webpush = await import('https://esm.sh/web-push@3.6.6');
    webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);

    const expiredIds: string[] = [];
    const results = await Promise.all(subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          sub.subscription,
          JSON.stringify({ type: "ping" }),
          { TTL: 0, urgency: "very-low" }
        );
        return { id: sub.id, status: "valid" };
      } catch (err: any) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          expiredIds.push(sub.id);
          return { id: sub.id, status: "expired" };
        }
        return { id: sub.id, status: "error", error: err.message };
      }
    }));

    // 2. Delete expired subscriptions
    if (expiredIds.length > 0) {
      const { error: deleteError } = await supabase
        .from('push_subscriptions')
        .delete()
        .in('id', expiredIds);

      if (deleteError) console.error("Failed to delete expired subscriptions:", deleteError);
    }

    return new Response(JSON.stringify({ 
      message: "Token cleanup complete", 
      totalProcessed: subscriptions.length,
      expiredCount: expiredIds.length,
      deletedIds: expiredIds 
    }), { 
      headers: { "Content-Type": "application/json" },
      status: 200 
    })

  } catch (error: any) {
    console.error("Cleanup Function Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
