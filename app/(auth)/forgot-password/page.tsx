"use client";
import Link from "next/link";
import { useState, useMemo } from "react";
import { resetPassword } from "@/lib/actions/auth";
import { User, ChevronLeft, MailCheck, AlertCircle, Loader2 } from "lucide-react";
import { getBorderClass } from "@/lib/utils/ui-helpers";
import { validateVsuEmail } from "@/lib/utils/validation";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const isEmailValid = useMemo(() => validateVsuEmail(email), [email]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setError("");

    if (!isEmailValid) return;

    setIsLoading(true);
    const origin = window.location.origin;
    const result = await resetPassword(email, origin);
    
    setIsLoading(false);

    if (result?.error) {
      setError(result.error);
    } else {
      setIsSuccess(true);
    }
  };

  return (
    <main className="min-h-screen w-full bg-surface-brand flex flex-col-reverse lg:flex-row items-stretch justify-center lg:px-14 lg:py-1 lg:gap-14">
      <section className="relative flex-1 bg-white rounded-t-[40px] lg:rounded-2xl px-8 py-10 lg:px-14 lg:py-8 shadow-2xl self-end lg:self-center w-full max-w-2xl mx-auto z-10">
        <Link
          href="/login"
          className="absolute top-6 left-6 flex items-center gap-1 text-sm font-bold text-gray-400 hover:text-green-dark transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Login
        </Link>

        <div className="hidden lg:flex gap-3 mb-8 mt-4">
          <img src="logov3.png" alt="OnTrack" className="w-9 h-9" />
          <h1 className="text-header text-3xl font-bold">OnTrack</h1>
        </div>

        {isSuccess ? (
          <div className="py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                <MailCheck className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-green-dark mb-3">
                Check Your Email
              </h1>
              <p className="text-gray-500 text-sm max-w-sm leading-relaxed mb-8">
                We've sent a password reset link to <span className="font-bold text-gray-800">{email}</span>. 
                Please follow the instructions in the email to secure your account.
              </p>
              
              <div className="w-full space-y-3">
                <button 
                  onClick={() => setIsSuccess(false)}
                  className="w-full bg-green-dark text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-green-900 transition-all"
                >
                  Back to Forgot Password
                </button>
                <p className="text-xs text-gray-400">
                  Didn't receive the email? Check your spam folder.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center lg:text-left mb-8">
              <h1 className="text-2xl lg:text-3xl font-bold text-green-dark mb-2">
                Forgot Your Password?
              </h1>
              <p className="text-gray-500 text-sm leading-relaxed">
                Enter your VSU email below. If your account exists, we'll send you a link to reset your password.
              </p>
            </div>

            <form onSubmit={handleReset} className="space-y-6">
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-bold text-green-dark ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <User
                    className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${
                      email ? (isEmailValid ? "text-green-600" : "text-red-500") : "text-gray-400"
                    }`}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="22-1-0XXXX@vsu.edu.ph"
                    required
                    disabled={isLoading}
                    className={`w-full bg-white border-b-2 py-4 pl-12 pr-4 text-sm focus:outline-none transition-all ${getBorderClass(isEmailValid, email, isSubmitted)}`}
                  />
                </div>
                {error && (
                  <div className="flex items-center gap-2 text-red-500 mt-2 px-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <p className="text-[10px] font-medium">{error}</p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1B4332] text-white font-bold py-4 rounded-2xl shadow-lg transition-all duration-300 lg:hover:bg-green-900 lg:hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending Link...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>
          </>
        )}
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