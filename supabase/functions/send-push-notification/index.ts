import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

// Standard web-push library for Deno can be tricky, so we use a fetch-based approach 
// or an ESM version if available.
// For simplicity and reliability in Deno, we'll use the 'web-push' logic implemented via fetch
// or a compatible library.

serve(async (req) => {
  try {
    const { userIds, title, body, url } = await req.json()
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')!
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!
    const vapidEmail = Deno.env.get('VAPID_EMAIL') || 'mailto:support@ontrack.vsu.edu.ph'

    const supabase = createClient(supabaseUrl, supabaseKey)

    if (!userIds || !title || !body) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 })
    }

    // 1. Fetch all subscriptions for these users
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .in('user_id', userIds);

    if (subError || !subscriptions) {
      return new Response(JSON.stringify({ error: "Failed to fetch subscriptions" }), { status: 500 })
    }

    // 2. We use a hosted helper or a dedicated library for the crypto sign-off
    // For Deno, the most reliable way to handle WebPush is via the 'web-push' package 
    // but Deno compatibility varies. 
    // Instead, we will use the 'https://esm.sh/web-push' which works with Deno.
    
    const webpush = await import('https://esm.sh/web-push@3.6.6');
    
    webpush.setVapidDetails(
      vapidEmail,
      vapidPublicKey,
      vapidPrivateKey
    );

    const results = await Promise.all(subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          sub.subscription,
          JSON.stringify({ title, body, url })
        );
        return { success: true };
      } catch (err) {
        console.error("Push send error:", err);
        // If subscription is expired/invalid, we could remove it here
        if (err.statusCode === 410 || err.statusCode === 404) {
          // Cleanup logic would go here
        }
        return { success: false, error: err.message };
      }
    }));

    return new Response(JSON.stringify({ message: "Push processing complete", results }), { 
      headers: { "Content-Type": "application/json" },
      status: 200 
    })

  } catch (error: any) {
    console.error("Push Function Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
