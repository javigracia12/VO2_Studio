"use client";

import { PLAN, PHASE_META, type Phase } from "@/data/plan";
import { getCurrentWeekNumber } from "@/lib/schedule";
import { type ProgressMap } from "@/lib/progress";
import { useWeekStats } from "@/lib/hooks";

interface WeekBarProps {
  weekNumber: number;
  totalHours: number;
  maxHours: number;
  phase: Phase;
  isCurrent: boolean;
  progress: ProgressMap;
}

function WeekBar({ weekNumber, totalHours, maxHours, phase, isCurrent, progress }: WeekBarProps) {
  const { pct } = useWeekStats(weekNumber, progress);
  const heightPct = (totalHours / maxHours) * 100;
  const phaseMeta = PHASE_META[phase];

  return (
    <div className="flex flex-col items-center gap-1.5 flex-1">
      <div className="relative w-full h-32 flex items-end justify-center">
        <div
          className="w-full max-w-[28px] rounded-t-md transition-all duration-500 relative overflow-hidden"
          style={{
            height: `${heightPct}%`,
            backgroundColor: isCurrent ? phaseMeta.color : phaseMeta.bg,
          }}
        >
          {pct > 0 && (
            <div
              className="absolute bottom-0 left-0 right-0 transition-all duration-500"
              style={{
                height: `${pct}%`,
                backgroundColor: phaseMeta.color,
                opacity: isCurrent ? 1 : 0.7,
              }}
            />
          )}
        </div>
      </div>
      <span
        className={`text-[10px] tabular-nums ${
          isCurrent ? "font-semibold text-foreground" : "text-muted-light"
        }`}
      >
        {weekNumber}
      </span>
    </div>
  );
}

export default function WeekChart({ progress }: { progress: ProgressMap }) {
  const currentWeek = getCurrentWeekNumber();
  const maxHours = Math.max(...PLAN.map((w) => w.totalHours));

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Training Volume</h3>
        <span className="text-xs text-muted">hours / week</span>
      </div>
      <div className="flex gap-0.5">
        {PLAN.map((week) => (
          <WeekBar
            key={week.weekNumber}
            weekNumber={week.weekNumber}
            totalHours={week.totalHours}
            maxHours={maxHours}
            phase={week.phase}
            isCurrent={week.weekNumber === currentWeek}
            progress={progress}
          />
        ))}
      </div>
      <div className="flex items-center gap-4 mt-4 flex-wrap">
        {(Object.keys(PHASE_META) as Phase[]).map((phase) => (
          <div key={phase} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: PHASE_META[phase].color }}
            />
            <span className="text-[10px] text-muted font-medium">
              {PHASE_META[phase].name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
