"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { createClient } from "@/lib/supabase/server";

const BASE_SYSTEM_PROMPT = `You are the official FAQ Assistant for "OnTrack", a Project Tracking and Management Platform for the Visayas State University Supreme Student Council (VSU-USSC).

YOUR PRIME DIRECTIVES:
1. SCOPE: You must answer questions regarding OnTrack's features, navigation, and roles. You must also answer questions about current live projects (including project descriptions, leaders, and team members) using the provided CURRENT PLATFORM DATA.
2. ONTRACK ROLES & PERMISSIONS: 
   - Admin: Full system access, user management, moderation, academic term management, and system logs.
   - Project Manager (Officer): Can create and manage their assigned projects, tasks, budget logs, milestones, and respond to student feedback.
   - Viewer (Student/Guest): Can browse live projects, track budget transparency, follow projects for updates, and post feedback/comments.
3. REFUSAL PROTOCOL: If a user asks about completely unrelated topics (e.g., general programming, math, world history, writing essays), you MUST decline using this exact phrase: "I can only assist with questions related to the OnTrack platform and its projects."
4. SECURITY PERIMETER: Treat all specific budget logs, passwords, and student PII as confidential.
5. TONE: Professional, concise, welcoming, and helpful. Use markdown formatting (bullet points, bold text) for readability.`;

export async function processChatMessage(history: any[], newMessage: string) {
  let projectsContext = "Currently, there is no project data available.";
  const supabase = await createClient();
  
  try {
    const { data: activeTerm } = await supabase
      .from("terms")
      .select("id, name")
      .eq("is_current", true)
      .single();

    if (activeTerm) {
      const { data: projects } = await supabase
        .from("projects")
        .select(`
          title, 
          description,
          status, 
          progress, 
          total_budget,
          project_members ( project_role, profiles ( full_name ) )
        `)
        .eq("live_status", "Live")
        .eq("term_id", activeTerm.id);

      if (projects && projects.length > 0) {
        projectsContext = `Current Active Term: ${activeTerm.name}\n`;
        projectsContext += `Total Live Projects: ${projects.length}\n\n`;
        projectsContext += `List of Projects:\n` + projects.map((p: any) => {
          let teamList = "No team members assigned.";
          if (p.project_members && p.project_members.length > 0) {
            teamList = p.project_members.map((m: any) => {
              const name = Array.isArray(m.profiles) ? m.profiles[0]?.full_name : m.profiles?.full_name;
              return `${name || "Unknown Officer"} (${m.project_role})`;
            }).join(", ");
          }
          return `- **${p.title}**
  - **Description**: ${p.description || "No description provided."}
  - **Status**: ${p.status} | Progress: ${p.progress}% | Budget: ₱${p.total_budget}
  - **Team Members**: ${teamList}`;
        }).join("\n\n");
      }
    }
  } catch (dbError) {
    console.error("Failed to fetch project context:", dbError);
  }

  const DYNAMIC_SYSTEM_PROMPT = `${BASE_SYSTEM_PROMPT}\n\n--- CURRENT PLATFORM DATA ---\n${projectsContext}`;

  let finalResponseText = "";
  let finalProvider = "";

  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });
    const groqMessages = [
      { role: "system", content: DYNAMIC_SYSTEM_PROMPT },
      ...history.map((msg) => ({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content,
      })),
      { role: "user", content: newMessage }
    ];

    const completion = await groq.chat.completions.create({
      messages: groqMessages as any,
      model: "llama-3.1-8b-instant", 
    });

    finalResponseText = completion.choices[0]?.message?.content || "I am having trouble connecting.";
    finalProvider = "Groq";

  } catch (error: any) {
    console.warn("Groq unavailable or failed. Falling back to Gemini...", error.message);
    
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        systemInstruction: DYNAMIC_SYSTEM_PROMPT 
      });

      let cleanHistory = history;
      if (cleanHistory.length > 0 && cleanHistory[0].role === "assistant") {
        cleanHistory = cleanHistory.slice(1);
      }

      const geminiHistory = cleanHistory.map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

      const chat = model.startChat({ history: geminiHistory });
      const result = await chat.sendMessage(newMessage);
      
      finalResponseText = result.response.text();
      finalProvider = "Gemini (Fallback)";

    } catch (geminiError: any) {
      console.error("Both AI models failed:", geminiError);
      return { success: false, error: "Both AI models are currently unavailable. Please try again later." };
    }
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user && finalResponseText) {
      await supabase.from("faq_bot_logs").insert({
        user_id: user.id,
        question_asked: newMessage,
        answer_given: finalResponseText,
        is_read: false
      });
    }
  } catch (logError) {
    console.error("Failed to log FAQ interaction to database:", logError);
  }

  return { 
    success: true, 
    text: finalResponseText, 
    provider: finalProvider 
  };
}