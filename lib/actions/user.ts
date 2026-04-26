'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const full_name = formData.get('full_name') as string
  const username = formData.get('username') as string
  const avatar_file = formData.get('avatar') as File | null
  const remove_avatar = formData.get('remove_avatar') === 'true'

  let avatar_url = formData.get('current_avatar_url') as string | null

  if (remove_avatar) {
    if (avatar_url) {
      const oldPath = avatar_url.split('/profiles/').pop()
      if (oldPath) {
        await supabase.storage.from('profiles').remove([oldPath])
      }
    }
    avatar_url = null
  } else if (avatar_file && avatar_file.size > 0) {
    // Delete old avatar if it exists
    if (avatar_url) {
      const oldPath = avatar_url.split('/profiles/').pop()
      if (oldPath) {
        await supabase.storage.from('profiles').remove([oldPath])
      }
    }
    
    const fileExt = avatar_file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `${user.id}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(filePath, avatar_file)

    if (uploadError) {
      if (uploadError.message.includes('bucket not found')) {
        return { error: 'Storage Error: The "profiles" bucket does not exist. Please create it in your Supabase dashboard.' }
      }
      return { error: `Upload failed: ${uploadError.message}` }
    }

    const { data: { publicUrl } } = supabase.storage
      .from('profiles')
      .getPublicUrl(filePath)

    avatar_url = publicUrl
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      full_name,
      username,
      avatar_url,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (updateError) {
    return { error: `Update failed: ${updateError.message}` }
  }

  revalidatePath('/', 'layout')
  
  return { success: true, avatar_url }
}

export async function updateNotificationSettings(settings: {
  email_alerts?: boolean;
  push_alerts?: boolean;
  in_app_alerts?: boolean;
  budget_alerts?: boolean;
  overdue_task_alerts?: boolean;
  followed_project_updates?: boolean;
  weekly_digest?: boolean;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const { error } = await supabase
    .from('profiles')
    .update({
      ...settings,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) return { error: error.message };

  revalidatePath('/viewer/settings');
  revalidatePath('/project-manager/settings');
  revalidatePath('/admin/settings');
  
  return { success: true };
}
