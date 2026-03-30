"use client";

import { useState, useEffect, useCallback } from "react";
import { type Session, type Intensity } from "@/data/plan";
import { type SessionEntry } from "@/lib/progress";
import { getFueling } from "@/lib/fueling";

const TYPE_ICON: Record<string, string> = {
  "bike-trainer": "🚴",
  "bike-outdoor": "🚵",
  strength: "🏋️",
  run: "🏃",
  rest: "😴",
  mobility: "🧘",
};

const INTENSITY_STYLES: Record<
  Intensity,
  { dot: string; label: string }
> = {
  recovery: { dot: "bg-stone-300", label: "Recovery" },
  easy: { dot: "bg-emerald-400", label: "Easy" },
  moderate: { dot: "bg-amber-400", label: "Moderate" },
  hard: { dot: "bg-orange-500", label: "Hard" },
  "very-hard": { dot: "bg-red-500", label: "Very Hard" },
};

const RPE_COLORS: Record<number, string> = {
  1: "bg-emerald-500",
  2: "bg-emerald-500",
  3: "bg-lime-500",
  4: "bg-lime-500",
  5: "bg-amber-500",
  6: "bg-amber-500",
  7: "bg-orange-500",
  8: "bg-orange-500",
  9: "bg-red-500",
  10: "bg-red-500",
};

const RPE_LABELS: Record<number, string> = {
  1: "Very Easy",
  2: "Easy",
  3: "Easy",
  4: "Moderate",
  5: "Moderate",
  6: "Hard",
  7: "Hard",
  8: "Very Hard",
  9: "Maximum",
  10: "Maximum",
};

interface SessionDetailModalProps {
  session: Session;
  entry?: SessionEntry;
  isDone: boolean;
  onToggle: (id: string) => void;
  onSaveEntry: (id: string, rpe: number, note: string) => void;
  onClose: () => void;
}

