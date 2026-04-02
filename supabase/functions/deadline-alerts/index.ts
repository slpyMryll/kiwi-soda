import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const RESEND_URL = 'https://api.resend.com/emails'

Deno.serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const resendApiKey = Deno.env.get('RESEND_API_KEY')!
    
    const siteUrl = Deno.env.get('FRONTEND_URL') || 'http://localhost:3000'
    
    const supabase = createClient(supabaseUrl, supabaseKey)

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const targetDateStr = tomorrow.toISOString().split('T')[0] 

    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id, title, due_date, assigned_to, projects(title)')
      .eq('due_date', targetDateStr)
      .neq('status', 'Completed')
      .not('assigned_to', 'is', null)

    if (tasksError) throw tasksError
    if (!tasks || tasks.length === 0) {
      return new Response(JSON.stringify({ message: "No tasks due tomorrow." }), { status: 200 })
    }

    let emailsSent = 0;

    for (const task of tasks) {
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(task.assigned_to)
      
      if (userError || !userData.user?.email) continue;

      const userEmail = userData.user.email;
      const projectName = Array.isArray(task.projects) ? task.projects[0]?.title : task.projects?.title;
      
      const actionLink = `/project-manager/tasks?taskId=${task.id}`
      const fullActionUrl = `${siteUrl}${actionLink}`

      await supabase.from('notifications').insert({
        user_id: task.assigned_to,
        type: 'deadline_alert',
        entity_id: task.id,
        message: `🚨 Deadline Tomorrow: ${task.title} (${projectName})`,
        action_link: actionLink
      });

      const emailPayload = {
        from: 'Ontrack <notifications@resend.dev>', 
        to: userEmail,
        subject: `Upcoming Deadline: ${task.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #1B4332;">Ontrack Deadline Alert 🚨</h2>
            <p>Hello,</p>
            <p>This is a friendly reminder that you have a task due tomorrow:</p>
            <div style="background: #F8F9FA; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F59E0B;">
              <h3 style="margin: 0 0 5px 0;">${task.title}</h3>
              <p style="margin: 0; color: #666;"><strong>Project:</strong> ${projectName}</p>
              <p style="margin: 5px 0 0 0; color: #666;"><strong>Due:</strong> ${targetDateStr}</p>
            </div>
            <p>Please log in to Ontrack to update your progress or submit it for review.</p>
            <a href="${fullActionUrl}" style="display: inline-block; padding: 10px 20px; background: #1B4332; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Task Details</a>
          </div>
        `
      };

      const resendRes = await fetch(RESEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`
        },
        body: JSON.stringify(emailPayload)
      });

      if (resendRes.ok) emailsSent++;
    }

    return new Response(JSON.stringify({ message: `Successfully sent ${emailsSent} deadline alerts.` }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})