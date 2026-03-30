"use client";

import type { ProgressMap } from "./progress";
import { PLAN, getAllSessions } from "@/data/plan";

export { useProgress } from "@/context/ProgressProvider";

export function useStats(progress: ProgressMap) {
  const allSessions = getAllSessions().filter(
    (s) => s.type !== "rest" && s.durationMinutes > 0
  );

  const doneSessions = allSessions.filter((s) => progress[s.id]?.done);

  const totalPlannedMinutes = allSessions.reduce(
    (sum, s) => sum + s.durationMinutes,
    0
  );
  const doneMinutes = doneSessions.reduce(
    (sum, s) => sum + s.durationMinutes,
    0
  );
  const remainingMinutes = totalPlannedMinutes - doneMinutes;

  const totalPlannedHours = Math.round((totalPlannedMinutes / 60) * 10) / 10;
  const doneHours = Math.round((doneMinutes / 60) * 10) / 10;
  const remainingHours = Math.round((remainingMinutes / 60) * 10) / 10;

  const totalSessions = allSessions.length;
  const completedSessions = doneSessions.length;
  const completionPct =
    totalSessions > 0
      ? Math.round((completedSessions / totalSessions) * 100)
      : 0;

  const weeksWithAllDone = PLAN.filter((week) => {
    const weekSessions = week.days
      .flatMap((d) => d.sessions)
      .filter((s) => s.type !== "rest" && s.durationMinutes > 0);
    return (
      weekSessions.length > 0 && weekSessions.every((s) => progress[s.id]?.done)
    );
  }).length;

  return {
    totalPlannedHours,
    doneHours,
    remainingHours,
    totalSessions,
    completedSessions,
    completionPct,
    weeksCompleted: weeksWithAllDone,
  };
}

export function useWeekStats(weekNumber: number, progress: ProgressMap) {
  const week = PLAN.find((w) => w.weekNumber === weekNumber);
  if (!week) return { doneMinutes: 0, totalMinutes: 0, pct: 0 };

  const sessions = week.days
    .flatMap((d) => d.sessions)
    .filter((s) => s.type !== "rest" && s.durationMinutes > 0);

  const totalMinutes = sessions.reduce((s, sess) => s + sess.durationMinutes, 0);
  const doneMinutes = sessions
    .filter((s) => progress[s.id]?.done)
    .reduce((sum, s) => sum + s.durationMinutes, 0);
  const pct =
    totalMinutes > 0
      ? Math.round((doneMinutes / totalMinutes) * 100)
      : 0;

  return { doneMinutes, totalMinutes, pct };
}
