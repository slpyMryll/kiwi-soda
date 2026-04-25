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

    // 1. Fetch preferences for all target users
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id, in_app_alerts, email_alerts, push_alerts, budget_alerts, overdue_task_alerts, followed_project_updates, weekly_digest')
      .in('id', options.userIds);

    if (!profiles) return;

    const inAppPayloads = [];

    // 2. Evaluate preferences and prepare payloads per channel
    for (const profile of profiles) {
      // Check if the specific category is enabled for this user
      // Cast profile to any to access dynamic category keys
      const profileData = profile as any;
      const isCategoryEnabled = options.category === 'general' || profileData[options.category] === true;

      if (!isCategoryEnabled) continue; // Skip if category is disabled

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

      // --- Email Channel (Placeholder for Future Implementation) ---
      if (profileData.email_alerts) {
        // e.g., EmailService.queue(...)
      }

      // --- Push Channel (Placeholder for Future Implementation) ---
      if (profileData.push_alerts) {
        // e.g., WebPushService.send(...)
      }
    }

    // 3. Execute bulk inserts for enabled channels
    if (inAppPayloads.length > 0) {
      await supabaseAdmin.from('notifications').insert(inAppPayloads);
    }
  }
}
