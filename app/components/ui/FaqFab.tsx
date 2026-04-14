"use client";

import { MessageCircle, X, Send } from "lucide-react";
import { useState } from "react";

export function FaqFab() {
  const [isOpen, setIsOpen] = useState(false);

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
            
            <div className="flex gap-2.5 items-start">
              <div className="w-7 h-7 rounded-full bg-[#81AC34] flex items-center justify-center shrink-0 shadow-md mt-0.5">
                <MessageCircle className="w-4 h-4 text-white" fill="currentColor" />
              </div>
              
              <div className="flex flex-col gap-3 max-w-[85%]">
                
                <div className="bg-[#E6F4EA] text-gray-800 p-3 rounded-2xl rounded-tl-sm text-sm leading-relaxed shadow-sm border border-green-50/50">
                  Hi! I'm here to help answer your questions about OnTrack. What would you like to know?
                  <span className="block text-[10px] text-gray-400 mt-1.5 font-medium">12:00 AM</span>
                </div>

                <div className="flex flex-col gap-2">
                  <button className="w-full text-left border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
                    How do I track project budget?
                  </button>
                  <button className="w-full text-left border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
                    What are my role permissions?
                  </button>
                  <button className="w-full text-left border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
                    What are the ongoing projects for this term?
                  </button>
                </div>
                
              </div>
            </div>
            
          </div>

          <div className="p-3 bg-white border-t border-gray-200 flex items-center gap-2">
            <input 
              type="text" 
              placeholder="Type your question..." 
              className="flex-1 bg-white border border-gray-200 focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] rounded-xl px-3.5 py-2.5 text-[13px] outline-none transition-all"
            />
            <button className="bg-[#A9DC02] hover:bg-[#81AC34] text-[#1B4332] p-2.5 rounded-xl shadow-md transition-colors flex items-center justify-center shrink-0">
              <Send className="w-4 h-4" />
            </button>
          </div>

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