"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import BrandLogo from "@/components/BrandLogo";
import { FirebaseError } from "firebase/app";

type Tab = "login" | "register";

const FIREBASE_ERRORS: Record<string, string> = {
  "auth/invalid-credential": "Email or password is incorrect.",
  "auth/user-not-found": "No account found with that email.",
  "auth/wrong-password": "Incorrect password.",
  "auth/email-already-in-use": "An account with that email already exists.",
  "auth/weak-password": "Password should be at least 6 characters.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/too-many-requests": "Too many attempts. Please try again later.",
  "auth/popup-closed-by-user": "Sign-in popup was closed.",
};

function friendlyError(err: unknown): string {
  if (err instanceof FirebaseError) {
    return FIREBASE_ERRORS[err.code] ?? err.message;
  }
  if (err instanceof Error) {
    if (err.message === "Firebase is not configured") {
      return "Firebase environment variables are missing.";
    }
    return err.message;
  }
  return "Something went wrong. Please try again.";
}

const PHASES = [
  { name: "Foundation", color: "#2563eb", weeks: "1 – 4", focus: "Aerobic base & neuromuscular prep" },
  { name: "Build", color: "#7c3aed", weeks: "5 – 8", focus: "Sweet-spot & threshold development" },
  { name: "Specific", color: "#ea580c", weeks: "9 – 12", focus: "Race-pace & VO2max intervals" },
  { name: "Peak", color: "#dc2626", weeks: "13 – 14", focus: "Top-end power & race simulation" },
  { name: "Taper", color: "#16a34a", weeks: "15 – 16", focus: "Sharpen, rest, arrive ready" },
];

const STATS = [
  { value: "16", unit: "weeks", label: "Periodised plan" },
  { value: "5", unit: "phases", label: "Progressive overload" },
  { value: "140+", unit: "hours", label: "Structured training" },
];

