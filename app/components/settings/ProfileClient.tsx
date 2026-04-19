"use client";

import { useState, useRef } from "react";
import { 
  User, 
  Mail, 
  Loader2, 
  CheckCircle2, 
  Shield, 
  Trash2, 
  Upload 
} from "lucide-react";

interface ProfileData {
  id: string;
  email: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  position?: string; 
}

interface ProfileClientProps {
  role: "viewer" | "project-manager" | "admin";
  initialData: ProfileData;
}

export function ProfileClient({ role, initialData }: ProfileClientProps) {
  const [fullName, setFullName] = useState(initialData.full_name || "");
  const [username, setUsername] = useState(initialData.username || "");
  const [avatarUrl, setAvatarUrl] = useState(initialData.avatar_url || "");
  
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    setTimeout(() => {
      const fakeUrl = URL.createObjectURL(file);
      setAvatarUrl(fakeUrl);
      setIsUploading(false);
    }, 1500);
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    setTimeout(() => {
      setIsSaving(false);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    }, 1200);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2 border-b border-gray-200 pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#153B44] tracking-tight">
          Profile Settings
        </h1>
        <p className="text-gray-500 text-sm">
          Update your account information and manage your avatar.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <form onSubmit={handleSave}>
          <div className="p-6 sm:p-8 flex flex-col gap-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-gray-300" />
                  )}
                </div>
                {isUploading && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-full backdrop-blur-[1px]">
                    <Loader2 className="w-6 h-6 animate-spin text-[#153B44]" />
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-bold text-gray-900">Profile Picture</h3>
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 text-sm font-bold rounded-xl transition-all flex items-center gap-2 shadow-sm"
                  >
                    <Upload className="w-4 h-4" />
                    Upload New
                  </button>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="px-4 py-2.5 text-red-600 hover:bg-red-50 text-sm font-bold rounded-xl transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Recommended size: 256x256px. Maximum file size: 5MB.
                </p>
              </div>
            </div>

            <hr className="border-gray-100" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#153B44]/20 focus:border-[#153B44] transition-all"
                  placeholder="e.g., Juan Dela Cruz"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1.5">Username</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">@</span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#153B44]/20 focus:border-[#153B44] transition-all"
                    placeholder="juandelacruz"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={initialData.email}
                    disabled
                    className="w-full bg-gray-50 border border-gray-200 text-gray-500 rounded-xl py-3 pl-11 pr-4 text-sm cursor-not-allowed"
                  />
                </div>
                <p className="text-[11px] text-gray-500 mt-1.5">Email address cannot be changed.</p>
              </div>

              {role === "project-manager" && (
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1.5">Officer Position</label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={initialData.position || "Assigned Project Manager"}
                      disabled
                      className="w-full bg-gray-50 border border-gray-200 text-gray-500 rounded-xl py-3 pl-11 pr-4 text-sm cursor-not-allowed"
                    />
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1.5">Your official council position is locked.</p>
                </div>
              )}

            </div>
          </div>

          <div className="px-6 py-5 bg-gray-50 border-t border-gray-100 flex items-center justify-end rounded-b-3xl">
            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="bg-[#153B44] hover:bg-[#1B4B57] text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-80 min-w-[150px]"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> :
               isSuccess ? <><CheckCircle2 className="w-4 h-4 text-[#52B788]" /> Saved!</> :
               "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}