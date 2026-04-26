"use client";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, ChevronLeft, Loader2 } from "lucide-react";
import { signInWithGoogle, signInWithEmail } from "@/lib/actions/auth";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getBorderClass } from "@/lib/utils/ui-helpers";
import { validateVsuEmail } from "@/lib/utils/validation";
import { toast } from "sonner";

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  
  const isEmailValid = useMemo(() => validateVsuEmail(email), [email]);
  const isPasswordValid = useMemo(() => password.length >= 8, [password]);

  const handleGoogleSignIn = async () => {
    const origin = window.location.origin;
    toast.promise(signInWithGoogle(origin), {
      loading: 'Redirecting to Google...',
      error: (err) => err?.message || "Google Sign-In failed"
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    setIsSubmitted(true);
    
    if (!isEmailValid || !isPasswordValid) return;

    setIsSigningIn(true);
    const formData = new FormData(e.currentTarget);

    toast.promise(signInWithEmail(formData), {
      loading: 'Signing you in...',
      success: (result) => {
        if (result?.path) {
          router.push(result.path);
          return "Welcome back!";
        }
        return "Login successful";
      },
      error: (err) => {
        setIsSigningIn(false);
        return err?.message || "Login failed. Please check your credentials.";
      }
    });
  };
  
  return (
    <main className="min-h-screen w-full bg-surface-brand flex flex-col-reverse lg:flex-row items-stretch justify-center lg:px-14 lg:py-1 lg:gap-14">
      <section className="relative flex-1 bg-white rounded-t-[40px] lg:rounded-2xl px-8 py-10 lg:px-14 lg:py-8 shadow-2xl self-end lg:self-center w-full max-w-2xl mx-auto z-10 transition-all duration-500">
        
        {/* 🔥 FIX: Changed to router.back() for near-instant navigation using browser memory cache */}
        <button
          onClick={() => window.history.length > 1 ? router.back() : router.push("/")}
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
            Welcome to OnTrack
          </h1>
          <p className="text-gray-500 text-sm">
            Log in to access USSC updates and budget tracking.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-bold text-green-dark ml-1 text-left">
              Email
            </label>
            <div className="relative group">
              <Mail
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${email ? (isEmailValid ? "text-green-600" : "text-red-500") : "text-gray-400"}`}
              />
              <input
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your VSU email"
                disabled={isSigningIn}
                className={`w-full bg-white border-b-2 py-4 pl-12 pr-4 text-sm focus:outline-none transition-all disabled:opacity-50 ${getBorderClass(isEmailValid, email, isSubmitted)}`}
              />
            </div>
            {isSubmitted && !isEmailValid && (
              <p className="text-[10px] text-red-500 ml-1 text-left">
                Must be a valid @vsu.edu.ph email
              </p>
            )}
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-bold text-green-dark ml-1 text-left">
              Password
            </label>
            <div className="relative group">
              <Lock
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${password ? (isPasswordValid ? "text-green-600" : "text-red-500") : "text-gray-400"}`}
              />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={isSigningIn}
                className={`w-full bg-white border-b-2 py-4 pl-12 pr-12 text-sm focus:outline-none transition-all disabled:opacity-50 ${getBorderClass(isPasswordValid, password, isSubmitted)}`}
              />
              <button
                type="button"
                disabled={isSigningIn}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-dark transition-colors disabled:opacity-50"
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

          <div className="text-left">
            <Link
              href="/forgot-password"
              className="text-xs font-bold text-green-dark hover:underline hover:text-green-800 transition-colors"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSigningIn}
            className="w-full bg-[#1B4332] text-white font-bold py-4 rounded-2xl shadow-lg transition-all duration-300 hover:bg-green-900 disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {isSigningIn ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </button>

          <div className="relative flex items-center justify-center py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200"></span>
            </div>
            <span className="relative px-4 bg-white text-gray-400 text-xs">
              or
            </span>
          </div>

          <button
            type="button"
            disabled={isSigningIn}
            onClick={handleGoogleSignIn}
            className="w-full bg-white border border-gray-200 text-gray-700 font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 hover:bg-gray-50 hover:border-green-dark/30 shadow-sm disabled:opacity-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
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