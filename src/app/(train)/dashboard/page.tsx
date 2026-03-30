"use client";

import { useMemo } from "react";
import { PLAN, PHASE_META, type Phase, type Session } from "@/data/plan";
import {
  getCurrentWeekNumber,
  getTodayPlan,
  getTomorrowPlan,
  hasTrainingStarted,
  daysUntilStart,
  getDateForDay,
  formatDate,
  formatDateLong,
  isPast,
  isToday,
} from "@/lib/schedule";
import { TRAINING_START_DATE } from "@/data/config";
import { useProgress, useStats } from "@/lib/hooks";
import type { ProgressMap } from "@/lib/progress";
import SessionCard from "@/components/SessionCard";
import WeekChart from "@/components/WeekChart";

const TYPE_ICON: Record<string, string> = {
  "bike-trainer": "🚴",
  "bike-outdoor": "🚵",
  strength: "🏋️",
  run: "🏃",
  rest: "😴",
  mobility: "🧘",
};

interface MissedSession {
  session: Session;
  date: string;
  weekNumber: number;
}

function computeStreak(progress: ProgressMap): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;

  for (let offset = 0; offset < 365; offset++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - offset);
    const dateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, "0")}-${String(checkDate.getDate()).padStart(2, "0")}`;

    let hasSessions = false;
    let anyDone = false;

    for (const week of PLAN) {
      for (const day of week.days) {
        const dayDate = getDateForDay(week.weekNumber, day.day);
        if (dayDate !== dateStr) continue;
        const active = day.sessions.filter(
          (s) => s.type !== "rest" && s.durationMinutes > 0
        );
        if (active.length > 0) {
          hasSessions = true;
          if (active.some((s) => progress[s.id]?.done)) {
            anyDone = true;
          }
        }
      }
    }

    if (!hasSessions) {
      // Rest day / no training day — doesn't break streak but doesn't count
      if (offset === 0) continue;
      continue;
    }

    if (anyDone) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

function computeMissedWorkouts(progress: ProgressMap): MissedSession[] {
  const missed: MissedSession[] = [];
  for (const week of PLAN) {
    for (const day of week.days) {
      const date = getDateForDay(week.weekNumber, day.day);
      if (!isPast(date)) continue;
      for (const session of day.sessions) {
        if (session.type === "rest" || session.durationMinutes === 0) continue;
        if (!progress[session.id]?.done) {
          missed.push({ session, date, weekNumber: week.weekNumber });
        }
      }
    }
  }
  return missed;
}

function computeMissedThisWeek(
  progress: ProgressMap,
  weekNum: number
): number {
  const week = PLAN.find((w) => w.weekNumber === weekNum);
  if (!week) return 0;
  let count = 0;
  for (const day of week.days) {
    const date = getDateForDay(week.weekNumber, day.day);
    if (!isPast(date)) continue;
    for (const session of day.sessions) {
      if (session.type === "rest" || session.durationMinutes === 0) continue;
      if (!progress[session.id]?.done) count++;
    }
  }
  return count;
}

export default function Dashboard() {
  const { progress, toggle, isDone, saveEntry, getEntry } = useProgress();
  const stats = useStats(progress);
  const started = hasTrainingStarted();
  const weekNum = getCurrentWeekNumber();
  const week = PLAN.find((w) => w.weekNumber === weekNum);
  const todayPlan = getTodayPlan();
  const tomorrowPlan = getTomorrowPlan();

  const phaseMeta = week ? PHASE_META[week.phase] : null;

  const streak = useMemo(() => computeStreak(progress), [progress]);
  const missedWorkouts = useMemo(
    () => computeMissedWorkouts(progress),
    [progress]
  );
  const missedThisWeek = useMemo(
    () => computeMissedThisWeek(progress, weekNum),
    [progress, weekNum]
  );

  const upNextSessions = started
    ? todayPlan?.day.sessions ?? []
    : PLAN.find((w) => w.weekNumber === 1)?.days.find((d) => d.day === "mon")
        ?.sessions ?? [];

  const upNextLabel = started
    ? todayPlan?.day.label ?? "Today"
    : `Monday, ${formatDate(getDateForDay(1, "mon"))}`;

  const upNextWeekLabel = started ? `Week ${weekNum}` : "Week 1";

  const todayTotalMinutes = upNextSessions
    .filter((s) => s.type !== "rest" && s.durationMinutes > 0)
    .reduce((sum, s) => sum + s.durationMinutes, 0);

  const remainingSessions = stats.totalSessions - stats.completedSessions;
  const remainingWeeks = 16 - stats.weeksCompleted;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <header>
        {!started ? (
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-widest">
                Training starts in
              </p>
              <h1 className="text-5xl font-bold tracking-tight mt-1.5 tabular-nums">
                {daysUntilStart()}{" "}
                <span className="text-muted-light text-3xl font-medium">
                  days
                </span>
              </h1>
            </div>
            <p className="text-sm text-muted pb-1">
              16 weeks &middot; begins{" "}
              {formatDateLong(TRAINING_START_DATE)}
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              {phaseMeta && (
                <span
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold"
                  style={{
                    backgroundColor: phaseMeta.bg,
                    color: phaseMeta.color,
                  }}
                >
                  Phase {week!.phaseNumber} &middot; {phaseMeta.name}
                </span>
              )}
              {week?.isDeload && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-done-bg text-done">
                  Deload
                </span>
              )}
            </div>
            <h1 className="text-5xl font-bold tracking-tight mt-3">
              Week {weekNum}
              <span className="text-muted-light font-normal text-3xl">
                {" "}
                / 16
              </span>
            </h1>
            {week?.notes && (
              <p className="text-sm text-muted mt-3 max-w-2xl leading-relaxed">
                {week.notes}
              </p>
            )}
          </div>
        )}
      </header>

      {/* Stats Row */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          value={`${stats.doneHours}`}
          unit="h"
          label="Hours Trained"
          detail={`of ${stats.totalPlannedHours}h planned`}
        />
        <StatCard
          value={`${stats.completedSessions}`}
          label="Sessions Done"
          detail={`of ${stats.totalSessions} sessions`}
        />
        <StatCard
          value={`${streak}`}
          label="Current Streak"
          detail={streak === 1 ? "1 day in a row" : `${streak} days in a row`}
        />
        <StatCard
          value={`${missedWorkouts.length}`}
          label="Missed Workouts"
          detail={`${missedThisWeek} this week`}
          warn={missedWorkouts.length > 0}
        />
      </section>

      {/* Overall Progress Bar */}
      <section className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-foreground">
            Plan Progress
          </p>
          <p className="text-xs text-muted tabular-nums">
            {stats.completionPct}% complete
          </p>
        </div>
        <PhaseProgressBar completionPct={stats.completionPct} />
        <div className="flex items-center gap-4 mt-3 flex-wrap">
          {(Object.keys(PHASE_META) as Phase[]).map((phase) => (
            <div key={phase} className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: PHASE_META[phase].color }}
              />
              <span className="text-[10px] text-muted font-medium">
                {PHASE_META[phase].name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Today's Training */}
      <section className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="px-6 pt-5 pb-4 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[11px] font-semibold text-muted uppercase tracking-widest">
                Up Next
              </h2>
              <p className="text-sm font-medium text-foreground mt-0.5">
                {upNextWeekLabel} &middot; {upNextLabel}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {todayTotalMinutes > 0 && (
                <span className="text-xs text-muted tabular-nums">
                  {todayTotalMinutes < 60
                    ? `${todayTotalMinutes}m`
                    : `${(todayTotalMinutes / 60).toFixed(1)}h`}{" "}
                  planned today
                </span>
              )}
              {phaseMeta && started && (
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: phaseMeta.color }}
                />
              )}
            </div>
          </div>
        </div>
        <div className="px-4 py-4 space-y-2">
          {upNextSessions.map((session) => {
            const done = isDone(session.id);
            const isActive =
              session.type !== "rest" && session.durationMinutes > 0;
            return (
              <div key={session.id} className="relative">
                {isActive && (
                  <div className="absolute left-1.5 top-5 z-10">
                    <div
                      className={`w-2.5 h-2.5 rounded-full border-2 ${
                        done
                          ? "bg-done border-done"
                          : "bg-transparent border-muted-light"
                      }`}
                    />
                  </div>
                )}
                <div className="cursor-pointer hover:bg-card-hover rounded-2xl transition-colors">
                  <SessionCard
                    session={session}
                    entry={getEntry(session.id)}
                    isDone={done}
                    onToggle={toggle}
                    onSaveEntry={saveEntry}
                  />
                </div>
              </div>
            );
          })}
        </div>
        {started && tomorrowPlan && (
          <div className="border-t border-border/60 px-4 py-4">
            <p className="text-[11px] font-semibold text-muted uppercase tracking-widest px-1 mb-2">
              Tomorrow
            </p>
            {tomorrowPlan.day.sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                entry={getEntry(session.id)}
                isDone={isDone(session.id)}
                onToggle={toggle}
                onSaveEntry={saveEntry}
                compact
              />
            ))}
          </div>
        )}
        {!started && (
          <div className="border-t border-border/60 px-4 py-4">
            <p className="text-[11px] font-semibold text-muted uppercase tracking-widest px-1 mb-2">
              Then
            </p>
            {PLAN.find((w) => w.weekNumber === 1)
              ?.days.find((d) => d.day === "tue")
              ?.sessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  entry={getEntry(session.id)}
                  isDone={isDone(session.id)}
                  onToggle={toggle}
                  onSaveEntry={saveEntry}
                  compact
                />
              ))}
          </div>
        )}
      </section>

      {/* Missed Workouts */}
      {missedWorkouts.length > 0 && (
        <MissedWorkoutsSection
          missed={missedWorkouts}
          onMarkDone={toggle}
        />
      )}

      {/* Volume Chart */}
      <WeekChart progress={progress} />

      {/* Week at a glance */}
      {started && week && (
        <section>
          <h2 className="text-[11px] font-semibold text-muted uppercase tracking-widest mb-3">
            This week
          </h2>
          <div className="grid grid-cols-7 gap-2">
            {week.days.map((dayPlan) => {
              const date = getDateForDay(week.weekNumber, dayPlan.day);
              const activeSessions = dayPlan.sessions.filter(
                (s) => s.type !== "rest" && s.durationMinutes > 0
              );
              const allDone =
                activeSessions.length > 0 &&
                activeSessions.every((s) => isDone(s.id));
              const totalMin = dayPlan.sessions.reduce(
                (sum, s) => sum + s.durationMinutes,
                0
              );
              const isRest = activeSessions.length === 0;
              const isTodayDate = isToday(date);
              const sessionTypes = [
                ...new Set(activeSessions.map((s) => s.type)),
              ];

              return (
                <div
                  key={dayPlan.day}
                  className={`rounded-xl p-3 text-center transition-all ${
                    allDone
                      ? "bg-done-bg/40 ring-1 ring-done/20"
                      : isTodayDate
                        ? "bg-card ring-2 ring-foreground/20"
                        : "bg-card ring-1 ring-border"
                  }`}
                >
                  <p
                    className={`text-[10px] font-semibold uppercase ${
                      isTodayDate ? "text-foreground" : "text-muted"
                    }`}
                  >
                    {dayPlan.day}
                  </p>
                  <p className="text-xs font-semibold mt-1 text-foreground">
                    {formatDate(date)}
                  </p>
                  {isRest ? (
                    <p className="text-[10px] text-muted-light mt-1.5">Rest</p>
                  ) : (
                    <>
                      <div className="flex items-center justify-center gap-0.5 mt-1.5">
                        {sessionTypes.map((type) => (
                          <span key={type} className="text-xs leading-none">
                            {TYPE_ICON[type] ?? "📋"}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm font-semibold text-foreground mt-1 tabular-nums">
                        {totalMin < 60
                          ? `${totalMin}m`
                          : `${(totalMin / 60).toFixed(1)}h`}
                      </p>
                    </>
                  )}
                  {allDone && (
                    <p className="text-done text-[10px] font-semibold mt-0.5">
                      Done
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Footer remaining */}
      {started && (
        <footer className="text-center py-4 border-t border-border/40">
          <p className="text-xs text-muted-light tabular-nums">
            {stats.remainingHours}h remaining &middot; {remainingSessions}{" "}
            sessions left &middot; {remainingWeeks} weeks to go
          </p>
        </footer>
      )}
    </div>
  );
}

/* ── Stat Card ──────────────────────────────────────────────── */

function StatCard({
  value,
  unit,
  label,
  detail,
  warn,
}: {
  value: string;
  unit?: string;
  label: string;
  detail: string;
  warn?: boolean;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <p className="text-3xl font-bold tabular-nums tracking-tight text-foreground">
        {value}
        {unit && (
          <span className="text-lg font-medium text-muted-light">{unit}</span>
        )}
      </p>
      <p
        className={`text-xs uppercase tracking-wider mt-1 font-semibold ${
          warn ? "text-amber-600" : "text-muted"
        }`}
      >
        {label}
      </p>
      <p className="text-xs text-muted-light mt-0.5">{detail}</p>
    </div>
  );
}

/* ── Phase Progress Bar ─────────────────────────────────────── */

function PhaseProgressBar({ completionPct }: { completionPct: number }) {
  const totalWeeks = PLAN.length;

  const phaseSegments: { phase: Phase; weeks: number; startPct: number }[] = [];
  let cursor = 0;
  const phaseOrder: Phase[] = [
    "foundation",
    "build",
    "specific",
    "peak",
    "taper",
  ];
  for (const phase of phaseOrder) {
    const count = PLAN.filter((w) => w.phase === phase).length;
    phaseSegments.push({ phase, weeks: count, startPct: (cursor / totalWeeks) * 100 });
    cursor += count;
  }

  return (
    <div className="relative">
      <div className="w-full h-2 rounded-full bg-border/40 overflow-hidden flex">
        {phaseSegments.map((seg) => {
          const widthPct = (seg.weeks / totalWeeks) * 100;
          return (
            <div
              key={seg.phase}
              className="h-full first:rounded-l-full last:rounded-r-full"
              style={{
                width: `${widthPct}%`,
                backgroundColor: PHASE_META[seg.phase].bg,
              }}
            />
          );
        })}
      </div>
      {/* Filled overlay */}
      <div
        className="absolute top-0 left-0 h-2 rounded-full overflow-hidden flex transition-all duration-700"
        style={{ width: `${Math.min(completionPct, 100)}%` }}
      >
        {phaseSegments.map((seg) => {
          const widthPct = (seg.weeks / totalWeeks) * 100;
          return (
            <div
              key={seg.phase}
              className="h-full shrink-0"
              style={{
                width: `${widthPct}%`,
                backgroundColor: PHASE_META[seg.phase].color,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ── Missed Workouts Section ────────────────────────────────── */

function MissedWorkoutsSection({
  missed,
  onMarkDone,
}: {
  missed: MissedSession[];
  onMarkDone: (id: string) => void;
}) {
  const MAX_SHOW = 5;
  const showAll = missed.length <= MAX_SHOW;
  const displayed = showAll ? missed : missed.slice(-MAX_SHOW);
  const hiddenCount = missed.length - displayed.length;

  return (
    <section className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-amber-800">
          Missed workouts
        </h3>
        <span className="text-xs text-amber-600 tabular-nums">
          {missed.length} total
        </span>
      </div>
      <div className="space-y-2">
        {displayed.map(({ session, date }) => (
          <div
            key={session.id}
            className="flex items-center justify-between gap-3 bg-white/60 rounded-xl px-4 py-2.5"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-base shrink-0">
                {TYPE_ICON[session.type] ?? "📋"}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {session.title}
                </p>
                <p className="text-xs text-muted">
                  {formatDate(date)} &middot;{" "}
                  {session.durationMinutes < 60
                    ? `${session.durationMinutes}m`
                    : `${(session.durationMinutes / 60).toFixed(1)}h`}
                </p>
              </div>
            </div>
            <button
              onClick={() => onMarkDone(session.id)}
              className="shrink-0 text-xs font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              Mark done
            </button>
          </div>
        ))}
      </div>
      {!showAll && (
        <p className="text-xs text-amber-600 mt-3 text-center">
          +{hiddenCount} more missed workouts
        </p>
      )}
    </section>
  );
}
