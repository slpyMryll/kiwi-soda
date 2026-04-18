"use client";

import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { processChatMessage } from "@/lib/actions/faq-chat";
import ReactMarkdown from "react-markdown";
import { createClient } from "@/lib/supabase/client";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  time: string;
}

const INITIAL_MESSAGE: ChatMessage = { 
  role: "assistant", 
  content: "Hi! I'm here to help answer your questions about OnTrack. What would you like to know?",
  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
};

export function FaqFab() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("faq_messages");
      if (saved) return JSON.parse(saved);
    }
    return [INITIAL_MESSAGE];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkUserSession = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      const currentUserId = session?.user?.id || "guest";
      const savedUserId = sessionStorage.getItem("faq_user_id");

      if (savedUserId && savedUserId !== currentUserId) {
        setMessages([INITIAL_MESSAGE]);
        sessionStorage.setItem("faq_messages", JSON.stringify([INITIAL_MESSAGE]));
      }
      
      sessionStorage.setItem("faq_user_id", currentUserId);
    };
    
    checkUserSession();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("faq_messages", JSON.stringify(messages));
    }
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    const response = await processChatMessage(messages, text.trim());

    if (response.success && response.text) {
      setMessages([
        ...newMessages, 
        { 
          role: "assistant", 
          content: response.text,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } else {
      setMessages([
        ...newMessages, 
        { 
          role: "assistant", 
          content: "Sorry, I'm having trouble connecting to the server right now. Please try again later.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
    
    setIsLoading(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  const QUICK_QUESTIONS = [
    "How do I track project budget?",
    "What are my role permissions?",
    "What are the ongoing projects for this term?"
  ];

  return (
    <div className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-50 flex flex-col items-end">
      
      {isOpen && (
        <div className="mb-4 w-[calc(100vw-32px)] sm:w-[350px] h-[450px] max-h-[75vh] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          
          <div className="bg-[#153B44] text-white p-3.5 flex items-center justify-between shadow-md z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#81AC34] flex items-center justify-center shadow-sm shrink-0">
                <MessageCircle className="w-4 h-4 text-white" fill="currentColor" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[15px] leading-tight">OnTrack Assistant</span>
                <span className="text-[11px] text-white/80">Online</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1.5 rounded-full transition-colors shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 p-4 bg-white overflow-y-auto flex flex-col gap-5">
            {messages.map((msg, index) => (
              <div key={index} className={`flex gap-2.5 items-start ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-[#81AC34] flex items-center justify-center shrink-0 shadow-md mt-0.5">
                    <MessageCircle className="w-4 h-4 text-white" fill="currentColor" />
                  </div>
                )}
                
                <div className={`flex flex-col gap-3 max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm border ${
                    msg.role === "user" 
                      ? "bg-[#153B44] text-white rounded-tr-sm border-[#153B44]" 
                      : "bg-[#E6F4EA] text-gray-800 rounded-tl-sm border-green-50/50"
                  }`}>
                    
                    {msg.role === "assistant" ? (
                      <div className="text-sm leading-relaxed space-y-2">
                        <ReactMarkdown
                          components={{
                            p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2 marker:text-current" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2 marker:text-current" {...props} />,
                            li: ({node, ...props}) => <li className="mb-1" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap text-white">{msg.content}</div>
                    )}
                    
                    <span className={`block text-[10px] mt-1.5 font-medium ${msg.role === "user" ? "text-white/60 text-right" : "text-gray-400"}`}>
                      {msg.time}
                    </span>
                  </div>

                  {index === 0 && messages.length === 1 && (
                    <div className="flex flex-col gap-2 w-full mt-1">
                      {QUICK_QUESTIONS.map((question, i) => (
                        <button 
                          key={i}
                          onClick={() => handleSend(question)}
                          className="w-full text-left border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13px] text-gray-600 hover:bg-[#E6F4EA] hover:text-[#153B44] transition-colors shadow-sm"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  )}
                  
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 items-start">
                 <div className="w-7 h-7 rounded-full bg-[#81AC34] flex items-center justify-center shrink-0 shadow-md mt-0.5">
                  <MessageCircle className="w-4 h-4 text-white" fill="currentColor" />
                </div>
                <div className="bg-[#E6F4EA] text-gray-800 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm border border-green-50/50 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-[#153B44] animate-spin" />
                  <span className="text-xs font-medium text-gray-500">Thinking...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleFormSubmit} className="p-3 bg-white border-t border-gray-200 flex items-center gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              placeholder="Type your question..." 
              className="flex-1 bg-white border border-gray-200 focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] rounded-xl px-3.5 py-2.5 text-[13px] outline-none transition-all disabled:opacity-50"
            />
            <button 
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-[#A9DC02] hover:bg-[#81AC34] text-[#1B4332] p-2.5 rounded-xl shadow-md transition-colors flex items-center justify-center shrink-0 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle FAQ"
        className="border border-[#81AC34] bg-linear-to-b from-[#A9DC02] from-0% via-5% to-[#274F57] text-white p-3.5 md:p-4 rounded-full shadow-lg transition-transform hover:scale-105 flex items-center justify-center"
      >
        {isOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />}
      </button>

    </div>
  );
}