"use client";

import { useEffect, useState, type FormEvent } from "react";
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
      return "Firebase environment variables are missing. See the setup note above.";
    }
    return err.message;
  }
  return "Something went wrong. Please try again.";
}

const FEATURES = [
  { title: "16-week plan", desc: "Periodised phases from base to taper" },
  { title: "Session tracking", desc: "Tick workouts, log RPE and notes" },
  { title: "Cloud sync", desc: "Progress follows you across devices" },
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Subtle gradient backdrop */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 20%, var(--color-brand)/0.06, transparent 70%), " +
            "radial-gradient(ellipse 60% 40% at 80% 70%, var(--color-brand-warm)/0.05, transparent 60%)",
        }}
      />

      {!firebaseConfigured && (
        <div className="w-full max-w-lg mb-8 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm text-amber-950">
          <p className="font-semibold">Firebase config not found on the server</p>
          <p className="mt-1.5 text-amber-900/90 leading-relaxed">
            The app loads your Firebase keys from the server (not from the browser build). Add them to{" "}
            <code className="text-xs bg-amber-100/80 px-1 rounded">.env.local</code> in the project root
            (same folder as <code className="text-xs bg-amber-100/80 px-1 rounded">package.json</code>), then
            restart <code className="text-xs bg-amber-100/80 px-1 rounded">npm run dev</code>. See{" "}
            <code className="text-xs bg-amber-100/80 px-1 rounded">.env.example</code> for names — you can
            use either <code className="text-xs bg-amber-100/80 px-1 rounded">NEXT_PUBLIC_FIREBASE_*</code>{" "}
            or <code className="text-xs bg-amber-100/80 px-1 rounded">FIREBASE_*</code> (without{" "}
            <code className="text-xs bg-amber-100/80 px-1 rounded">NEXT_PUBLIC_</code>).
          </p>
          {missingFirebaseEnvVars.length > 0 && (
            <p className="mt-2 text-xs font-mono text-amber-900/80 break-all">
              Missing: {missingFirebaseEnvVars.join(", ")}
            </p>
          )}
        </div>
      )}

      {/* Hero */}
      <div className="text-center mb-10 max-w-md">
        <div className="flex justify-center mb-5">
          <BrandLogo variant="horizontal" href={null} className="gap-3" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Your training, structured.
        </h1>
        <p className="text-sm text-muted mt-2 leading-relaxed">
          Plan, track and review every session across a periodised 16-week block.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="px-3 py-1.5 rounded-full bg-card border border-border text-xs text-muted"
            >
              <span className="font-semibold text-foreground">{f.title}</span>{" "}
              — {f.desc}
            </div>
          ))}
        </div>
      </div>

      {/* Auth card */}
      <div className="w-full max-w-sm">
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="grid grid-cols-2 border-b border-border">
            {(["login", "register"] as const).map((t) => (
              <button
                key={t}
                type="button"
                disabled={authDisabled}
                onClick={() => {
                  setTab(t);
                  setError(null);
                  setResetSent(false);
                }}
                className={`py-3 text-sm font-semibold transition-colors disabled:opacity-50 ${
                  tab === t
                    ? "text-foreground border-b-2 border-foreground"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {t === "login" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="px-6 pt-5 pb-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-muted mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                disabled={authDisabled}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/40 transition disabled:opacity-50"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-muted mb-1.5">
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
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/40 transition disabled:opacity-50"
                placeholder="At least 6 characters"
                autoComplete={tab === "login" ? "current-password" : "new-password"}
              />
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            {resetSent && (
              <p className="text-xs text-done bg-done-bg rounded-lg px-3 py-2">
                Password reset email sent. Check your inbox.
              </p>
            )}

            <button
              type="submit"
              disabled={authDisabled}
              className="w-full rounded-xl bg-foreground text-background py-2.5 text-sm font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {busy
                ? "..."
                : tab === "login"
                ? "Sign in"
                : "Create account"}
            </button>

            {tab === "login" && (
              <button
                type="button"
                onClick={handleReset}
                disabled={authDisabled}
                className="w-full text-xs text-muted hover:text-foreground transition disabled:opacity-50"
              >
                Forgot password?
              </button>
            )}
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 px-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">
              or
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Google */}
          <div className="px-6 pt-4 pb-6">
            <button
              type="button"
              onClick={handleGoogle}
              disabled={authDisabled}
              className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-border bg-background py-2.5 text-sm font-medium text-foreground hover:bg-card-hover transition disabled:opacity-50"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
