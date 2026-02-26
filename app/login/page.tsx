"use client";
import Image from "next/image";
import { Mail, Lock } from "lucide-react";
import { signInWithGoogle, signInWithEmail } from "./actions";
import { useState, useRef } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleGoogleSignIn = async () => {
    const origin = window.location.origin;
    const result = await signInWithGoogle(origin);

    if (result?.error) {
      alert(result.error);
    }
  };
  const formRef = useRef<HTMLFormElement>(null);

  const handleFormAction = async (formData: FormData) => {
    const result = await signInWithEmail(formData);
    if (result?.error) {
      alert(result.error); 
    }
  };
  return (
    <main className="min-h-screen w-full bg-surface-brand flex items-stretch justify-center px-14 py-10 gap-14">
      <section className="flex-1 bg-white  rounded-2xl px-14 py-6 justify-center">
        <div className="flex gap-3">
          <img src="logov3.png" alt="OnTrack" className="w-9 h-9" />
          <h1 className="text-header text-3xl mb-12">Ontrack</h1>
        </div>
        <h1 className="text-2xl font-medium ">Welcome To OnTrack</h1>
        <p className="font-medium text-sm mb-6">
          Login to access USSC project updates and budget tracking.
        </p>

        <form ref={formRef} action={handleFormAction} className="space-y-6">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-bold text-text-header ml-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
              name="email"
                type="email"
                required
                placeholder="Enter your VSU email"
                className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-vsu-green-dark/20 transition-all shadow-sm"
              />
            </div>
          </div>
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-bold text-text-header ml-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
              name="password"
                type="password"
                required
                placeholder="Enter your password"
                className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-vsu-green-dark/20 transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="text-right">
            <button
              type="button"
              className="text-xs font-bold text-text-header hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          <button type="submit" className="w-full bg-green-dark text-white font-bold py-4 rounded-2xl transition-all duration-300 ease-in-out hover:bg-opacity-90 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl active:scale-[0.98] shadow-lg">
            Sign In
          </button>
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300"></span>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 text-gray-500">or</span>
            </div>
          </div>

          <button
            type="button"
            className="group w-full bg-transparent border border-vsu-green-dark/30 text-text-header font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 ease-out hover:bg-white hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
            onClick={handleGoogleSignIn}
          >
            <svg
              className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:rotate-12"
              viewBox="0 0 24 24"
              fill="var(--color-green-dark)"
            >
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>
        </form>
      </section>
      <section className="flex-1/6 bg-none">
        <div className="flex items-center justify-center h-full">
          <div className="px-8 py-18">
            <h1 className="text-white text-4xl font-bold leading-tight mb-10 font-inter">
              Fostering Trust
              <br />
              Through Transparency
            </h1>

            <div className="relative">
              <span className="text-white text-7xl font-sans leading-none absolute -top-4 -left-2 opacity-90 ">
                “
              </span>

              <div className="p-4 mt-6">
                <p className="text-white text-xl leading-relaxe font-inter">
                  Ontrack bridges the gap for students who want to know what the
                  council is doing with their contributions, ensuring every
                  project maintains the utmost security and visibility.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
