import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const SENDGRID_API_URL = 'https://api.sendgrid.com/v3/mail/send'

Deno.serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const sendgridApiKey = Deno.env.get('SENDGRID_API_KEY')! 
    const siteUrl = Deno.env.get('FRONTEND_URL') || 'http://localhost:3000'
    const supabase = createClient(supabaseUrl, supabaseKey)

    const now = new Date()
    const phTime = new Date(now.getTime() + (8 * 60 * 60 * 1000))
    
    phTime.setDate(phTime.getDate() + 1)
    
    const targetDateStr = phTime.toISOString().split('T')[0]

    console.log(`Checking for tasks due on (PST): ${targetDateStr}`)

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
      const fullActionUrl = `${siteUrl}/project-manager/tasks?taskId=${task.id}`

      await supabase.from('notifications').insert({
        user_id: task.assigned_to,
        type: 'deadline_alert',
        entity_id: task.id,
        message: `🚨 Deadline Tomorrow: ${task.title} (${projectName})`,
        action_link: `/project-manager/tasks?taskId=${task.id}`
      });

      const emailPayload = {
        personalizations: [
          {
            to: [{ email: userEmail }],
            subject: `Upcoming Deadline: ${task.title}`
          }
        ],
        from: { 
          email: 'israelmelorenbinongo@gmail.com', 
          name: 'OnTrack Notifications' 
        }, 
        content: [
          {
            type: 'text/html',
            value: `
              <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #1B4332;">OnTrack Deadline Alert 🚨</h2>
                <p>Hello,</p>
                <p>This is an automated reminder that you have a task due tomorrow:</p>
                <div style="background: #F8F9FA; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F59E0B;">
                  <h3 style="margin: 0 0 5px 0;">${task.title}</h3>
                  <p style="margin: 0; color: #666;"><strong>Project:</strong> ${projectName}</p>
                </div>
                <p>Please log in to update your progress or submit it for review to your Project Manager.</p>
                <br>
                <a href="${fullActionUrl}" style="display: inline-block; padding: 10px 20px; background: #1B4332; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">View Task Details</a>
              </div>
            `
          }
        ]
      };

      const sgRes = await fetch(SENDGRID_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sendgridApiKey}`
        },
        body: JSON.stringify(emailPayload)
      });

      if (sgRes.ok) {
        emailsSent++;
      } else {
        const errorText = await sgRes.text();
        console.error(`SendGrid Error for ${userEmail}: ${errorText}`);
      }
    }

    return new Response(JSON.stringify({ message: `Successfully processed ${tasks.length} tasks and sent ${emailsSent} alerts.` }), { 
      headers: { "Content-Type": "application/json" },
      status: 200 
    })
  } catch (error: any) {
    console.error("Critical Function Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})