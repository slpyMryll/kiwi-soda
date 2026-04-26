import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const SENDGRID_API_URL = 'https://api.sendgrid.com/v3/mail/send'

serve(async (req) => {
  try {
    const { to, subject, html } = await req.json()
    const sendgridApiKey = Deno.env.get('SENDGRID_API_KEY')!

    if (!to || !subject || !html) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 })
    }

    const emailPayload = {
      personalizations: [
        {
          to: [{ email: to }],
          subject: subject
        }
      ],
      from: { 
        email: 'israelmelorenbinongo@gmail.com', 
        name: 'OnTrack Notifications' 
      }, 
      content: [
        {
          type: 'text/html',
          value: html
        }
      ]
    };

    const res = await fetch(SENDGRID_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sendgridApiKey}`
      },
      body: JSON.stringify(emailPayload)
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`SendGrid Error: ${errorText}`);
      return new Response(JSON.stringify({ error: "Failed to send email" }), { status: 500 })
    }

    return new Response(JSON.stringify({ message: "Email sent successfully" }), { 
      headers: { "Content-Type": "application/json" },
      status: 200 
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