export default function LandingPage() {
  const {
    user,
    loading,
    firebaseConfigured,
    missingFirebaseEnvVars,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    resetPassword,
  } = useAuth();
  const router = useRouter();
  const authRef = useRef<HTMLDivElement>(null);

  const [tab, setTab] = useState<Tab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const authDisabled = busy || !firebaseConfigured;

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0c0a09]">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (tab === "login") {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleReset() {
    if (!email.trim()) {
      setError("Enter your email above, then click reset.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  function scrollToAuth() {
    authRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <div className="min-h-screen bg-[#0c0a09] text-white selection:bg-brand/30 overflow-x-hidden">

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#0c0a09]/70 border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <BrandLogo variant="horizontal" href={null} className="gap-2.5 [&_*]:!text-white [&_circle]:!stroke-white/15 [&_.text-muted]:!text-white/50" />
          <button
            onClick={scrollToAuth}
            className="text-sm font-medium px-5 py-2 rounded-full bg-white text-[#0c0a09] hover:bg-white/90 transition-all"
          >
            Get started
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-40 pb-28 sm:pt-52 sm:pb-36 px-6">
        {/* Glow */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-brand/[0.07] blur-[120px]" />
          <div className="absolute top-[10%] right-[10%] w-[400px] h-[400px] rounded-full bg-brand-warm/[0.05] blur-[100px]" />
        </div>

        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.25em] text-white/40 mb-6">
            Structured cycling training
          </p>

          <h1 className="text-[clamp(2.5rem,7vw,5.5rem)] font-bold leading-[0.95] tracking-[-0.035em]">
            Every pedal stroke{" "}
            <span className="bg-gradient-to-r from-brand to-brand-warm bg-clip-text text-transparent">
              counts.
            </span>
          </h1>

          <p className="mt-8 text-lg sm:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed font-light">
            A 16-week periodised plan that takes you from base fitness to race-day
            sharpness. Track every session, log RPE, sync across devices.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={scrollToAuth}
              className="px-8 py-3.5 rounded-full bg-white text-[#0c0a09] text-sm font-semibold hover:bg-white/90 transition-all shadow-[0_0_40px_rgba(37,99,235,0.15)]"
            >
              Start your plan
            </button>
            <a
              href="#phases"
              className="text-sm font-medium text-white/40 hover:text-white/70 transition-colors flex items-center gap-1.5"
            >
              See the phases
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="border-y border-white/[0.06] bg-white/[0.02]">
        <div className="max-w-4xl mx-auto px-6 py-10 grid grid-cols-3 gap-4 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="text-3xl sm:text-4xl font-bold tracking-tight">
                {s.value}
                <span className="text-base sm:text-lg font-normal text-white/30 ml-1">{s.unit}</span>
              </p>
              <p className="text-xs sm:text-sm text-white/35 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PHASES ── */}
      <section id="phases" className="py-24 sm:py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/30 mb-3">
            The programme
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Five phases. One goal.
          </h2>
          <p className="mt-4 text-white/40 max-w-xl leading-relaxed">
            Each phase builds on the last — progressive overload calibrated to your
            FTP so you arrive at the start line in the form of your life.
          </p>

          <div className="mt-14 space-y-3">
            {PHASES.map((p, i) => (
              <div
                key={p.name}
                className="group flex items-start gap-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] px-6 py-5 hover:bg-white/[0.05] transition-all"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0 mt-0.5"
                  style={{ backgroundColor: p.color }}
                >
                  {i + 1}
                </div>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <h3 className="text-base font-semibold">{p.name}</h3>
                    <span className="text-xs text-white/25 font-mono">Weeks {p.weeks}</span>
                  </div>
                  <p className="text-sm text-white/40 mt-1 leading-relaxed">{p.focus}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 sm:py-32 px-6 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/30 mb-3">
            Built for riders
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Simple tools. Serious results.
          </h2>

          <div className="mt-14 grid sm:grid-cols-3 gap-4">
            {[
              {
                title: "Daily view",
                desc: "See today's sessions at a glance. One tap to mark done, swipe to add RPE and notes.",
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                ),
              },
              {
                title: "Progress tracking",
                desc: "Watch hours, sessions and weeks fill up. A simple ring shows how far you've come.",
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                ),
              },
              {
                title: "Cloud sync",
                desc: "Sign in once and your data follows you. Phone, tablet, laptop — always up to date.",
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
                  </svg>
                ),
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6 hover:bg-white/[0.05] transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center text-white/60 mb-4">
                  {f.icon}
                </div>
                <h3 className="text-sm font-semibold mb-1.5">{f.title}</h3>
                <p className="text-sm text-white/35 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUOTE ── */}
      <section className="py-20 px-6 border-t border-white/[0.06]">
        <div className="max-w-3xl mx-auto text-center">
          <blockquote className="text-2xl sm:text-3xl font-light leading-snug tracking-tight text-white/70 italic">
            &ldquo;Suffering is the currency of improvement. Spend it wisely.&rdquo;
          </blockquote>
          <p className="mt-5 text-xs uppercase tracking-[0.2em] text-white/25">
            The philosophy behind every interval
          </p>
        </div>
      </section>

      {/* ── AUTH ── */}
      <section ref={authRef} className="py-24 sm:py-32 px-6 border-t border-white/[0.06]">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-10">
            <BrandLogo variant="mark" href={null} className="justify-center mb-5 [&_*]:!text-white [&_circle]:!stroke-white/15" />
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Ready to ride?
            </h2>
            <p className="text-sm text-white/40 mt-2">
              Create an account or sign in to begin your plan.
            </p>
          </div>

          {!firebaseConfigured && (
            <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              <p className="font-semibold">Firebase config not found</p>
              {missingFirebaseEnvVars.length > 0 && (
                <p className="mt-1 text-xs text-amber-200/70 font-mono break-all">
                  Missing: {missingFirebaseEnvVars.join(", ")}
                </p>
              )}
            </div>
          )}

          <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] overflow-hidden backdrop-blur-sm">
            {/* Tabs */}
            <div className="grid grid-cols-2 border-b border-white/[0.06]">
              {(["login", "register"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  disabled={authDisabled}
                  onClick={() => { setTab(t); setError(null); setResetSent(false); }}
                  className={`py-3.5 text-sm font-semibold transition-all disabled:opacity-40 ${
                    tab === t
                      ? "text-white border-b-2 border-white"
                      : "text-white/30 hover:text-white/60"
                  }`}
                >
                  {t === "login" ? "Sign in" : "Create account"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="px-6 pt-6 pb-5 space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-white/40 mb-1.5">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  disabled={authDisabled}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/30 transition disabled:opacity-40"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-medium text-white/40 mb-1.5">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  disabled={authDisabled}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/30 transition disabled:opacity-40"
                  placeholder="At least 6 characters"
                  autoComplete={tab === "login" ? "current-password" : "new-password"}
                />
              </div>

              {error && (
                <p className="text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
              )}
              {resetSent && (
                <p className="text-xs text-emerald-400 bg-emerald-400/10 rounded-lg px-3 py-2">
                  Password reset email sent. Check your inbox.
                </p>
              )}

              <button
                type="submit"
                disabled={authDisabled}
                className="w-full rounded-xl bg-white text-[#0c0a09] py-2.5 text-sm font-semibold hover:bg-white/90 transition disabled:opacity-40"
              >
                {busy ? "..." : tab === "login" ? "Sign in" : "Create account"}
              </button>

              {tab === "login" && (
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={authDisabled}
                  className="w-full text-xs text-white/30 hover:text-white/60 transition disabled:opacity-40"
                >
                  Forgot password?
                </button>
              )}
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 px-6">
              <div className="flex-1 h-px bg-white/[0.06]" />
              <span className="text-[10px] font-semibold text-white/20 uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>

            {/* Google */}
            <div className="px-6 pt-4 pb-6">
              <button
                type="button"
                onClick={handleGoogle}
                disabled={authDisabled}
                className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] py-2.5 text-sm font-medium text-white hover:bg-white/[0.08] transition disabled:opacity-40"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/[0.06] py-10 px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <BrandLogo variant="horizontal" href={null} className="gap-2 [&_*]:!text-white/40 [&_circle]:!stroke-white/10" />
          <p className="text-xs text-white/20">
            Built for the suffering. Designed for the glory.
          </p>
        </div>
      </footer>
    </div>
  );
}
