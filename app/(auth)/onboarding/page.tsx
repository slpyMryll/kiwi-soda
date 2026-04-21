"use client";
import Link from "next/link";
import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { User, AtSign, Lock, Eye, EyeOff, ChevronLeft } from "lucide-react";
import { toast } from "sonner";

export default function Onboarding() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const supabase = createClient();

  const isNameValid = useMemo(() => name.trim().length > 0, [name]);
  const isUsernameValid = useMemo(() => username.trim().length > 0, [username]);
  const isPasswordValid = useMemo(() => password.length >= 8, [password]);

  const getBorderClass = (isValid: boolean, value: string) => {
    if (!isSubmitted && !value)
      return "border-gray-300 focus:border-green-dark";
    return isValid
      ? "border-green-600 focus:border-green-600 shadow-[0_0_0_1px_rgba(22,101,52,0.1)]"
      : "border-red-500 focus:border-red-500 shadow-[0_0_0_1px_rgba(239,68,68,0.1)]";
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    if (!isNameValid || !isUsernameValid || !isPasswordValid) return;

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      toast.error("Session expired. Please log in again.");
      return;
    }

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: name,
      username: username,
      email: user.email,
      has_completed_onboarding: true,
    });

    if (profileError) {
      toast.error(`Profile Error: ${profileError.message}`);
      return;
    }

    const { error: authError } = await supabase.auth.updateUser({
      password: password,
    });
    if (authError) {
      toast.error(`Auth Error: ${authError.message} (Try a stronger password)`);
      return;
    }

    await supabase.auth.refreshSession();
    toast.success("Account setup complete!");
    setTimeout(() => {
      window.location.href = "/viewer";
    }, 200);
  };

  return (
    <main className="min-h-screen w-full bg-surface-brand flex flex-col-reverse lg:flex-row items-stretch justify-center lg:px-14 lg:py-1 lg:gap-14">
      <section className="relative flex-1 bg-white rounded-t-[40px] lg:rounded-2xl px-8 py-10 lg:px-14 lg:py-8 shadow-2xl self-end lg:self-center w-full max-w-2xl mx-auto z-10 transition-all duration-500">
        <Link
          href="/login"
          className="absolute top-6 left-6 flex items-center gap-1 text-sm font-bold text-gray-400 hover:text-green-dark transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back
        </Link>

        <div className="hidden lg:flex gap-3 mb-8 mt-4">
          <img src="logov3.png" alt="OnTrack" className="w-9 h-9" />
          <h1 className="text-header text-3xl font-bold">OnTrack</h1>
        </div>

        <div className="text-center lg:text-left mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-green-dark mb-2">
            Finish Setting Up
          </h1>
          <p className="text-gray-500 text-sm">
            Create a password to use the manual login form next time.
          </p>
        </div>

        <form onSubmit={handleComplete} className="space-y-6">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-bold text-green-dark ml-1 text-left">
              Full Name
            </label>
            <div className="relative group">
              <User
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${name ? "text-green-600" : "text-gray-400"}`}
              />
              <input
                type="text"
                required
                placeholder="Enter your full name"
                onChange={(e) => setName(e.target.value)}
                className={`w-full bg-white border-b-2 py-4 pl-12 pr-4 text-sm focus:outline-none transition-all ${getBorderClass(isNameValid, name)}`}
              />
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-bold text-green-dark ml-1 text-left">
              Username
            </label>
            <div className="relative group">
              <AtSign
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${username ? "text-green-600" : "text-gray-400"}`}
              />
              <input
                type="text"
                required
                placeholder="Choose a username"
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full bg-white border-b-2 py-4 pl-12 pr-4 text-sm focus:outline-none transition-all ${getBorderClass(isUsernameValid, username)}`}
              />
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-bold text-green-dark ml-1 text-left">
              Create Password
            </label>
            <div className="relative group">
              <Lock
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${password ? (isPasswordValid ? "text-green-600" : "text-red-500") : "text-gray-400"}`}
              />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Minimum 8 characters"
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full bg-white border-b-2 py-4 pl-12 pr-12 text-sm focus:outline-none transition-all ${getBorderClass(isPasswordValid, password)}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-dark transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {isSubmitted && !isPasswordValid && (
              <p className="text-[10px] text-red-500 ml-1 text-left">
                Password must be at least 8 characters
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-[#1B4332] text-white font-bold py-4 rounded-2xl shadow-lg transition-all duration-300 lg:hover:bg-green-900 lg:hover:scale-[1.02] active:scale-95"
          >
            Complete Setup
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