export default function SessionDetailModal({
  session,
  entry,
  isDone,
  onToggle,
  onSaveEntry,
  onClose,
}: SessionDetailModalProps) {
  const [visible, setVisible] = useState(false);
  const [rpe, setRpe] = useState<number | null>(entry?.rpe ?? null);
  const [note, setNote] = useState(entry?.note ?? "");
  const [editing, setEditing] = useState(false);
  const [showRpeSection, setShowRpeSection] = useState(false);

  const intensity = INTENSITY_STYLES[session.intensity];
  const icon = TYPE_ICON[session.type] ?? "📋";
  const fueling = getFueling(session);
  const hasRpe = !!entry?.rpe;
  const isRest = session.type === "rest" || session.durationMinutes === 0;

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const close = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 300);
  }, [onClose]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [close]);

  function handleToggle() {
    onToggle(session.id);
    if (!isDone && !hasRpe) {
      setShowRpeSection(true);
    }
  }

  function handleSave() {
    if (rpe) {
      onSaveEntry(session.id, rpe, note);
      setEditing(false);
      setShowRpeSection(false);
    }
  }

  function handleSkip() {
    setShowRpeSection(false);
    setEditing(false);
  }

  const showLogSection = showRpeSection || editing;
  const showSavedRpe = isDone && hasRpe && !editing && !showRpeSection;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-foreground/40 transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={close}
      />

      {/* Panel — right on md+, bottom on mobile */}
      <div
        className={`
          absolute bg-card overflow-y-auto
          transition-transform duration-300 ease-out

          inset-x-0 bottom-0 max-h-[92vh] rounded-t-2xl
          md:inset-y-0 md:right-0 md:left-auto md:bottom-auto
          md:w-[28rem] md:max-h-none md:rounded-t-none md:rounded-l-2xl

          ${visible
            ? "translate-y-0 md:translate-y-0 md:translate-x-0"
            : "translate-y-full md:translate-y-0 md:translate-x-full"
          }
        `}
      >
        {/* Mobile drag handle */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Close button */}
        <button
          onClick={close}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-muted hover:text-foreground transition-colors z-10"
          aria-label="Close"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="pr-8">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{icon}</span>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-foreground tracking-tight">
                  {session.title}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="flex items-center gap-1.5 text-xs text-muted">
                    <span className={`w-2 h-2 rounded-full ${intensity.dot}`} />
                    {intensity.label}
                  </span>
                  {session.durationMinutes > 0 && (
                    <>
                      <span className="text-border">·</span>
                      <span className="text-xs font-medium text-muted">
                        {formatDuration(session.durationMinutes)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Workout */}
          <section>
            <h3 className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">
              Workout
            </h3>
            <p className="text-sm text-foreground leading-relaxed">
              {session.description}
            </p>
            {session.durationMinutes > 0 && (
              <div className="mt-3 inline-flex items-center gap-2 bg-background border border-border rounded-xl px-3.5 py-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span className="text-sm font-semibold text-foreground">
                  {formatDuration(session.durationMinutes)}
                </span>
              </div>
            )}
          </section>

          {/* Fueling */}
          {fueling.during && session.type !== "rest" && (
            <section>
              <h3 className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">
                Fueling
              </h3>
              <div className="bg-background border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-2.5">
                  <span className="text-base mt-0.5">🍌</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      During — {fueling.during}
                    </p>
                    {fueling.during_detail && (
                      <p className="text-xs text-muted mt-0.5 leading-relaxed">
                        {fueling.during_detail}
                      </p>
                    )}
                  </div>
                </div>
                {fueling.post && (
                  <div className="flex items-start gap-2.5 pt-2 border-t border-border/50">
                    <span className="text-base mt-0.5">🔄</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Post-workout
                      </p>
                      <p className="text-xs text-muted mt-0.5 leading-relaxed">
                        {fueling.post}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Log your effort */}
          {!isRest && (
            <section>
              <h3 className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">
                Log your effort
              </h3>

              {showSavedRpe && (
                <div className="bg-background border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm ${
                          RPE_COLORS[entry!.rpe!]
                        }`}
                      >
                        {entry!.rpe}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          RPE {entry!.rpe} — {RPE_LABELS[entry!.rpe!]}
                        </p>
                        {entry!.note && (
                          <p className="text-xs text-muted mt-0.5 italic">
                            &ldquo;{entry!.note}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setRpe(entry!.rpe ?? null);
                        setNote(entry!.note ?? "");
                        setEditing(true);
                      }}
                      className="text-xs text-muted hover:text-foreground transition-colors font-medium"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              )}

              {showLogSection && (
                <div className="space-y-4">
                  {/* RPE scale */}
                  <div>
                    <p className="text-xs text-muted mb-2">Rate of Perceived Exertion</p>
                    <div className="flex gap-1.5">
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
                        const isSelected = rpe === n;
                        return (
                          <button
                            key={n}
                            onClick={() => setRpe(n)}
                            className={`
                              flex-1 h-10 min-w-[2.5rem] rounded-xl text-sm font-bold
                              transition-all duration-150
                              ${isSelected
                                ? `${RPE_COLORS[n]} text-white scale-110 shadow-md`
                                : "bg-background border border-border text-muted hover:border-muted-light hover:text-foreground"
                              }
                            `}
                          >
                            {n}
                          </button>
                        );
                      })}
                    </div>
                    {rpe && (
                      <p className="text-xs text-muted mt-1.5 text-center">
                        {RPE_LABELS[rpe]}
                      </p>
                    )}
                  </div>

                  {/* Note */}
                  <div>
                    <label className="text-xs font-medium text-muted block mb-1.5">
                      How did it feel?
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Legs felt fresh, maintained power well..."
                      rows={3}
                      className="w-full text-sm bg-background border border-border rounded-xl px-4 py-3 resize-none placeholder:text-muted-light focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition"
                    />
                  </div>

                  {/* Save + Skip */}
                  <div>
                    <button
                      onClick={handleSave}
                      disabled={!rpe}
                      className="w-full h-11 bg-foreground text-background text-sm font-semibold rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.98]"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleSkip}
                      className="w-full mt-1.5 h-9 text-sm text-muted hover:text-foreground transition-colors"
                    >
                      Skip
                    </button>
                  </div>
                </div>
              )}

              {!showSavedRpe && !showLogSection && isDone && (
                <button
                  onClick={() => setShowRpeSection(true)}
                  className="w-full text-sm text-muted hover:text-foreground border border-border rounded-xl px-4 py-3 transition-colors text-left"
                >
                  Add effort rating...
                </button>
              )}
            </section>
          )}

          {/* Done toggle */}
          {!isRest && (
            <div className="pt-2 pb-2">
              <button
                onClick={handleToggle}
                className={`
                  w-full h-12 rounded-xl font-semibold text-sm
                  flex items-center justify-center gap-2
                  transition-all duration-200 active:scale-[0.98]
                  ${isDone
                    ? "bg-done-bg text-done border border-done/20"
                    : "bg-foreground text-background hover:opacity-90"
                  }
                `}
              >
                {isDone ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Completed
                  </>
                ) : (
                  "Mark as done"
                )}
              </button>
            </div>
          )}
        </div>
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
