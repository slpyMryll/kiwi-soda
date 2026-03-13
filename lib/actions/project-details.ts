'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addProjectMember(projectId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const profileId = formData.get('profileId') as string

  const { error } = await supabase.from('project_members').upsert({
    project_id: projectId,
    profile_id: profileId,
    project_role: 'Member'
  }, {
    onConflict: 'project_id, profile_id',
    ignoreDuplicates: true
  })

  if (error && error.code !== '23505') {
    return { error: error.message }
  }

  revalidatePath(`/project-manager/projects/${projectId}`)
  return { success: true }
}

export async function assignTask(projectId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const title = formData.get('title') as string
  const assignedTo = formData.get('assignedTo') as string
  const dueDate = formData.get('dueDate') as string
  const cost = parseFloat(formData.get('cost') as string || '0')

  const { error } = await supabase.from('tasks').insert({
    project_id: projectId,
    assigned_to: assignedTo,
    title,
    due_date: dueDate,
    cost,
    status: 'Pending'
  })

  if (error) return { error: error.message }
  revalidatePath(`/project-manager/projects/${projectId}`)
  return { success: true }
}

export async function addExpense(projectId: string, currentSpent: number, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const amount = parseFloat(formData.get('amount') as string)
  const category = formData.get('category') as string
  const description = formData.get('description') as string

  const { error: updateError } = await supabase
    .from('projects')
    .update({ spent_budget: currentSpent + amount })
    .eq('id', projectId)

  if (updateError) return { error: updateError.message }

  const { error: logError } = await supabase.from('budget_logs').insert({
    project_id: projectId,
    changed_by: user.id,
    old_amount: currentSpent,
    new_amount: currentSpent + amount,
    budget_change_reason: `${category}: ${description}`,
    is_initial: false
  })

  if (logError) return { error: logError.message }
  
  revalidatePath(`/project-manager/projects/${projectId}`)
  return { success: true }
}


export async function addMilestone(projectId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const title = formData.get('title') as string
  const endDate = formData.get('deadline') as string 
  const progress = parseInt(formData.get('progress') as string)
  const status = formData.get('status') as string

  const { error } = await supabase.from('project_milestones').insert({
    project_id: projectId,
    title,
    end_date: endDate,
    progress,
    status
  })

  if (error) return { error: error.message }
  revalidatePath(`/project-manager/projects/${projectId}`)
  return { success: true }
}