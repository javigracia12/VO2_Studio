"use client";

import { type Session, type Intensity } from "@/data/plan";

const TYPE_ICON: Record<string, string> = {
  "bike-trainer": "🚴",
  "bike-outdoor": "🚵",
  strength: "🏋️",
  run: "🏃",
  rest: "😴",
  mobility: "🧘",
};

const INTENSITY_STYLES: Record<Intensity, { dot: string; label: string }> = {
  recovery: { dot: "bg-stone-300", label: "Recovery" },
  easy: { dot: "bg-emerald-400", label: "Easy" },
  moderate: { dot: "bg-amber-400", label: "Moderate" },
  hard: { dot: "bg-orange-500", label: "Hard" },
  "very-hard": { dot: "bg-red-500", label: "Very Hard" },
};

interface SessionCardProps {
  session: Session;
  isDone?: boolean;
  onToggle?: (id: string) => void;
  compact?: boolean;
}

export default function SessionCard({
  session,
  isDone = false,
  onToggle,
  compact = false,
}: SessionCardProps) {
  const intensity = INTENSITY_STYLES[session.intensity];
  const icon = TYPE_ICON[session.type] ?? "📋";

  if (compact) {
    return (
      <div
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
          isDone ? "opacity-50" : ""
        }`}
      >
        <span className="text-base shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-medium truncate ${
              isDone ? "line-through text-muted" : "text-foreground"
            }`}
          >
            {session.title}
          </p>
          {session.durationMinutes > 0 && (
            <p className="text-xs text-muted">{formatDuration(session.durationMinutes)}</p>
          )}
        </div>
        <div className={`w-2 h-2 rounded-full shrink-0 ${intensity.dot}`} />
      </div>
    );
  }

  return (
    <div
      className={`group bg-card border border-border rounded-2xl p-5 transition-all duration-200 hover:shadow-sm ${
        isDone ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="text-2xl mt-0.5 shrink-0">{icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                className={`text-base font-semibold ${
                  isDone ? "line-through text-muted" : "text-foreground"
                }`}
              >
                {session.title}
              </h3>
              <span className="flex items-center gap-1.5 text-xs text-muted">
                <span className={`w-1.5 h-1.5 rounded-full ${intensity.dot}`} />
                {intensity.label}
              </span>
            </div>
            <p className="mt-1.5 text-sm text-muted leading-relaxed">
              {session.description}
            </p>
            {session.durationMinutes > 0 && (
              <p className="mt-2 text-xs font-medium text-muted-light tracking-wide uppercase">
                {formatDuration(session.durationMinutes)}
              </p>
            )}
          </div>
        </div>
        {onToggle && session.type !== "rest" && session.durationMinutes > 0 && (
          <button
            onClick={() => onToggle(session.id)}
            className={`shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
              isDone
                ? "bg-done border-done text-white"
                : "border-border hover:border-muted-light"
            }`}
            aria-label={isDone ? "Mark as not done" : "Mark as done"}
          >
            {isDone && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}
