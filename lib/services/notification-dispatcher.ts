import { createServerClient } from "@supabase/ssr";

export type NotificationChannel = 'in_app' | 'email' | 'push';
export type PreferenceCategory = 'budget_alerts' | 'overdue_task_alerts' | 'followed_project_updates' | 'weekly_digest' | 'general';

interface DispatchOptions {
  userIds: string[];
  actorId?: string;
  message: string;
  actionLink: string;
  type: string;
  category: PreferenceCategory;
  projectId?: string;
}

export class NotificationDispatcher {
  /**
   * Central method to dispatch notifications based on user preferences.
   */
  static async dispatch(options: DispatchOptions) {
    if (!options.userIds.length) return;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!;

    const supabaseAdmin = createServerClient(supabaseUrl, supabaseServiceKey, {
      cookies: { getAll() { return []; }, setAll() {} },
    });

    // 1. Fetch preferences and emails for all target users
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, in_app_alerts, email_alerts, push_alerts, budget_alerts, overdue_task_alerts, followed_project_updates, weekly_digest')
      .in('id', options.userIds);

    if (profileError || !profiles) {
      console.error("Error fetching notification profiles:", profileError);
      return;
    }

    // Since profiles might not have email, we fetch from auth.users (requires service role)
    const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (usersError) {
      console.error("Error fetching target users for email:", usersError);
    }

    const emailMap = new Map(users?.map(u => [u.id, u.email]) || []);

    const inAppPayloads = [];

    // 2. Evaluate preferences and prepare payloads per channel
    for (const profile of profiles) {
      const profileData = profile as Record<string, any>;
      const isCategoryEnabled = options.category === 'general' || profileData[options.category] === true;

      if (!isCategoryEnabled) continue;

      // --- In-App Channel ---
      if (profileData.in_app_alerts) {
        inAppPayloads.push({
          user_id: profile.id,
          actor_id: options.actorId || null,
          message: options.message,
          action_link: options.actionLink,
          entity_id: options.projectId || null,
          type: options.type,
        });
      }

      // --- Email Channel ---
      const userEmail = emailMap.get(profile.id);
      if (profileData.email_alerts && userEmail) {
        // Call the Edge Function to send the email
        // We use fetch instead of supabase.functions.invoke to handle the async nature easily
        fetch(`${supabaseUrl}/functions/v1/send-email-notification`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`
          },
          body: JSON.stringify({
            to: userEmail,
            subject: options.message.length > 50 ? `${options.message.substring(0, 50)}...` : options.message,
            html: `
              <div style="font-family: sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #1B4332;">OnTrack Notification</h2>
                <p>Hello ${profile.full_name || 'there'},</p>
                <p>${options.message}</p>
                <br>
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}${options.actionLink}" 
                   style="display: inline-block; padding: 12px 24px; background: #1B4332; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold;">
                   View Details
                </a>
                <p style="font-size: 12px; color: #999; margin-top: 30px;">
                  You received this because you have email notifications enabled in your OnTrack settings.
                </p>
              </div>
            `
          })
        }).catch(err => console.error(`Failed to send email to ${userEmail}:`, err));
      }

      // --- Push Channel ---
      if (profileData.push_alerts) {
        fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`
          },
          body: JSON.stringify({
            userIds: [profile.id],
            title: "OnTrack Update",
            body: options.message,
            url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}${options.actionLink}`
          })
        }).catch(err => console.error(`Failed to send push to ${profile.id}:`, err));
      }
    }

    // 3. Execute bulk inserts for enabled channels
    if (inAppPayloads.length > 0) {
      await supabaseAdmin.from('notifications').insert(inAppPayloads);
    }
  }
}
