"use client";

import { PLAN, PHASE_META } from "@/data/plan";
import {
  getCurrentWeekNumber,
  getTodayPlan,
  getTomorrowPlan,
  hasTrainingStarted,
  daysUntilStart,
  getDateForDay,
  formatDate,
  formatDateLong,
} from "@/lib/schedule";
import { TRAINING_START_DATE } from "@/data/config";
import { useProgress, useStats } from "@/lib/hooks";
import SessionCard from "@/components/SessionCard";
import ProgressRing from "@/components/ProgressRing";
import WeekChart from "@/components/WeekChart";

export default function Dashboard() {
  // Tiny redeploy trigger for Cloudflare Pages.
  const { progress, toggle, isDone } = useProgress();
  const stats = useStats(progress);
  const started = hasTrainingStarted();
  const weekNum = getCurrentWeekNumber();
  const week = PLAN.find((w) => w.weekNumber === weekNum);
  const todayPlan = getTodayPlan();
  const tomorrowPlan = getTomorrowPlan();

  const phaseMeta = week ? PHASE_META[week.phase] : null;

  const upNextSessions = started
    ? todayPlan?.day.sessions ?? []
    : PLAN.find((w) => w.weekNumber === 1)?.days.find((d) => d.day === "mon")
        ?.sessions ?? [];

  const upNextLabel = started
    ? todayPlan?.day.label ?? "Today"
    : `Monday, ${formatDate(getDateForDay(1, "mon"))}`;

  const upNextWeekLabel = started
    ? `Week ${weekNum}`
    : "Week 1";

  return (
    <div className="space-y-10">
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

      {/* Two-column: Up Next + Progress Card */}
      <section className="grid gap-4 lg:grid-cols-5 items-start">
        {/* Up Next — left, wider */}
        <div className="lg:col-span-3 bg-card rounded-2xl border border-border overflow-hidden">
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
              {phaseMeta && started && (
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: phaseMeta.color }}
                />
              )}
            </div>
          </div>
          <div className="px-4 py-4 space-y-2">
            {upNextSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                isDone={isDone(session.id)}
                onToggle={toggle}
              />
            ))}
          </div>
          {/* Tomorrow preview */}
          {started && tomorrowPlan && (
            <div className="border-t border-border/60 px-4 py-4">
              <p className="text-[11px] font-semibold text-muted uppercase tracking-widest px-1 mb-2">
                Tomorrow
              </p>
              {tomorrowPlan.day.sessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  isDone={isDone(session.id)}
                  onToggle={toggle}
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
                    isDone={isDone(session.id)}
                    onToggle={toggle}
                    compact
                  />
                ))}
            </div>
          )}
        </div>

        {/* Progress Card — right, narrower */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6 flex flex-col items-center gap-6">
          <ProgressRing
            percentage={stats.completionPct}
            size={140}
            strokeWidth={10}
          />
          <div className="w-full space-y-0 divide-y divide-border/60">
            <ProgressRow
              label="Hours"
              done={`${stats.doneHours}h`}
              total={`${stats.totalPlannedHours}h`}
              pct={
                stats.totalPlannedHours > 0
                  ? Math.round(
                      (stats.doneHours / stats.totalPlannedHours) * 100
                    )
                  : 0
              }
            />
            <ProgressRow
              label="Sessions"
              done={`${stats.completedSessions}`}
              total={`${stats.totalSessions}`}
              pct={stats.completionPct}
            />
            <ProgressRow
              label="Weeks"
              done={`${stats.weeksCompleted}`}
              total="16"
              pct={Math.round((stats.weeksCompleted / 16) * 100)}
            />
          </div>
        </div>
      </section>

      {/* Volume Chart */}
      <WeekChart progress={progress} />

      {/* Week at a glance — only during training */}
      {started && week && (
        <section>
          <h2 className="text-[11px] font-semibold text-muted uppercase tracking-widest mb-3">
            This week
          </h2>
          <div className="grid grid-cols-7 gap-1.5">
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

              return (
                <div
                  key={dayPlan.day}
                  className={`rounded-xl p-2.5 text-center transition-all ${
                    allDone
                      ? "bg-done-bg/40 ring-1 ring-done/20"
                      : "bg-card ring-1 ring-border"
                  }`}
                >
                  <p className="text-[10px] font-semibold text-muted uppercase">
                    {dayPlan.day}
                  </p>
                  <p className="text-xs font-semibold mt-1 text-foreground">
                    {formatDate(date)}
                  </p>
                  {isRest ? (
                    <p className="text-[10px] text-muted-light mt-1">Rest</p>
                  ) : (
                    <p className="text-[10px] text-muted mt-1 tabular-nums">
                      {totalMin < 60
                        ? `${totalMin}m`
                        : `${(totalMin / 60).toFixed(1)}h`}
                    </p>
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
    </div>
  );
}

function ProgressRow({
  label,
  done,
  total,
  pct,
}: {
  label: string;
  done: string;
  total: string;
  pct: number;
}) {
  return (
    <div className="flex items-center justify-between py-3.5">
      <span className="text-xs font-medium text-muted">{label}</span>
      <div className="flex items-center gap-3">
        <div className="w-20 h-1.5 rounded-full bg-border/60 overflow-hidden">
          <div
            className="h-full rounded-full bg-foreground/70 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs tabular-nums text-foreground font-medium">
          {done}
          <span className="text-muted-light font-normal"> / {total}</span>
        </span>
      </div>
    </div>
  );
}
