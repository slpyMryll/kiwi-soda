"use client";
import { useState } from "react";
import { updatePasswordAction } from "@/lib/actions/auth";
import { Lock, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleAction = async (formData: FormData) => {
    const result = await updatePasswordAction(formData);
    if (result?.error) {
      toast.error(result.error);
    } else if (result?.path) {
      toast.success("Password updated successfully!");
      setTimeout(() => {
        router.push(result.path);
      }, 200);
    }
  };

  return (
     <main className="min-h-screen w-full bg-surface-brand flex flex-col-reverse lg:flex-row items-stretch justify-center lg:px-14 lg:py-1 lg:gap-14">
      <section className="relative flex-1 bg-white rounded-t-[40px] lg:rounded-2xl px-8 py-10 lg:px-14 lg:py-8 shadow-2xl self-end lg:self-center w-full max-w-2xl mx-auto z-10 transition-all duration-500">
        <button
          onClick={() => window.history.length > 1 ? router.back() : router.push("/forgot-password")}
          className="absolute top-6 left-6 flex items-center gap-1 text-sm font-bold text-gray-400 hover:text-green-dark transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back
        </button>
         <div className="hidden lg:flex gap-3 mb-8 mt-4">
          <img src="logov3.png" alt="OnTrack" className="w-9 h-9" />
          <h1 className="text-header text-3xl font-bold">OnTrack</h1>
        </div>

        <div className="text-center lg:text-left mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-green-dark mb-2">
            Update Your Password
          </h1>
          <p className="text-gray-500 text-sm">
            Create a new password to secure your account.
          </p>
        </div>

        <form action={handleAction} className="space-y-6">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-bold text-green-dark">New Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full border-b-2 border-gray-300 py-4 pl-12 pr-12 text-sm focus:outline-none focus:border-green-dark"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button type="submit" className="w-full bg-[#1B4332] text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-green-900 transition-all">
            Update Password
          </button>
        </form>
      </section>
       <section className="flex flex-col justify-center items-center lg:items-start lg:flex-1 p-8 lg:p-0">
        <div className="flex items-center gap-3 mb-6 lg:hidden">
          <img src="logov3.png" alt="OnTrack" className="w-10 h-10" />
          <h1 className="text-white text-3xl font-bold">OnTrack</h1>
        </div>
        <div className="hidden lg:block lg:px-8">
          <h1 className="text-white text-5xl font-bold leading-tight mb-10 font-inter">
            Fostering Trust
            <br />
            Through Transparency
          </h1>
          <div className="relative">
            <span className="text-white text-7xl font-sans leading-none absolute -top-4 -left-2 opacity-90">
              “
            </span>
            <div className="p-4 mt-6">
              <p className="text-white text-xl leading-relaxed font-inter opacity-90">
                "Ontrack bridges the gap for students who want to know what the
                council is doing with their contributions, ensuring every
                project maintains the utmost security and visibility."
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}