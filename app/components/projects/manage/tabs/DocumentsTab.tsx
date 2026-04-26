"use client";

import { useState, useRef, useEffect } from "react";
import {
  FileText,
  CloudDownload,
  Trash2,
  Plus,
  Loader2,
  FileArchive,
  File as FileBlank,
  FileSpreadsheet,
  Pin,
  PinOff,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { uploadDocument, deleteDocument, togglePinDocument } from "@/lib/actions/project-details";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function DocumentsTab({ project }: { project: any }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [localDocuments, setLocalDocuments] = useState(project.documents || []);

  useEffect(() => {
    // Sort documents: Pinned first, then by date descending
    const sorted = [...(project.documents || [])].sort((a: any, b: any) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    setLocalDocuments(sorted);
  }, [project.documents]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("realtime-docs")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "project_documents",
          filter: `project_id=eq.${project.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newDoc = {
              id: payload.new.id,
              name: payload.new.name,
              url: payload.new.file_url,
              size: payload.new.file_size,
              type: payload.new.file_type,
              uploadedBy: "Project Team", 
              date: new Date(payload.new.created_at).toLocaleDateString(),
              isPinned: payload.new.is_pinned || false,
            };
            setLocalDocuments((prev: any) => {
              const updated = [newDoc, ...prev];
              return updated.sort((a: any, b: any) => {
                if (a.isPinned && !b.isPinned) return -1;
                if (!a.isPinned && b.isPinned) return 1;
                return new Date(b.date).getTime() - new Date(a.date).getTime();
              });
            });
          } else if (payload.eventType === "DELETE") {
            setLocalDocuments((prev: any) =>
              prev.filter((d: any) => d.id !== payload.old.id),
            );
          } else if (payload.eventType === "UPDATE") {
            setLocalDocuments((prev: any) => {
              const updated = prev.map((d: any) => 
                d.id === payload.new.id 
                  ? { ...d, isPinned: payload.new.is_pinned } 
                  : d
              );
              return updated.sort((a: any, b: any) => {
                if (a.isPinned && !b.isPinned) return -1;
                if (!a.isPinned && b.isPinned) return 1;
                return new Date(b.date).getTime() - new Date(a.date).getTime();
              });
            });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [project.id]);

  const handleFileSelection = (file: File | undefined | null) => {
    if (!file) return;

    const allowedExtensions = ["pdf", "doc", "docx", "xls", "xlsx", "zip"];
    const fileExt = file.name.split(".").pop()?.toLowerCase();

    if (!fileExt || !allowedExtensions.includes(fileExt)) {
      toast.error(
        "Invalid file type. Only PDF, Word, Excel, and ZIP files are allowed.",
      );
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    const res = await uploadDocument(project.id, formData);
    setIsLoading(false);

    if (res?.error) {
      toast.error(`Upload Error: ${res.error}`);
    } else {
      setOpen(false);
      setSelectedFile(null);
      toast.success("Document uploaded successfully");
    }
  };

  const handleDelete = async (docId: string, url: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    // Optimistic update
    const previousDocs = [...localDocuments];
    setLocalDocuments((prev: any[]) => prev.filter((d: any) => d.id !== docId));

    setIsLoading(true);
    const res = await deleteDocument(project.id, docId, url);
    setIsLoading(false);

    if (res?.error) {
      setLocalDocuments(previousDocs); // Rollback
      toast.error(`Delete Error: ${res.error}`);
    } else {
      toast.success("Document deleted successfully");
    }
  };

  const handleTogglePin = async (docId: string, currentStatus: boolean) => {
    // Optimistic update
    const previousDocs = [...localDocuments];
    setLocalDocuments((prev: any[]) => {
      const updated = prev.map((d: any) => d.id === docId ? { ...d, isPinned: !currentStatus } : d);
      return updated.sort((a: any, b: any) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
    });

    const res = await togglePinDocument(project.id, docId, currentStatus);

    if (res?.error) {
      setLocalDocuments(previousDocs); // Rollback
      toast.error(`Error: ${res.error}`);
    } else {
      toast.success(currentStatus ? "Document unpinned" : "Document pinned");
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getFileIcon = (name: string) => {
    const lowerName = name.toLowerCase();

    if (lowerName.endsWith(".pdf")) {
      return <FileText className="w-8 sm:w-10 h-8 sm:h-10 text-red-500" />;
    }
    if (lowerName.endsWith(".doc") || lowerName.endsWith(".docx")) {
      return <FileText className="w-8 sm:w-10 h-8 sm:h-10 text-blue-500" />;
    }
    if (lowerName.endsWith(".xls") || lowerName.endsWith(".xlsx")) {
      return (
        <FileSpreadsheet className="w-8 sm:w-10 h-8 sm:h-10 text-[#52B788]" />
      );
    }
    if (lowerName.endsWith(".zip") || lowerName.endsWith(".rar")) {
      return (
        <FileArchive className="w-8 sm:w-10 h-8 sm:h-10 text-orange-500" />
      );
    }

    return <FileBlank className="w-8 sm:w-10 h-8 sm:h-10 text-gray-500" />;
  };

  return (
    <div className="bg-white p-5 sm:p-8 rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="w-full sm:w-auto">
          <h2 className="text-xl font-bold text-[#153B44]">
            Project Documents
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Upload and manage files related to this project.
          </p>
        </div>

        <Dialog
          open={open}
          onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) setSelectedFile(null);
            setIsDragging(false);
          }}
        >
          <DialogTrigger asChild>
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#1B4332] hover:bg-green-900 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm shrink-0">
              <Plus className="w-4 h-4" /> Upload File
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md w-[95vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4 mt-4 w-full">
              <div
                className={`border-2 border-dashed rounded-xl p-5 sm:p-8 text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center w-full ${
                  isDragging
                    ? "border-[#1B4332] bg-[#E6F4EA] scale-[1.02]"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  className="hidden"
                  ref={fileInputRef}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.zip"
                  onChange={(e) => handleFileSelection(e.target.files?.[0])}
                />
                <FileText
                  className={`w-8 h-8 sm:w-10 sm:h-10 mb-3 shrink-0 transition-colors ${isDragging ? "text-[#1B4332]" : "text-gray-400"}`}
                />

                {selectedFile ? (
                  <div className="w-full px-2 sm:px-4 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-xs sm:text-sm font-bold text-[#153B44] text-center w-full break-all whitespace-normal leading-relaxed">
                      {selectedFile.name}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-2 shrink-0">
                      {formatBytes(selectedFile.size)}
                    </p>
                  </div>
                ) : (
                  <div className="w-full pointer-events-none">
                    <p
                      className={`text-sm font-bold ${isDragging ? "text-[#1B4332]" : "text-gray-700"}`}
                    >
                      {isDragging
                        ? "Drop file to upload"
                        : "Click or Drag & Drop to upload"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 px-4">
                      Upload PDFs, Word, Excel, or ZIP files
                    </p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || !selectedFile}
                className="w-full bg-[#1B4332] hover:bg-green-900 text-white font-bold py-3 rounded-xl flex justify-center disabled:opacity-50 transition-colors"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Confirm Upload"
                )}
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-3 sm:gap-4">
        {localDocuments.length === 0 ? (
          <div className="py-10 sm:py-12 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50 px-4">
            <FileBlank className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-gray-900">
              No documents yet
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Upload permits, receipts, or design assets here.
            </p>
          </div>
        ) : (
          localDocuments.map((doc: any) => (
            <div
              key={doc.id}
              className={cn(
                "flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-xl border transition-all group gap-3 sm:gap-4 bg-white",
                doc.isPinned 
                  ? "border-[#1B4332] bg-green-50/30 shadow-sm" 
                  : "border-gray-200 hover:border-[#1B4332] hover:shadow-sm"
              )}
            >
              <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0 flex-1 w-full">
                <div className="shrink-0 p-2 sm:p-2 bg-gray-50 rounded-lg">
                  {getFileIcon(doc.name)}
                </div>

                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4
                      className="text-sm font-bold text-[#153B44] break-all leading-tight pr-2"
                      title={doc.name}
                    >
                      {doc.name}
                    </h4>
                    {doc.isPinned && (
                      <Pin className="w-3 h-3 text-[#1B4332] fill-[#1B4332] shrink-0" />
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10px] sm:text-xs font-medium text-gray-500">
                    <span className="whitespace-nowrap">
                      {formatBytes(doc.size)}
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span className="whitespace-nowrap">{doc.date}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="whitespace-nowrap text-[#1B4332]">by {doc.uploadedBy}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 shrink-0 self-end sm:self-auto w-full sm:w-auto border-t sm:border-0 border-gray-100 pt-3 sm:pt-0 mt-1 sm:mt-0">
                <button 
                  onClick={() => handleTogglePin(doc.id, doc.isPinned)}
                  className={cn(
                    "p-2 sm:p-2.5 rounded-lg transition-colors border border-gray-100 sm:border-transparent",
                    doc.isPinned 
                      ? "text-[#1B4332] bg-green-100 hover:bg-green-200" 
                      : "text-gray-400 hover:text-[#1B4332] bg-gray-50 hover:bg-green-50"
                  )}
                  title={doc.isPinned ? "Unpin Document" : "Pin Document"}
                >
                  {doc.isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                </button>
                <a
                  href={`${doc.url}?download=${encodeURIComponent(doc.name)}`}
                  download={doc.name}
                  className="p-2 sm:p-2.5 text-gray-500 hover:text-[#1B4332] bg-gray-50 hover:bg-green-50 rounded-lg transition-colors border border-gray-100 sm:border-transparent"
                  title="Cloud Download"
                >
                  <CloudDownload className="w-4 h-4" />
                </a>
                <button
                  onClick={() => handleDelete(doc.id, doc.url)}
                  disabled={isLoading}
                  className="p-2 sm:p-2.5 text-gray-500 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors border border-gray-100 sm:border-transparent disabled:opacity-50"
                  title="Delete File"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
