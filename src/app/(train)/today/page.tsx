"use client";

import { useState } from "react";
import { PHASE_META, type Session } from "@/data/plan";
import {
  getTodayPlan,
  getTomorrowPlan,
  getDateForDay,
  formatDateLong,
  hasTrainingStarted,
  daysUntilStart,
} from "@/lib/schedule";
import { useProgress } from "@/lib/hooks";
import SessionCard from "@/components/SessionCard";
import SessionDetailModal from "@/components/SessionDetailModal";

export default function TodayPage() {
  const { toggle, isDone, saveEntry, getEntry } = useProgress();
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const started = hasTrainingStarted();
  const todayPlan = getTodayPlan();
  const tomorrowPlan = getTomorrowPlan();

  if (!started) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Not yet</h1>
          <p className="text-muted mt-2">
            Training starts in <strong>{daysUntilStart()} days</strong>. Enjoy
            the rest while it lasts.
          </p>
        </div>
        {tomorrowPlan && (
          <div>
            <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
              Coming up first
            </h2>
            <div className="space-y-3">
              {tomorrowPlan.day.sessions.map((session) => (
                <div
                  key={session.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedSession(session)}
                >
                  <SessionCard
                    session={session}
                    isDone={isDone(session.id)}
                    onToggle={toggle}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
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

  const todayDate = todayPlan
    ? formatDateLong(getDateForDay(todayPlan.week.weekNumber, todayPlan.day.day))
    : "";
  const todayPhase = todayPlan ? PHASE_META[todayPlan.week.phase] : null;
  const todayTotalMin =
    todayPlan?.day.sessions.reduce((s, sess) => s + sess.durationMinutes, 0) ?? 0;
  const isRestDay =
    todayPlan?.day.sessions.every(
      (s) => s.type === "rest" || s.durationMinutes === 0
    ) ?? true;

  return (
    <div className="space-y-10">
      {/* Today */}
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          {todayPhase && (
            <span
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
              style={{ backgroundColor: todayPhase.bg, color: todayPhase.color }}
            >
              Week {todayPlan!.week.weekNumber}
            </span>
          )}
          <span className="text-xs text-muted">{todayDate}</span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight mt-3">
          {isRestDay ? "Rest Day" : "Today's Training"}
        </h1>

        {!isRestDay && todayTotalMin > 0 && (
          <p className="text-muted mt-1">
            {todayTotalMin >= 60
              ? `${(todayTotalMin / 60).toFixed(1)}h`
              : `${todayTotalMin} min`}{" "}
            of training today
          </p>
        )}
        {isRestDay && (
          <p className="text-muted mt-1">
            Take it easy. Recovery is where adaptation happens.
          </p>
        )}

        <div className="mt-6 space-y-3">
          {todayPlan?.day.sessions.map((session) => (
            <div
              key={session.id}
              className="cursor-pointer"
              onClick={() => setSelectedSession(session)}
            >
              <SessionCard
                session={session}
                entry={getEntry(session.id)}
                isDone={isDone(session.id)}
                onToggle={toggle}
                onSaveEntry={saveEntry}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Tomorrow */}
      {tomorrowPlan && (
        <div>
          <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">
            Tomorrow
          </h2>
          <div className="space-y-3">
            {tomorrowPlan.day.sessions.map((session) => (
              <div
                key={session.id}
                className="cursor-pointer"
                onClick={() => setSelectedSession(session)}
              >
                <SessionCard
                  session={session}
                  entry={getEntry(session.id)}
                  isDone={isDone(session.id)}
                  onToggle={toggle}
                  onSaveEntry={saveEntry}
                />
              </div>
            ))}
          </div>
        </div>
      )}

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
