"use client";
import { useEffect, useState } from "react";
import { updatePasswordAction } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/client";
import { Lock, Eye, EyeOff, ChevronLeft, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    async function verifySession() {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      const isVerified = searchParams.get('verified') === 'true';

      if (authError || !user) {
        console.error("No active session found. Redirecting to login.");
        router.replace("/login?error=session-expired");
      } else if (!isVerified) {
        console.warn("Manual access attempt. Redirecting to dashboard.");
        router.replace("/dashboard-redirect");
      } else {
        setIsVerifying(false);
      }
    }
    verifySession();
  }, [router, supabase, searchParams]);

  const handleAction = async (formData: FormData) => {
    setIsSubmitting(true);
    setError("");
    
    const result = await updatePasswordAction(formData);
    
    if (result?.error) {
      setError(result.error);
      setIsSubmitting(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface-brand gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-white" />
        <p className="text-white font-medium animate-pulse">Verifying reset session...</p>
      </div>
    );
  }

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
          <img src="/logov3.png" alt="OnTrack" className="w-9 h-9" />
          <h1 className="text-header text-3xl font-bold">OnTrack</h1>
        </div>

        <div className="text-center lg:text-left mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-green-dark mb-2">
            Secure Your Account
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            Your identity has been verified. Please set a new secure password for your VSU account.
          </p>
        </div>

        <form action={handleAction} className="space-y-6">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-bold text-green-dark ml-1">New Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                disabled={isSubmitting}
                className="w-full border-b-2 border-gray-300 py-4 pl-12 pr-12 text-sm focus:outline-none focus:border-green-dark transition-all disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-dark transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {error && <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>}
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting || password.length < 8}
            className="w-full bg-[#1B4332] text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-green-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Password"
            )}
          </button>
        </form>
      </section>

      <section className="flex flex-col justify-center items-center lg:items-start lg:flex-1 p-8 lg:p-0">
        <div className="hidden lg:block lg:px-8">
          <h1 className="text-white text-5xl font-bold leading-tight mb-10 font-inter">
            Fostering Trust<br />Through Transparency
          </h1>
          <div className="relative">
            <span className="text-white text-7xl font-sans leading-none absolute -top-4 -left-2 opacity-90">“</span>
            <div className="p-4 mt-6">
              <p className="text-white text-xl leading-relaxed font-inter opacity-90">
                "Security is the foundation of transparency. Change your password to ensure your project data remains protected."
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}