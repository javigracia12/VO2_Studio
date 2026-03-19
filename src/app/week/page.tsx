"use client";

import { PLAN, PHASE_META, DAY_LABELS, type DayOfWeek } from "@/data/plan";
import {
  getCurrentWeekNumber,
  getDateForDay,
  formatDate,
  hasTrainingStarted,
  daysUntilStart,
  isToday,
} from "@/lib/schedule";
import { useProgress, useWeekStats } from "@/lib/hooks";
import SessionCard from "@/components/SessionCard";

export default function WeekPage() {
  const { progress, toggle, isDone } = useProgress();
  const weekNum = getCurrentWeekNumber();
  const week = PLAN.find((w) => w.weekNumber === weekNum);
  const weekStats = useWeekStats(weekNum, progress);

  if (!week) {
    if (!hasTrainingStarted()) {
      return (
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">Not yet</h1>
          <p className="text-muted">
            Training starts in <strong>{daysUntilStart()} days</strong>.
          </p>
        </div>
      );
    }
    return <p className="text-muted">No week data found.</p>;
  }

  const phaseMeta = PHASE_META[week.phase];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
            style={{ backgroundColor: phaseMeta.bg, color: phaseMeta.color }}
          >
            {phaseMeta.name}
          </span>
          {week.isDeload && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-done-bg text-done">
              Deload
            </span>
          )}
        </div>
        <h1 className="text-3xl font-bold tracking-tight mt-3">
          Week {weekNum}
        </h1>
        <p className="text-muted mt-1">
          {week.totalHours}h planned · {weekStats.pct}% complete
        </p>
        {week.notes && (
          <p className="text-sm text-muted mt-2 max-w-xl leading-relaxed bg-card border border-border rounded-xl p-3">
            {week.notes}
          </p>
        )}
      </div>

      {/* Progress bar */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="flex items-center justify-between text-xs text-muted mb-2">
          <span>Week progress</span>
          <span className="font-mono">
            {Math.round(weekStats.doneMinutes / 60 * 10) / 10}h / {Math.round(weekStats.totalMinutes / 60 * 10) / 10}h
          </span>
        </div>
        <div className="h-2 bg-border-light rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${weekStats.pct}%`,
              backgroundColor: phaseMeta.color,
            }}
          />
        </div>
      </div>

      {/* Days */}
      <div className="space-y-4">
        {week.days.map((dayPlan) => {
          const dateStr = getDateForDay(week.weekNumber, dayPlan.day);
          const today = isToday(dateStr);
          const totalMin = dayPlan.sessions.reduce(
            (s, sess) => s + sess.durationMinutes,
            0
          );
          const isRest = dayPlan.sessions.every(
            (s) => s.type === "rest" || s.durationMinutes === 0
          );
          const allDone =
            !isRest &&
            dayPlan.sessions
              .filter((s) => s.type !== "rest" && s.durationMinutes > 0)
              .every((s) => isDone(s.id));

          return (
            <div
              key={dayPlan.day}
              className={`rounded-2xl border transition-all ${
                today
                  ? "border-foreground/20 bg-card shadow-sm"
                  : allDone
                  ? "border-done/20 bg-done-bg/20"
                  : "border-border bg-card/50"
              }`}
            >
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground">
                        {DAY_LABELS[dayPlan.day as DayOfWeek]}
                      </h3>
                      {today && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-foreground text-background">
                          Today
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted">{formatDate(dateStr)}</p>
                  </div>
                </div>
                <div className="text-right">
                  {isRest ? (
                    <span className="text-xs text-muted-light">Rest</span>
                  ) : (
                    <span className="text-xs text-muted font-mono">
                      {totalMin >= 60
                        ? `${(totalMin / 60).toFixed(1)}h`
                        : `${totalMin}m`}
                    </span>
                  )}
                  {allDone && (
                    <span className="ml-2 text-done text-xs font-semibold">
                      ✓ Done
                    </span>
                  )}
                </div>
              </div>
              <div className="px-3 py-2">
                {dayPlan.sessions.map((session) => (
                  <div key={session.id} className="flex items-center gap-2">
                    <div className="flex-1">
                      <SessionCard
                        session={session}
                        isDone={isDone(session.id)}
                        onToggle={toggle}
                        compact
                      />
                    </div>
                    {session.type !== "rest" && session.durationMinutes > 0 && (
                      <button
                        onClick={() => toggle(session.id)}
                        className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 mr-2 ${
                          isDone(session.id)
                            ? "bg-done border-done text-white"
                            : "border-border hover:border-muted-light"
                        }`}
                      >
                        {isDone(session.id) && (
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
