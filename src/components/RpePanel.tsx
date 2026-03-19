"use client";

import { useState } from "react";

interface RpePanelProps {
  initialRpe?: number;
  initialNote?: string;
  onSave: (rpe: number, note: string) => void;
  onSkip: () => void;
}

const RPE_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: "Very Easy", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  2: { label: "Very Easy", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  3: { label: "Easy", color: "bg-green-100 text-green-700 border-green-200" },
  4: { label: "Moderate", color: "bg-lime-100 text-lime-700 border-lime-200" },
  5: { label: "Moderate", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  6: { label: "Hard", color: "bg-amber-100 text-amber-700 border-amber-200" },
  7: { label: "Hard", color: "bg-orange-100 text-orange-700 border-orange-200" },
  8: { label: "Very Hard", color: "bg-orange-100 text-orange-800 border-orange-300" },
  9: { label: "Maximum", color: "bg-red-100 text-red-700 border-red-200" },
  10: { label: "Maximum", color: "bg-red-100 text-red-800 border-red-300" },
};

export default function RpePanel({
  initialRpe,
  initialNote = "",
  onSave,
  onSkip,
}: RpePanelProps) {
  const [rpe, setRpe] = useState<number | null>(initialRpe ?? null);
  const [note, setNote] = useState(initialNote);

  const rpeMeta = rpe ? RPE_LABELS[rpe] : null;

  return (
    <div className="mt-4 pt-4 border-t border-border/60 space-y-4">
      <div>
        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2.5">
          How hard was it?
        </p>
        <div className="grid grid-cols-10 gap-1">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setRpe(n)}
              className={`h-9 rounded-lg text-sm font-bold border transition-all duration-150 ${
                rpe === n
                  ? rpeMeta?.color ?? "bg-foreground text-background border-foreground"
                  : "bg-background border-border text-muted hover:border-muted-light hover:text-foreground"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        {rpeMeta && (
          <p className="text-xs text-muted mt-1.5">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${rpeMeta.color}`}>
              {rpe} — {rpeMeta.label}
            </span>
          </p>
        )}
      </div>

      <div>
        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
          Notes <span className="normal-case font-normal">(optional)</span>
        </p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Legs felt heavy, wind was brutal…"
          rows={2}
          className="w-full text-sm bg-background border border-border rounded-xl px-3 py-2 resize-none placeholder:text-muted-light focus:outline-none focus:ring-1 focus:ring-foreground/20 transition"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onSave(rpe ?? 5, note)}
          disabled={!rpe}
          className="flex-1 h-9 bg-foreground text-background text-sm font-semibold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
        >
          Save
        </button>
        <button
          onClick={onSkip}
          className="h-9 px-4 text-sm text-muted hover:text-foreground transition-colors"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
