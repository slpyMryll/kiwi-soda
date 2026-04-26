"use client";

import { useState, useRef } from "react";
import { 
  User, 
  Mail, 
  Loader2, 
  CheckCircle2, 
  Shield, 
  Trash2, 
  Camera 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { updateProfile } from "@/lib/actions/user";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [fullName, setFullName] = useState(initialData.full_name || "");
  const [username, setUsername] = useState(initialData.username || "");
  const [avatarUrl, setAvatarUrl] = useState(initialData.avatar_url || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [shouldRemoveAvatar, setShouldRemoveAvatar] = useState(false);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if anything has actually changed compared to initial data
  const hasChanges = 
    fullName !== initialData.full_name || 
    username !== initialData.username || 
    avatarFile !== null || 
    (shouldRemoveAvatar && initialData.avatar_url !== null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Prevent duplicate selection of the same file
    if (avatarFile && avatarFile.name === file.name && avatarFile.size === file.size) {
      return;
    }

    setAvatarFile(file);
    setShouldRemoveAvatar(false);
    
    // Create preview URL
    const localUrl = URL.createObjectURL(file);
    setAvatarUrl(localUrl);
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl("");
    setAvatarFile(null);
    setShouldRemoveAvatar(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges) {
      toast.info("No changes detected.");
      return;
    }
    
    setIsSaving(true);
    
    try {
      const formData = new FormData();
      formData.append('full_name', fullName);
      formData.append('username', username);
      formData.append('current_avatar_url', initialData.avatar_url || "");
      
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      
      if (shouldRemoveAvatar) {
        formData.append('remove_avatar', 'true');
      }

      const result = await updateProfile(formData);
      
      if (result.error) {
        toast.error(result.error);
      } else {
        setIsSuccess(true);
        toast.success("Profile updated successfully!");
        if (result.avatar_url !== undefined) {
           setAvatarUrl(result.avatar_url || "");
        }
        setAvatarFile(null);
        
        // Force refresh to update header and other layout components
        router.refresh();
        
        setTimeout(() => setIsSuccess(false), 3000);
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
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
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <div 
                className="relative group cursor-pointer shrink-0" 
                onClick={() => fileInputRef.current?.click()}
                title="Change Avatar"
              >
                <div className="w-32 h-32 rounded-full bg-gray-50 border-4 border-white shadow-md flex items-center justify-center overflow-hidden relative transition-transform hover:scale-[1.02]">
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt="Avatar" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User className="w-12 h-12 text-gray-300" />
                  )}
                  
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-8 h-8 text-white mb-1" />
                    <span className="text-[10px] text-white font-bold uppercase tracking-wider">Upload</span>
                  </div>
                </div>
                
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                />
              </div>

              <div className="flex flex-col items-center md:items-start gap-1 flex-1">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center md:text-left">
                  {fullName || "Student Name"}
                </h2>
                <p className="text-gray-500 font-medium text-sm sm:text-base">
                  {initialData.email}
                </p>
                <Badge variant="outline" className="mt-2 bg-[#E6F4EA] text-[#1B4332] border-[#1B4332]/10 px-4 py-1.5 capitalize font-bold text-xs sm:text-sm">
                  {role.replace('-', ' ')}
                </Badge>
                
                {(avatarUrl || avatarFile) && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveAvatar();
                    }}
                    className="mt-4 flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove Picture
                  </button>
                )}
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
              disabled={isSaving || !hasChanges}
              className="bg-[#153B44] hover:bg-[#1B4B57] text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:bg-gray-400 min-w-[150px]"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> :
               isSuccess ? <><CheckCircle2 className="w-4 h-4 text-[#52B788]" /> Saved!</> :
               !hasChanges ? "No Changes" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
