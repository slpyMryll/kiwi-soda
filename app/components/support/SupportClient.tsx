"use client";

import { useState, useRef } from "react";
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Send,
  HelpCircle,
  Loader2,
  CheckCircle2,
  Trash2, 
  Paperclip
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SUPPORT_FAQS } from "@/lib/constants/faqs";
import emailjs from "@emailjs/browser";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export function SupportClient({ userEmail, userId }: { userEmail?: string; userId?: string }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0); 
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const filteredFaqs = SUPPORT_FAQS.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const validateAndSetFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }
    setAttachment(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSetFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSetFile(file);
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmitReport = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const supabase = createClient();
    let publicAttachmentUrl = "";

    try {
      // 1. Handle Attachment Upload if exists
      if (attachment && userId) {
        const fileExt = attachment.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${userId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('support-attachments')
          .upload(filePath, attachment);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('support-attachments')
          .getPublicUrl(filePath);
        
        publicAttachmentUrl = publicUrl;
      }

      // 2. Prepare EmailJS Params
      const templateParams = {
        from_email: userEmail || "Guest User",
        subject: formData.get("subject"),
        issue_type: formData.get("issueType"),
        priority: formData.get("priority"),
        message: formData.get("description"),
        attachment_url: publicAttachmentUrl || "No attachment provided",
        to_email: "ontrack.techsupport@gmail.com"
      };

      // 3. Send Email
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "",
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "",
        templateParams,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || ""
      );

      setIsSuccess(true);
      toast.success("Support ticket sent successfully!");
      setAttachment(null);
      (e.target as HTMLFormElement).reset();
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error: any) {
      console.error("Support Error:", error);
      toast.error(error.message || "Failed to send report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
                    <select name="issueType" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#153B44]/20 focus:border-[#153B44] transition-all">
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
                    <select name="priority" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#153B44]/20 focus:border-[#153B44] transition-all">
                      <option value="low">Low - General Inquiry</option>
                      <option value="medium">Medium - Needs Attention</option>
                      <option value="high">High - Blocking my work</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1.5">Subject</label>
                  <input 
                    name="subject"
                    type="text" 
                    required 
                    placeholder="Brief summary of the issue"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#153B44]/20 focus:border-[#153B44] transition-all"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1.5">Description</label>
                  <textarea 
                    name="description"
                    required 
                    rows={6}
                    placeholder="Please provide as much detail as possible so we can help you faster..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#153B44]/20 focus:border-[#153B44] transition-all resize-none custom-scrollbar"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1.5">
                    Attachments <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx"
                  />

                  {!attachment ? (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={cn(
                        "border-2 border-dashed rounded-xl px-4 py-6 text-center transition-all cursor-pointer group",
                        isDragging 
                          ? "border-[#153B44] bg-[#E6F4EA]" 
                          : "border-gray-200 hover:bg-gray-50 hover:border-[#153B44]/30"
                      )}
                    >
                      <Paperclip className={cn(
                        "w-5 h-5 mx-auto mb-2 transition-colors",
                        isDragging ? "text-[#153B44]" : "text-gray-400 group-hover:text-[#153B44]"
                      )} />
                      <p className="text-sm text-gray-500 font-medium">Click to upload or drag & drop</p>
                      <p className="text-xs text-gray-400 mt-1">Images, PDF or DOC (max. 5MB)</p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 animate-in fade-in zoom-in-95 duration-200">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-[#E6F4EA] flex items-center justify-center shrink-0">
                          <Paperclip className="w-4 h-4 text-[#1B4332]" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <p className="text-xs font-bold text-gray-900 truncate">{attachment.name}</p>
                          <p className="text-[10px] text-gray-500">{(attachment.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={handleRemoveAttachment}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
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
                  <p className="text-gray-500 text-sm">No topics found matching &quot;{searchQuery}&quot;</p>
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

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500 mb-2">Still need help?</p>
              <a 
                href="mailto:ontrack.techsupport@gmail.com" 
                className="text-[#153B44] font-bold hover:underline flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                ontrack.techsupport@gmail.com
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
