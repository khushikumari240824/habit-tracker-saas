"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerRequest, ApiError } from "@/lib/api";
import { saveAuth } from "@/lib/auth";
import { Sun, Moon, Eye, EyeOff, Check } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const hasMinLength = password.length >= 6;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const strengthScore = [
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecial,
  ].filter(Boolean).length;

  const [theme, setThemeState] = useState<"dark" | "light">("dark");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const initialTheme = (localStorage.getItem("theme_preference") as "dark" | "light") || "dark";
      setThemeState(initialTheme);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setThemeState(nextTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("theme_preference", nextTheme);
      if (nextTheme === "light") {
        document.documentElement.classList.add("light");
      } else {
        document.documentElement.classList.remove("light");
      }
    }
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least one uppercase letter.");
      setLoading(false);
      return;
    }
    if (!/[a-z]/.test(password)) {
      setError("Password must contain at least one lowercase letter.");
      setLoading(false);
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError("Password must contain at least one number.");
      setLoading(false);
      return;
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      setError("Password must contain at least one special character.");
      setLoading(false);
      return;
    }

    try {
      const res = await registerRequest({ name, email, password });
      saveAuth(res.token, res.user);
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        const fieldErrors = err.errors
          ? Object.values(err.errors).flat().join(" ")
          : null;
        setError(fieldErrors || err.message);
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 theme-bg theme-text">
      {/* Dynamic Background Blobs */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-700/10 blur-[128px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-purple-700/10 blur-[128px] pointer-events-none" />

      {/* Floating Theme Toggle */}
      <button
        onClick={toggleTheme}
        aria-label="Toggle Theme"
        className="absolute top-6 right-6 flex h-10 w-10 items-center justify-center rounded-xl glass-input text-slate-400 hover:text-slate-200 transition-all duration-300 z-50"
      >
        {theme === "dark" ? (
          <Sun className="h-4.5 w-4.5 text-amber-400" />
        ) : (
          <Moon className="h-4.5 w-4.5 text-indigo-400" />
        )}
      </button>

      <div className="relative w-full max-w-md rounded-2xl glass-card p-8 shadow-[0_0_50px_-12px_rgba(99,102,241,0.15)]">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-white" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="bg-gradient-to-r dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 light:from-indigo-600 light:to-purple-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
            Create Account
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 font-semibold">Join us to build lasting daily habits</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Full Name</label>
            <input
              type="text"
              required
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl glass-input px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Email Address</label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl glass-input px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                className="w-full rounded-xl glass-input pl-4 pr-11 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors duration-200"
              >
                {showPassword ? (
                  <EyeOff className="h-4.5 w-4.5" />
                ) : (
                  <Eye className="h-4.5 w-4.5" />
                )}
              </button>
            </div>

            {/* Strength Bar */}
            {password.length > 0 && (
              <div className="mt-2.5 space-y-1.5">
                <div className="flex h-1.5 w-full gap-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className={`h-full transition-all duration-300 ${
                      strengthScore <= 1
                        ? "bg-red-500 w-1/5"
                        : strengthScore <= 3
                        ? "bg-amber-500 w-3/5"
                        : strengthScore === 4
                        ? "bg-indigo-500 w-4/5"
                        : "bg-emerald-500 w-full"
                    }`}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <span>Strength:</span>
                  <span
                    className={
                      strengthScore <= 1
                        ? "text-red-500 dark:text-red-400"
                        : strengthScore <= 3
                        ? "text-amber-500 dark:text-amber-400"
                        : strengthScore === 4
                        ? "text-indigo-500 dark:text-indigo-400"
                        : "text-emerald-500 dark:text-emerald-400"
                    }
                  >
                    {strengthScore <= 1
                      ? "Weak"
                      : strengthScore <= 3
                      ? "Fair"
                      : strengthScore === 4
                      ? "Good"
                      : "Strong"}
                  </span>
                </div>
              </div>
            )}

            {/* Password Checklist */}
            {(isPasswordFocused || password.length > 0) && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 rounded-xl border border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50 p-3.5 text-xs transition-all duration-300 animate-fadeIn">
                <div className={`flex items-center gap-2 transition-colors duration-200 ${hasMinLength ? "text-emerald-500 dark:text-emerald-400 font-semibold" : "text-slate-400 dark:text-slate-500"}`}>
                  <span className={`flex h-4.5 w-4.5 items-center justify-center rounded-full transition-all ${hasMinLength ? "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400" : "bg-slate-200/50 dark:bg-slate-800/50 text-slate-400"}`}>
                    {hasMinLength ? (
                      <Check className="h-3 w-3 stroke-[3]" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-600" />
                    )}
                  </span>
                  <span>Min 6 characters</span>
                </div>
                <div className={`flex items-center gap-2 transition-colors duration-200 ${hasUppercase ? "text-emerald-500 dark:text-emerald-400 font-semibold" : "text-slate-400 dark:text-slate-500"}`}>
                  <span className={`flex h-4.5 w-4.5 items-center justify-center rounded-full transition-all ${hasUppercase ? "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400" : "bg-slate-200/50 dark:bg-slate-800/50 text-slate-400"}`}>
                    {hasUppercase ? (
                      <Check className="h-3 w-3 stroke-[3]" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-600" />
                    )}
                  </span>
                  <span>One uppercase (A-Z)</span>
                </div>
                <div className={`flex items-center gap-2 transition-colors duration-200 ${hasLowercase ? "text-emerald-500 dark:text-emerald-400 font-semibold" : "text-slate-400 dark:text-slate-500"}`}>
                  <span className={`flex h-4.5 w-4.5 items-center justify-center rounded-full transition-all ${hasLowercase ? "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400" : "bg-slate-200/50 dark:bg-slate-800/50 text-slate-400"}`}>
                    {hasLowercase ? (
                      <Check className="h-3 w-3 stroke-[3]" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-600" />
                    )}
                  </span>
                  <span>One lowercase (a-z)</span>
                </div>
                <div className={`flex items-center gap-2 transition-colors duration-200 ${hasNumber ? "text-emerald-500 dark:text-emerald-400 font-semibold" : "text-slate-400 dark:text-slate-500"}`}>
                  <span className={`flex h-4.5 w-4.5 items-center justify-center rounded-full transition-all ${hasNumber ? "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400" : "bg-slate-200/50 dark:bg-slate-800/50 text-slate-400"}`}>
                    {hasNumber ? (
                      <Check className="h-3 w-3 stroke-[3]" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-600" />
                    )}
                  </span>
                  <span>One number (0-9)</span>
                </div>
                <div className={`flex items-center gap-2 transition-colors duration-200 ${hasSpecial ? "text-emerald-500 dark:text-emerald-400 font-semibold" : "text-slate-400 dark:text-slate-500"}`}>
                  <span className={`flex h-4.5 w-4.5 items-center justify-center rounded-full transition-all ${hasSpecial ? "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400" : "bg-slate-200/50 dark:bg-slate-800/50 text-slate-400"}`}>
                    {hasSpecial ? (
                      <Check className="h-3 w-3 stroke-[3]" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-600" />
                    )}
                  </span>
                  <span>One special symbol</span>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition-all duration-300 hover:scale-[1.02] hover:from-indigo-500 hover:to-purple-500 active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating account...
              </span>
            ) : (
              "Sign up"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400 font-semibold">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-indigo-555 dark:text-indigo-400 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
