"use client";

import { useState } from "react";
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Send,
  HelpCircle,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SUPPORT_FAQS } from "@/lib/constants/faqs";

export function SupportClient({ role }: { role: "viewer" | "project-manager" | "admin" }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0); 
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const filteredFaqs = SUPPORT_FAQS.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmitReport = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      
      setTimeout(() => setIsSuccess(false), 3000);
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-8 pb-12 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="flex flex-col gap-2 border-b border-gray-200 pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#153B44] tracking-tight flex items-center gap-3">
          <HelpCircle className="w-8 h-8 text-[#52B788]" />
          Help & Support
        </h1>
        <p className="text-gray-500 text-sm sm:text-base">
          Submit an issue to our technical team or browse common questions about the platform.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10 items-start">
        
        <div className="lg:col-span-3 bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
          
          <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Submit a Report</h2>
            <p className="text-gray-500 text-sm mt-1">Fill out the form below to open a ticket.</p>
          </div>
          
          <div className="p-6 sm:p-8">
            {isSuccess ? (
              <div className="flex flex-col items-center justify-center text-center py-12 px-4 h-full animate-in zoom-in duration-300">
                <CheckCircle2 className="w-16 h-16 text-[#52B788] mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Report Submitted!</h3>
                <p className="text-gray-500 text-sm max-w-sm">
                  Thank you for reaching out. Our support team has received your report and will review it shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="flex flex-col gap-5">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1.5">Issue Type</label>
                    <select required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#153B44]/20 focus:border-[#153B44] transition-all">
                      <option value="">Select a category...</option>
                      <option value="bug">Bug / Technical Issue</option>
                      <option value="account">Account / Login Problem</option>
                      <option value="project">Project Management Issue</option>
                      <option value="feature">Feature Request</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1.5">Priority</label>
                    <select required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#153B44]/20 focus:border-[#153B44] transition-all">
                      <option value="low">Low - General Inquiry</option>
                      <option value="medium">Medium - Needs Attention</option>
                      <option value="high">High - Blocking my work</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1.5">Subject</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Brief summary of the issue"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#153B44]/20 focus:border-[#153B44] transition-all"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1.5">Description</label>
                  <textarea 
                    required 
                    rows={6}
                    placeholder="Please provide as much detail as possible so we can help you faster..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#153B44]/20 focus:border-[#153B44] transition-all resize-none custom-scrollbar"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1.5">Attachments <span className="text-gray-400 font-normal">(Optional)</span></label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl px-4 py-6 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                    <p className="text-sm text-gray-500 font-medium">Click to upload or drag & drop</p>
                    <p className="text-xs text-gray-400 mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full mt-2 bg-[#153B44] hover:bg-[#1B4B57] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-70 shadow-sm"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Send Report
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Common Help Topics</h2>
            
            <div className="relative w-full mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search articles..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 text-gray-900 border border-gray-200 rounded-full py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#153B44]/20 focus:border-[#153B44] transition-all"
              />
            </div>

            <div className="flex flex-col gap-3">
              {filteredFaqs.length === 0 ? (
                <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <p className="text-gray-500 text-sm">No topics found matching "{searchQuery}"</p>
                </div>
              ) : (
                filteredFaqs.map((faq, index) => {
                  const isOpen = openFaq === index;
                  return (
                    <div 
                      key={index} 
                      className={cn(
                        "border border-gray-200 rounded-xl transition-all duration-200 bg-white overflow-hidden",
                        isOpen ? "shadow-sm border-[#153B44]/30 ring-1 ring-[#153B44]/10" : "hover:border-gray-300 hover:bg-gray-50/50"
                      )}
                    >
                      <button 
                        onClick={() => toggleFaq(index)}
                        className="w-full flex items-center justify-between p-4 text-left focus:outline-none group"
                      >
                        <div className="flex flex-col gap-1 pr-4">
                          <span className="text-[10px] font-bold tracking-wider uppercase text-[#52B788]">{faq.category}</span>
                          <span className="font-bold text-gray-900 text-sm group-hover:text-[#153B44] transition-colors">{faq.question}</span>
                        </div>
                        {isOpen ? (
                          <ChevronUp className="w-5 h-5 text-gray-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                        )}
                      </button>
                      <div 
                        className={cn(
                          "px-4 overflow-hidden transition-all duration-300 ease-in-out bg-gray-50/50",
                          isOpen ? "max-h-96 pb-4 pt-2 opacity-100 border-t border-gray-100" : "max-h-0 opacity-0"
                        )}
                      >
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}