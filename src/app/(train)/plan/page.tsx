"use client";

import { useState } from "react";
import {
  PLAN,
  PHASE_META,
  ZONES,
  type Phase,
  type Session,
} from "@/data/plan";
import {
  getCurrentWeekNumber,
  getDateForDay,
  formatDate,
} from "@/lib/schedule";
import { useProgress, useWeekStats } from "@/lib/hooks";
import { type ProgressMap, type SessionEntry } from "@/lib/progress";
import SessionCard from "@/components/SessionCard";
import SessionDetailModal from "@/components/SessionDetailModal";

const PHASES: { phase: Phase; weeks: number[] }[] = [
  { phase: "foundation", weeks: [1, 2, 3, 4] },
  { phase: "build", weeks: [5, 6, 7, 8] },
  { phase: "specific", weeks: [9, 10, 11, 12] },
  { phase: "peak", weeks: [13, 14] },
  { phase: "taper", weeks: [15, 16] },
];

export default function PlanPage() {
  const { progress, toggle, isDone, saveEntry, getEntry } = useProgress();
  const currentWeek = getCurrentWeekNumber();
  const [expandedWeek, setExpandedWeek] = useState<number | null>(currentWeek);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Full Plan</h1>
        <p className="text-muted mt-1">16 weeks · 5 phases · ~140 hours total</p>
      </div>

      {/* Zones reference */}
      <details className="bg-card border border-border rounded-2xl">
        <summary className="px-5 py-3.5 cursor-pointer text-sm font-semibold text-foreground hover:text-muted transition-colors">
          Power Zones (FTP 200 W)
        </summary>
        <div className="px-5 pb-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {ZONES.map((zone) => (
            <div
              key={zone.name}
              className="bg-background rounded-xl p-3"
            >
              <p className="text-xs font-semibold text-foreground">{zone.name}</p>
              <p className="text-xs text-muted font-mono">{zone.power}</p>
              <p className="text-[10px] text-muted-light mt-0.5">
                {zone.description}
              </p>
            </div>
          ))}
        </div>
      </details>

      {/* Phase blocks */}
      {PHASES.map(({ phase, weeks: weekNums }) => {
        const meta = PHASE_META[phase];
        const phaseWeeks = weekNums
          .map((n) => PLAN.find((w) => w.weekNumber === n)!)
          .filter(Boolean);
        const phaseHours = phaseWeeks.reduce((s, w) => s + w.totalHours, 0);

        return (
          <div key={phase}>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-1 h-8 rounded-full"
                style={{ backgroundColor: meta.color }}
              />
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  {meta.name}
                </h2>
                <p className="text-xs text-muted">
                  Weeks {weekNums[0]}–{weekNums[weekNums.length - 1]} ·{" "}
                  {phaseHours}h total
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {phaseWeeks.map((week) => (
                <WeekAccordion
                  key={week.weekNumber}
                  week={week}
                  isExpanded={expandedWeek === week.weekNumber}
                  isCurrent={currentWeek === week.weekNumber}
                  onToggle={() =>
                    setExpandedWeek(
                      expandedWeek === week.weekNumber
                        ? null
                        : week.weekNumber
                    )
                  }
                  progress={progress}
                  toggle={toggle}
                  isDone={isDone}
                  saveEntry={saveEntry}
                  getEntry={getEntry}
                  onSelectSession={setSelectedSession}
                />
              ))}
            </div>
          </div>
        );
      })}

      {selectedSession && (
        <SessionDetailModal
          session={selectedSession}
          entry={getEntry(selectedSession.id)}
          isDone={isDone(selectedSession.id)}
          onToggle={toggle}
          onSaveEntry={saveEntry}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </div>
  );
}

function WeekAccordion({
  week,
  isExpanded,
  isCurrent,
  onToggle,
  progress,
  toggle,
  isDone,
  saveEntry,
  getEntry,
  onSelectSession,
}: {
  week: (typeof PLAN)[number];
  isExpanded: boolean;
  isCurrent: boolean;
  onToggle: () => void;
  progress: ProgressMap;
  toggle: (id: string) => void;
  isDone: (id: string) => boolean;
  saveEntry: (id: string, rpe: number, note: string) => void;
  getEntry: (id: string) => SessionEntry | undefined;
  onSelectSession: (session: Session) => void;
}) {
  const meta = PHASE_META[week.phase];
  const stats = useWeekStats(week.weekNumber, progress);
  const startDate = formatDate(getDateForDay(week.weekNumber, "mon"));
  const endDate = formatDate(getDateForDay(week.weekNumber, "sun"));

  return (
    <div
      className={`border rounded-2xl overflow-hidden transition-all ${
        isCurrent
          ? "border-foreground/15 bg-card"
          : "border-border bg-card/60"
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-card-hover transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
            style={{ backgroundColor: meta.color }}
          >
            {week.weekNumber}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">
                Week {week.weekNumber}
              </h3>
              {week.isDeload && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-done-bg text-done font-semibold">
                  Deload
                </span>
              )}
              {isCurrent && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-foreground text-background font-semibold">
                  Current
                </span>
              )}
            </div>
            <p className="text-xs text-muted">
              {startDate} – {endDate} · {week.totalHours}h
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {stats.pct > 0 && (
            <span className="text-xs font-mono text-muted">{stats.pct}%</span>
          )}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-muted transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-border">
          {/* Week progress */}
          <div className="px-5 pt-3 pb-2">
            <div className="h-1.5 bg-border-light rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${stats.pct}%`, backgroundColor: meta.color }}
              />
            </div>
          </div>

          {week.notes && (
            <p className="px-5 py-2 text-xs text-muted leading-relaxed">
              {week.notes}
            </p>
          )}

          <div className="px-3 pb-3 space-y-1">
            {week.days.map((dayPlan) => {
              const dateStr = getDateForDay(week.weekNumber, dayPlan.day);
              const isRest = dayPlan.sessions.every(
                (s) => s.type === "rest" || s.durationMinutes === 0
              );

              return (
                <div key={dayPlan.day}>
                  <div className="flex items-center gap-2 px-3 py-1.5">
                    <span className="text-[10px] font-semibold text-muted uppercase w-10">
                      {dayPlan.day}
                    </span>
                    <span className="text-[10px] text-muted-light">
                      {formatDate(dateStr)}
                    </span>
                    {isRest && (
                      <span className="text-[10px] text-muted-light ml-auto">
                        Rest
                      </span>
                    )}
                  </div>
                  {!isRest &&
                    dayPlan.sessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center gap-1"
                      >
                        <div
                          className="flex-1 cursor-pointer rounded-xl hover:bg-card-hover transition-colors"
                          onClick={() => onSelectSession(session)}
                        >
                          <SessionCard
                            session={session}
                            entry={getEntry(session.id)}
                            isDone={isDone(session.id)}
                            onToggle={toggle}
                            onSaveEntry={saveEntry}
                            compact
                          />
                        </div>
                        {session.type !== "rest" &&
                          session.durationMinutes > 0 && (
                            <button
                              onClick={() => toggle(session.id)}
                              className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all mr-3 ${
                                isDone(session.id)
                                  ? "bg-done border-done text-white"
                                  : "border-border hover:border-muted-light"
                              }`}
                            >
                              {isDone(session.id) && (
                                <svg
                                  width="10"
                                  height="10"
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
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
