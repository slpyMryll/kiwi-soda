"use client";
import Link from "next/link";
import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { resetPassword } from "@/lib/actions/auth";
import { User, ChevronLeft } from "lucide-react";
import { getBorderClass } from "@/lib/utils/ui-helpers";
import { validateVsuEmail } from "@/lib/utils/validation";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [messageChannel, setMessageChannel] = useState("");
    const isEmailValid = useMemo(() => validateVsuEmail(email), [email]);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleReset= async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isEmailValid) {
            setMessageChannel("Please enter a valid @vsu.edu.ph email.");
            return;
        }
        const origin = window.location.origin;
        const result = await resetPassword(email, origin);
        if (result?.error) {
            setMessageChannel(`Error: ${result.error}`);
        } else {
            setMessageChannel("If an account with that email exists, a reset link has been sent.");
        }
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
            Forgot Your Password?
          </h1>
          <p className="text-gray-500 text-sm">
            Enter your VSU email to receive password reset link.
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-6">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-bold text-green-dark ml-1 text-left">
              Email
            </label>
            <div className="relative group">
              <User
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${email ? "text-green-600" : "text-gray-400"}`}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your VSU email"
                required
                className={`w-full bg-white border-b-2 py-4 pl-12 pr-4 text-sm focus:outline-none transition-all ${getBorderClass(isEmailValid, email, isSubmitted)}`}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#1B4332] text-white font-bold py-4 rounded-2xl shadow-lg transition-all duration-300 lg:hover:bg-green-900 lg:hover:scale-[1.02] active:scale-95"
          >
            Send Reset Link
          </button>
          <p>{messageChannel}</p>
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
