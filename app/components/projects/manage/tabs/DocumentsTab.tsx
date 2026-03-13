"use client";

import { useState, useRef } from "react";
import { FileText, Download, Trash2, Plus, Loader2, FileArchive, File as FileBlank, FileSpreadsheet } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { uploadDocument, deleteDocument } from "@/lib/actions/project-details";

export function DocumentsTab({ project }: { project: any }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const documents = project.documents || [];

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    const allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'zip'];
    const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
    
    if (!fileExt || !allowedExtensions.includes(fileExt)) {
      alert("Invalid file type. Only PDF, Word, Excel, and ZIP files are allowed.");
      setSelectedFile(null);
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    
    const res = await uploadDocument(project.id, formData);
    setIsLoading(false);
    
    if (res?.error) {
      alert(`Upload Error: ${res.error}`);
    } else {
      setOpen(false);
      setSelectedFile(null);
    }
  };

  const handleDelete = async (docId: string, url: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    
    setIsLoading(true);
    const res = await deleteDocument(project.id, docId, url);
    setIsLoading(false);
    
    if (res?.error) alert(`Delete Error: ${res.error}`);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    
    if (lowerName.endsWith('.pdf')) {
      return <FileText className="w-10 h-10 text-red-500" />;
    }
    if (lowerName.endsWith('.doc') || lowerName.endsWith('.docx')) {
      return <FileText className="w-10 h-10 text-blue-500" />;
    }
    if (lowerName.endsWith('.xls') || lowerName.endsWith('.xlsx')) {
      return <FileSpreadsheet className="w-10 h-10 text-[#52B788]" />;
    }
    if (lowerName.endsWith('.zip') || lowerName.endsWith('.rar')) {
      return <FileArchive className="w-10 h-10 text-orange-500" />;
    }
    
    return <FileBlank className="w-10 h-10 text-gray-500" />;
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#153B44]">Project Documents</h2>
          <p className="text-sm text-gray-500 mt-1">Upload and manage files related to this project.</p>
        </div>
        
        <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if(!isOpen) setSelectedFile(null); }}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 bg-[#1B4332] hover:bg-green-900 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm shrink-0">
              <Plus className="w-4 h-4" /> Upload File
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Upload Document</DialogTitle></DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4 mt-4 w-full">
              
              <div 
                className="border-2 border-dashed border-gray-300 rounded-xl p-6 sm:p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer flex flex-col items-center justify-center w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  className="hidden" 
                  ref={fileInputRef} 
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.zip"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
                <FileText className="w-10 h-10 text-gray-400 mb-3 shrink-0" />
                
                {selectedFile ? (
                  <div className="w-full px-2 sm:px-4 flex flex-col items-center justify-center">
                    <p className="text-sm font-bold text-[#153B44] text-center w-full break-all whitespace-normal leading-relaxed">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-2 shrink-0">{formatBytes(selectedFile.size)}</p>
                  </div>
                ) : (
                  <div className="w-full">
                    <p className="text-sm font-bold text-gray-700">Click to browse files</p>
                    <p className="text-xs text-gray-500 mt-1">Upload PDFs, Word, Excel, or ZIP files</p>
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                disabled={isLoading || !selectedFile} 
                className="w-full bg-[#1B4332] hover:bg-green-900 text-white font-bold py-3 rounded-xl flex justify-center disabled:opacity-50 transition-colors"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Upload"}
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* --- REBUILT LIST LAYOUT MATCHING YOUR IMAGE --- */}
      <div className="flex flex-col gap-3">
        {documents.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
            <FileBlank className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-gray-900">No documents yet</h3>
            <p className="text-sm text-gray-500 mt-1">Upload permits, receipts, or design assets here.</p>
          </div>
        ) : (
          documents.map((doc: any) => (
            <div 
              key={doc.id} 
              className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white hover:border-[#1B4332] hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-4 min-w-0 flex-1">
                {/* File Icon */}
                <div className="shrink-0 p-2 bg-gray-50 rounded-lg">
                  {getFileIcon(doc.name)}
                </div>
                
                {/* File Details */}
                <div className="flex flex-col gap-1 min-w-0">
                  <h4 className="text-sm font-bold text-[#153B44] truncate" title={doc.name}>
                    {doc.name}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                    <span>{formatBytes(doc.size)}</span>
                    <span>•</span>
                    <span>{doc.date}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 ml-4">
                <a 
                  href={`${doc.url}?download=${encodeURIComponent(doc.name)}`} 
                  download={doc.name}
                  className="p-2.5 text-gray-500 hover:text-[#1B4332] bg-gray-50 hover:bg-green-50 rounded-lg transition-colors"
                  title="Download File"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button 
                  onClick={() => handleDelete(doc.id, doc.url)}
                  disabled={isLoading}
                  className="p-2.5 text-gray-500 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Delete File"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}