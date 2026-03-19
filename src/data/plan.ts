export type DayOfWeek = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type SessionType =
  | "bike-trainer"
  | "bike-outdoor"
  | "strength"
  | "run"
  | "rest"
  | "mobility";

export type Intensity = "recovery" | "easy" | "moderate" | "hard" | "very-hard";

export type Phase = "foundation" | "build" | "specific" | "peak" | "taper";

export interface Session {
  id: string;
  type: SessionType;
  title: string;
  description: string;
  durationMinutes: number;
  intensity: Intensity;
}

export interface DayPlan {
  day: DayOfWeek;
  label: string;
  sessions: Session[];
}

export interface WeekPlan {
  weekNumber: number;
  phase: Phase;
  phaseName: string;
  phaseNumber: number;
  isDeload: boolean;
  totalHours: number;
  days: DayPlan[];
  notes?: string;
}

export const DAY_LABELS: Record<DayOfWeek, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

export const DAY_ORDER: DayOfWeek[] = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
];

export const PHASE_META: Record<
  Phase,
  { name: string; number: number; color: string; bg: string }
> = {
  foundation: {
    name: "Foundation",
    number: 1,
    color: "#2563eb",
    bg: "#dbeafe",
  },
  build: { name: "Build", number: 2, color: "#7c3aed", bg: "#ede9fe" },
  specific: {
    name: "Specific Durability",
    number: 3,
    color: "#ea580c",
    bg: "#ffedd5",
  },
  peak: { name: "Peak Specificity", number: 4, color: "#dc2626", bg: "#fee2e2" },
  taper: { name: "Taper", number: 5, color: "#16a34a", bg: "#dcfce7" },
};

export const ZONES = [
  { name: "Recovery", power: "< 130 W", description: "Easy spins, fatigue-management" },
  { name: "Endurance", power: "130–150 W", description: "Long rides, aerobic base" },
  { name: "Tempo", power: "160–176 W", description: "Controlled work on tired legs" },
  { name: "Sweet Spot", power: "176–186 W", description: "Best weekday cost-benefit" },
  { name: "Threshold", power: "190–200 W", description: "Selective use in build phase" },
  { name: "VO2max", power: "216–232 W", description: "Short controlled intervals" },
];

function d(day: DayOfWeek, sessions: Session[]): DayPlan {
  return { day, label: DAY_LABELS[day], sessions };
}

function rest(weekNum: number, day: DayOfWeek): DayPlan {
  return d(day, [
    {
      id: `w${weekNum}-${day}-rest`,
      type: "rest",
      title: "Rest Day",
      description: "Complete rest. Mobility only if it helps you feel better.",
      durationMinutes: 0,
      intensity: "recovery",
    },
  ]);
}

function off(weekNum: number, day: DayOfWeek): DayPlan {
  return d(day, [
    {
      id: `w${weekNum}-${day}-off`,
      type: "rest",
      title: "Day Off",
      description: "Off, light mobility, or a very easy 30–45 min spin if needed.",
      durationMinutes: 0,
      intensity: "recovery",
    },
  ]);
}

// ---------- WEEK DATA ----------

export const PLAN: WeekPlan[] = [
  // ===== PHASE 1: FOUNDATION (Weeks 1–4) =====
  {
    weekNumber: 1,
    phase: "foundation",
    phaseName: "Foundation",
    phaseNumber: 1,
    isDeload: false,
    totalHours: 7,
    days: [
      d("mon", [
        {
          id: "w1-mon-bike",
          type: "bike-trainer",
          title: "Endurance + Tempo Blocks",
          description:
            "60 min trainer ride. Endurance base with 2×10 min at 160–170 W.",
          durationMinutes: 60,
          intensity: "moderate",
        },
      ]),
      rest(1, "tue"),
      d("wed", [
        {
          id: "w1-wed-bike",
          type: "bike-trainer",
          title: "Sweet Spot Intervals",
          description:
            "65 min Zwift workout. 3×8 min at 176–180 W with recovery between.",
          durationMinutes: 65,
          intensity: "hard",
        },
      ]),
      d("thu", [
        {
          id: "w1-thu-gym",
          type: "strength",
          title: "Strength Training",
          description:
            "40–50 min gym. Squat or trap-bar DL 3–4×4–6, RDL 3×5–6, Bulgarian split squat 3×6/leg, calf raises 3×10–12, plank/pallof press 3 sets.",
          durationMinutes: 45,
          intensity: "moderate",
        },
      ]),
      d("fri", [
        {
          id: "w1-thu-run",
          type: "run",
          title: "Easy Run",
          description: "20–25 min easy run. Conversational pace around 5:30/km.",
          durationMinutes: 22,
          intensity: "easy",
        },
      ]),
      d("sat", [
        {
          id: "w1-sat-bike",
          type: "bike-outdoor",
          title: "Long Endurance Ride",
          description: "2.5 h outdoor ride at Z2 (130–150 W). Steady and controlled.",
          durationMinutes: 150,
          intensity: "easy",
        },
      ]),
      d("sun", [
        {
          id: "w1-sun-bike",
          type: "bike-outdoor",
          title: "Endurance Ride",
          description: "2 h outdoor ride at Z2. Build repeatability under fatigue.",
          durationMinutes: 120,
          intensity: "easy",
        },
      ]),
    ],
  },
  {
    weekNumber: 2,
    phase: "foundation",
    phaseName: "Foundation",
    phaseNumber: 1,
    isDeload: false,
    totalHours: 8,
    days: [
      d("mon", [
        {
          id: "w2-mon-bike",
          type: "bike-trainer",
          title: "Endurance + Tempo Blocks",
          description:
            "70 min trainer ride. 2×12 min at 164–172 W on weekend-fatigued legs.",
          durationMinutes: 70,
          intensity: "moderate",
        },
      ]),
      rest(2, "tue"),
      d("wed", [
        {
          id: "w2-wed-bike",
          type: "bike-trainer",
          title: "Sweet Spot Intervals",
          description: "70 min Zwift workout. 3×10 min at 178–182 W.",
          durationMinutes: 70,
          intensity: "hard",
        },
      ]),
      d("thu", [
        {
          id: "w2-thu-gym",
          type: "strength",
          title: "Strength Training",
          description:
            "45 min gym. Same movement patterns as Week 1, progressive overload.",
          durationMinutes: 45,
          intensity: "moderate",
        },
      ]),
      d("fri", [
        {
          id: "w2-thu-run",
          type: "run",
          title: "Easy Run",
          description: "25–30 min easy run at conversational pace.",
          durationMinutes: 27,
          intensity: "easy",
        },
      ]),
      d("sat", [
        {
          id: "w2-sat-bike",
          type: "bike-outdoor",
          title: "Long Endurance Ride",
          description: "3 h outdoor ride. Steady Z2 effort.",
          durationMinutes: 180,
          intensity: "easy",
        },
      ]),
      d("sun", [
        {
          id: "w2-sun-bike",
          type: "bike-outdoor",
          title: "Endurance Ride",
          description: "2.5 h outdoor ride at Z2.",
          durationMinutes: 150,
          intensity: "easy",
        },
      ]),
    ],
  },
  {
    weekNumber: 3,
    phase: "foundation",
    phaseName: "Foundation",
    phaseNumber: 1,
    isDeload: false,
    totalHours: 9,
    days: [
      d("mon", [
        {
          id: "w3-mon-bike",
          type: "bike-trainer",
          title: "Endurance + Tempo Blocks",
          description:
            "75 min trainer ride. 3×10 min at 160–170 W, smooth and seated.",
          durationMinutes: 75,
          intensity: "moderate",
        },
      ]),
      rest(3, "tue"),
      d("wed", [
        {
          id: "w3-wed-bike",
          type: "bike-trainer",
          title: "Sweet Spot Intervals",
          description: "75 min Zwift workout. 2×15 min at 180–184 W.",
          durationMinutes: 75,
          intensity: "hard",
        },
      ]),
      d("thu", [
        {
          id: "w3-thu-gym",
          type: "strength",
          title: "Strength Training",
          description: "45 min gym. Same core lifts, building load.",
          durationMinutes: 45,
          intensity: "moderate",
        },
      ]),
      d("fri", [
        {
          id: "w3-thu-run",
          type: "run",
          title: "Easy Run",
          description: "30 min easy run.",
          durationMinutes: 30,
          intensity: "easy",
        },
      ]),
      d("sat", [
        {
          id: "w3-sat-bike",
          type: "bike-outdoor",
          title: "Long Ride + Tempo Finish",
          description:
            "3.5 h outdoor ride. Steady Z2 with last 20 min at tempo effort.",
          durationMinutes: 210,
          intensity: "moderate",
        },
      ]),
      d("sun", [
        {
          id: "w3-sun-bike",
          type: "bike-outdoor",
          title: "Endurance Ride",
          description: "2.5 h easy outdoor ride.",
          durationMinutes: 150,
          intensity: "easy",
        },
      ]),
    ],
  },
  {
    weekNumber: 4,
    phase: "foundation",
    phaseName: "Foundation",
    phaseNumber: 1,
    isDeload: true,
    totalHours: 6.25,
    notes:
      "Deload week. Either keep Monday easy or use it for a Zwift ramp test to refresh your FTP estimate before the build phase.",
    days: [
      d("mon", [
        {
          id: "w4-mon-bike",
          type: "bike-trainer",
          title: "Easy Spin / FTP Test",
          description:
            "45–60 min easy or use this session for a Zwift ramp test.",
          durationMinutes: 52,
          intensity: "easy",
        },
      ]),
      rest(4, "tue"),
      d("wed", [
        {
          id: "w4-wed-bike",
          type: "bike-trainer",
          title: "Short VO2 Intervals",
          description: "60 min Zwift workout. 4×4 min at 205–210 W.",
          durationMinutes: 60,
          intensity: "very-hard",
        },
      ]),
      d("thu", [
        {
          id: "w4-thu-gym",
          type: "strength",
          title: "Lighter Strength",
          description: "35 min lighter gym. Reduced volume, maintain patterns.",
          durationMinutes: 35,
          intensity: "easy",
        },
      ]),
      d("fri", [
        {
          id: "w4-thu-run",
          type: "run",
          title: "Easy Run",
          description: "20–25 min easy run.",
          durationMinutes: 22,
          intensity: "easy",
        },
      ]),
      d("sat", [
        {
          id: "w4-sat-bike",
          type: "bike-outdoor",
          title: "Easy Ride",
          description: "2 h easy outdoor ride.",
          durationMinutes: 120,
          intensity: "easy",
        },
      ]),
      d("sun", [
        {
          id: "w4-sun-bike",
          type: "bike-outdoor",
          title: "Easy Ride",
          description: "1.5–2 h easy outdoor ride.",
          durationMinutes: 105,
          intensity: "easy",
        },
      ]),
    ],
  },

  // ===== PHASE 2: BUILD (Weeks 5–8) =====
  {
    weekNumber: 5,
    phase: "build",
    phaseName: "Build",
    phaseNumber: 2,
    isDeload: false,
    totalHours: 9,
    days: [
      d("mon", [
        {
          id: "w5-mon-bike",
          type: "bike-trainer",
          title: "Endurance + Tempo Blocks",
          description: "70 min trainer ride. 2×15 min at 168–176 W.",
          durationMinutes: 70,
          intensity: "moderate",
        },
      ]),
      rest(5, "tue"),
      d("wed", [
        {
          id: "w5-wed-bike",
          type: "bike-trainer",
          title: "Threshold Intervals",
          description: "75 min Zwift workout. 4×8 min at 190–196 W.",
          durationMinutes: 75,
          intensity: "hard",
        },
      ]),
      d("thu", [
        {
          id: "w5-thu-gym",
          type: "strength",
          title: "Strength Training",
          description: "45 min gym. Core lifts with progressive overload.",
          durationMinutes: 45,
          intensity: "moderate",
        },
      ]),
      d("fri", [
        {
          id: "w5-thu-run",
          type: "run",
          title: "Easy Run",
          description: "30 min easy run.",
          durationMinutes: 30,
          intensity: "easy",
        },
      ]),
      d("sat", [
        {
          id: "w5-sat-bike",
          type: "bike-outdoor",
          title: "Long Endurance Ride",
          description: "4 h outdoor ride. Steady endurance pace.",
          durationMinutes: 240,
          intensity: "easy",
        },
      ]),
      d("sun", [
        {
          id: "w5-sun-bike",
          type: "bike-outdoor",
          title: "Endurance Ride",
          description: "3 h outdoor ride at Z2.",
          durationMinutes: 180,
          intensity: "easy",
        },
      ]),
    ],
  },
  {
    weekNumber: 6,
    phase: "build",
    phaseName: "Build",
    phaseNumber: 2,
    isDeload: false,
    totalHours: 10,
    days: [
      d("mon", [
        {
          id: "w6-mon-bike",
          type: "bike-trainer",
          title: "Endurance + Tempo Blocks",
          description: "75 min trainer ride. 3×12 min at 170–176 W.",
          durationMinutes: 75,
          intensity: "moderate",
        },
      ]),
      rest(6, "tue"),
      d("wed", [
        {
          id: "w6-wed-bike",
          type: "bike-trainer",
          title: "VO2max Intervals",
          description: "75 min Zwift workout. 5×4 min at 216–224 W.",
          durationMinutes: 75,
          intensity: "very-hard",
        },
      ]),
      d("thu", [
        {
          id: "w6-thu-gym",
          type: "strength",
          title: "Strength Training",
          description: "45 min gym. Core lifts, progressive overload.",
          durationMinutes: 45,
          intensity: "moderate",
        },
      ]),
      d("fri", [
        {
          id: "w6-thu-run",
          type: "run",
          title: "Easy Run",
          description: "30–35 min easy run.",
          durationMinutes: 32,
          intensity: "easy",
        },
      ]),
      d("sat", [
        {
          id: "w6-sat-bike",
          type: "bike-outdoor",
          title: "Long Endurance Ride",
          description: "4.5 h outdoor ride. Steady endurance.",
          durationMinutes: 270,
          intensity: "easy",
        },
      ]),
      d("sun", [
        {
          id: "w6-sun-bike",
          type: "bike-outdoor",
          title: "Endurance Ride",
          description: "3 h outdoor ride at Z2.",
          durationMinutes: 180,
          intensity: "easy",
        },
      ]),
    ],
  },
  {
    weekNumber: 7,
    phase: "build",
    phaseName: "Build",
    phaseNumber: 2,
    isDeload: false,
    totalHours: 10.5,
    days: [
      d("mon", [
        {
          id: "w7-mon-bike",
          type: "bike-trainer",
          title: "Endurance + Long Tempo",
          description: "75 min trainer ride. 2×20 min at 170–176 W.",
          durationMinutes: 75,
          intensity: "moderate",
        },
      ]),
      rest(7, "tue"),
      d("wed", [
        {
          id: "w7-wed-bike",
          type: "bike-trainer",
          title: "Over-Unders",
          description:
            "80 min Zwift workout. 3×12 min alternating 190–195 W and 178–182 W.",
          durationMinutes: 80,
          intensity: "hard",
        },
      ]),
      d("thu", [
        {
          id: "w7-thu-gym",
          type: "strength",
          title: "Strength Training",
          description: "45 min gym. Core lifts, building toward peak loads.",
          durationMinutes: 45,
          intensity: "moderate",
        },
      ]),
      d("fri", [
        {
          id: "w7-thu-run",
          type: "run",
          title: "Easy Run",
          description: "35 min easy run.",
          durationMinutes: 35,
          intensity: "easy",
        },
      ]),
      d("sat", [
        {
          id: "w7-sat-bike",
          type: "bike-outdoor",
          title: "Long Ride + Tempo Blocks",
          description: "4.5 h outdoor ride with 3×15 min at tempo.",
          durationMinutes: 270,
          intensity: "moderate",
        },
      ]),
      d("sun", [
        {
          id: "w7-sun-bike",
          type: "bike-outdoor",
          title: "Endurance Ride",
          description: "3.5 h outdoor ride at Z2.",
          durationMinutes: 210,
          intensity: "easy",
        },
      ]),
    ],
  },
  {
    weekNumber: 8,
    phase: "build",
    phaseName: "Build",
    phaseNumber: 2,
    isDeload: true,
    totalHours: 7,
    notes:
      "Deload week. Use Monday for a ramp test if you want a new FTP estimate before the specific phase.",
    days: [
      d("mon", [
        {
          id: "w8-mon-bike",
          type: "bike-trainer",
          title: "Easy Spin / FTP Test",
          description:
            "45–60 min easy or use this for a new Zwift ramp/FTP check.",
          durationMinutes: 52,
          intensity: "easy",
        },
      ]),
      rest(8, "tue"),
      d("wed", [
        {
          id: "w8-wed-bike",
          type: "bike-trainer",
          title: "Threshold Intervals",
          description: "60–65 min Zwift workout. 3×6 min at 190–196 W.",
          durationMinutes: 62,
          intensity: "hard",
        },
      ]),
      d("thu", [
        {
          id: "w8-thu-gym",
          type: "strength",
          title: "Lighter Strength",
          description: "35 min lighter gym. Reduced volume.",
          durationMinutes: 35,
          intensity: "easy",
        },
      ]),
      d("fri", [
        {
          id: "w8-thu-run",
          type: "run",
          title: "Easy Run",
          description: "25 min easy run.",
          durationMinutes: 25,
          intensity: "easy",
        },
      ]),
      d("sat", [
        {
          id: "w8-sat-bike",
          type: "bike-outdoor",
          title: "Easy Ride",
          description: "3 h easy outdoor ride.",
          durationMinutes: 180,
          intensity: "easy",
        },
      ]),
      d("sun", [
        {
          id: "w8-sun-bike",
          type: "bike-outdoor",
          title: "Easy Ride",
          description: "2 h easy outdoor ride.",
          durationMinutes: 120,
          intensity: "easy",
        },
      ]),
    ],
  },

  // ===== PHASE 3: SPECIFIC DURABILITY (Weeks 9–12) =====
  {
    weekNumber: 9,
    phase: "specific",
    phaseName: "Specific Durability",
    phaseNumber: 3,
    isDeload: false,
    totalHours: 10.5,
    notes:
      "Weekend fueling practice is non-negotiable from here onward. 75–90 g/h carbs on rides > 4 h.",
    days: [
      d("mon", [
        {
          id: "w9-mon-bike",
          type: "bike-trainer",
          title: "Tired-Legs Tempo",
          description:
            "75 min trainer ride. 2×20 min at 160–170 W on tired legs.",
          durationMinutes: 75,
          intensity: "moderate",
        },
      ]),
      rest(9, "tue"),
      d("wed", [
        {
          id: "w9-wed-bike",
          type: "bike-trainer",
          title: "VO2max Intervals",
          description: "80 min Zwift workout. 5×5 min at 210–220 W.",
          durationMinutes: 80,
          intensity: "very-hard",
        },
      ]),
      d("thu", [
        {
          id: "w9-thu-gym",
          type: "strength",
          title: "Strength Maintenance",
          description:
            "30–35 min maintenance gym. Same patterns, only 2 work sets each.",
          durationMinutes: 32,
          intensity: "moderate",
        },
      ]),
      d("fri", [
        {
          id: "w9-thu-run",
          type: "run",
          title: "Easy Run",
          description: "25–30 min easy run.",
          durationMinutes: 27,
          intensity: "easy",
        },
      ]),
      d("sat", [
        {
          id: "w9-sat-bike",
          type: "bike-outdoor",
          title: "Long Ride — Fueling Rehearsal",
          description:
            "5 h outdoor ride. Full fueling rehearsal — practice race intake (75–90 g/h carbs).",
          durationMinutes: 300,
          intensity: "easy",
        },
      ]),
      d("sun", [
        {
          id: "w9-sun-bike",
          type: "bike-outdoor",
          title: "Endurance Ride",
          description: "3.5 h easy outdoor ride.",
          durationMinutes: 210,
          intensity: "easy",
        },
      ]),
    ],
  },
  {
    weekNumber: 10,
    phase: "specific",
    phaseName: "Specific Durability",
    phaseNumber: 3,
    isDeload: false,
    totalHours: 11,
    days: [
      d("mon", [
        {
          id: "w10-mon-bike",
          type: "bike-trainer",
          title: "Sweet Spot Blocks",
          description: "70 min trainer ride. 3×12 min at 176–180 W.",
          durationMinutes: 70,
          intensity: "hard",
        },
      ]),
      rest(10, "tue"),
      d("wed", [
        {
          id: "w10-wed-bike",
          type: "bike-trainer",
          title: "Sustained Sweet Spot",
          description: "75 min Zwift workout. 3×15 min at 184–190 W.",
          durationMinutes: 75,
          intensity: "hard",
        },
      ]),
      d("thu", [
        {
          id: "w10-thu-gym",
          type: "strength",
          title: "Strength Maintenance",
          description: "30 min maintenance gym. 2 work sets per exercise.",
          durationMinutes: 30,
          intensity: "moderate",
        },
      ]),
      d("fri", [
        {
          id: "w10-thu-run",
          type: "run",
          title: "Easy Run",
          description: "30 min easy run.",
          durationMinutes: 30,
          intensity: "easy",
        },
      ]),
      d("sat", [
        {
          id: "w10-sat-bike",
          type: "bike-outdoor",
          title: "Long Ride + Upper Z2",
          description:
            "5 h outdoor ride including 2×30 min at upper Z2 (145–150 W).",
          durationMinutes: 300,
          intensity: "moderate",
        },
      ]),
      d("sun", [
        {
          id: "w10-sun-bike",
          type: "bike-outdoor",
          title: "Steady Endurance Ride",
          description: "4 h steady outdoor ride.",
          durationMinutes: 240,
          intensity: "easy",
        },
      ]),
    ],
  },
  {
    weekNumber: 11,
    phase: "specific",
    phaseName: "Specific Durability",
    phaseNumber: 3,
    isDeload: false,
    totalHours: 12,
    notes:
      "First full dress rehearsal. Use the same bottles, snacks, clothing, contact points, and pacing mindset you expect in July.",
    days: [
      d("mon", [
        {
          id: "w11-mon-bike",
          type: "bike-trainer",
          title: "Easy or Tempo if Fresh",
          description:
            "60 min easy, or include 2×15 min at 160–170 W if legs feel good.",
          durationMinutes: 60,
          intensity: "easy",
        },
      ]),
      rest(11, "tue"),
      d("wed", [
        {
          id: "w11-wed-bike",
          type: "bike-trainer",
          title: "VO2max Intervals",
          description: "75 min Zwift workout. 6×3 min at 224–232 W.",
          durationMinutes: 75,
          intensity: "very-hard",
        },
      ]),
      d("thu", [
        {
          id: "w11-thu-gym",
          type: "strength",
          title: "Strength Maintenance",
          description: "30 min maintenance gym.",
          durationMinutes: 30,
          intensity: "moderate",
        },
      ]),
      d("fri", [
        {
          id: "w11-thu-run",
          type: "run",
          title: "Easy Run",
          description: "25 min easy run.",
          durationMinutes: 25,
          intensity: "easy",
        },
      ]),
      d("sat", [
        {
          id: "w11-sat-bike",
          type: "bike-outdoor",
          title: "Dress Rehearsal — 140 km",
          description:
            "5.5 h outdoor ride (~140 km). Full race simulation with race nutrition and pacing.",
          durationMinutes: 330,
          intensity: "moderate",
        },
      ]),
      d("sun", [
        {
          id: "w11-sun-bike",
          type: "bike-outdoor",
          title: "Endurance Ride — 100 km",
          description: "4 h outdoor ride (~100 km). Ride well on tired legs.",
          durationMinutes: 240,
          intensity: "easy",
        },
      ]),
    ],
  },
  {
    weekNumber: 12,
    phase: "specific",
    phaseName: "Specific Durability",
    phaseNumber: 3,
    isDeload: true,
    totalHours: 7.25,
    notes: "Deload week. Absorb the big block before peak specificity.",
    days: [
      d("mon", [
        {
          id: "w12-mon-bike",
          type: "bike-trainer",
          title: "Easy Spin",
          description: "45 min easy trainer ride.",
          durationMinutes: 45,
          intensity: "easy",
        },
      ]),
      rest(12, "tue"),
      d("wed", [
        {
          id: "w12-wed-bike",
          type: "bike-trainer",
          title: "Sweet Spot Intervals",
          description: "60 min Zwift workout. 2×12 min at 178–182 W.",
          durationMinutes: 60,
          intensity: "hard",
        },
      ]),
      d("thu", [
        {
          id: "w12-thu-gym",
          type: "strength",
          title: "Very Light Strength",
          description: "20–25 min very light gym. Activation only.",
          durationMinutes: 22,
          intensity: "easy",
        },
      ]),
      d("fri", [
        {
          id: "w12-thu-run",
          type: "run",
          title: "Easy Run",
          description: "20–25 min easy run.",
          durationMinutes: 22,
          intensity: "easy",
        },
      ]),
      d("sat", [
        {
          id: "w12-sat-bike",
          type: "bike-outdoor",
          title: "Easy Ride",
          description: "3 h easy outdoor ride.",
          durationMinutes: 180,
          intensity: "easy",
        },
      ]),
      d("sun", [
        {
          id: "w12-sun-bike",
          type: "bike-outdoor",
          title: "Easy Ride",
          description: "2.5 h easy outdoor ride.",
          durationMinutes: 150,
          intensity: "easy",
        },
      ]),
    ],
  },

  // ===== PHASE 4: PEAK SPECIFICITY (Weeks 13–14) =====
  {
    weekNumber: 13,
    phase: "peak",
    phaseName: "Peak Specificity",
    phaseNumber: 4,
    isDeload: false,
    totalHours: 12.5,
    notes:
      "Biggest event-specific block. Sat 140–160 km with full fueling. No heavy lifting from here.",
    days: [
      d("mon", [
        {
          id: "w13-mon-bike",
          type: "bike-trainer",
          title: "Endurance + Tempo",
          description: "75 min trainer ride. 2×15 min at 170–176 W.",
          durationMinutes: 75,
          intensity: "moderate",
        },
      ]),
      rest(13, "tue"),
      d("wed", [
        {
          id: "w13-wed-bike",
          type: "bike-trainer",
          title: "Sustained Sweet Spot",
          description: "70 min Zwift workout. 2×20 min at 180–184 W.",
          durationMinutes: 70,
          intensity: "hard",
        },
      ]),
      d("thu", [
        {
          id: "w13-thu-mobility",
          type: "mobility",
          title: "Mobility + Easy Jog",
          description:
            "Mobility work + 20–25 min easy jog. No heavy lifting from this week onward.",
          durationMinutes: 45,
          intensity: "easy",
        },
      ]),
      off(13, "fri"),
      d("sat", [
        {
          id: "w13-sat-bike",
          type: "bike-outdoor",
          title: "Peak Long Ride — 140–160 km",
          description:
            "6 h outdoor ride (140–160 km). Full fueling protocol. Race pacing.",
          durationMinutes: 360,
          intensity: "moderate",
        },
      ]),
      d("sun", [
        {
          id: "w13-sun-bike",
          type: "bike-outdoor",
          title: "Long Ride — 110–125 km",
          description: "4.5 h outdoor ride (110–125 km).",
          durationMinutes: 270,
          intensity: "easy",
        },
      ]),
    ],
  },
  {
    weekNumber: 14,
    phase: "peak",
    phaseName: "Peak Specificity",
    phaseNumber: 4,
    isDeload: false,
    totalHours: 10,
    days: [
      d("mon", [
        {
          id: "w14-mon-bike",
          type: "bike-trainer",
          title: "Easy + Tempo if Fresh",
          description:
            "60 min easy + 3×10 min at 160–170 W only if legs are good.",
          durationMinutes: 60,
          intensity: "easy",
        },
      ]),
      rest(14, "tue"),
      d("wed", [
        {
          id: "w14-wed-bike",
          type: "bike-trainer",
          title: "Threshold Intervals",
          description: "60–70 min Zwift workout. 4×6 min at 190–196 W.",
          durationMinutes: 65,
          intensity: "hard",
        },
      ]),
      d("thu", [
        {
          id: "w14-thu-mobility",
          type: "mobility",
          title: "Mobility + Optional Jog",
          description: "Mobility only + optional 20 min jog.",
          durationMinutes: 35,
          intensity: "recovery",
        },
      ]),
      off(14, "fri"),
      d("sat", [
        {
          id: "w14-sat-bike",
          type: "bike-outdoor",
          title: "Long Ride — 120–140 km",
          description: "5 h outdoor ride (120–140 km).",
          durationMinutes: 300,
          intensity: "easy",
        },
      ]),
      d("sun", [
        {
          id: "w14-sun-bike",
          type: "bike-outdoor",
          title: "Easy Ride — 90–110 km",
          description: "3.5–4 h easy outdoor ride (90–110 km).",
          durationMinutes: 225,
          intensity: "easy",
        },
      ]),
    ],
  },

  // ===== PHASE 5: TAPER (Weeks 15–16) =====
  {
    weekNumber: 15,
    phase: "taper",
    phaseName: "Taper",
    phaseNumber: 5,
    isDeload: false,
    totalHours: 7.5,
    notes:
      "Cut fatigue, keep enough intensity to feel sharp. Arrive at the event fresher than you think you need to be.",
    days: [
      d("mon", [
        {
          id: "w15-mon-bike",
          type: "bike-trainer",
          title: "Endurance + Tempo",
          description: "60 min trainer ride. 2×12 min at 168–176 W.",
          durationMinutes: 60,
          intensity: "moderate",
        },
      ]),
      rest(15, "tue"),
      d("wed", [
        {
          id: "w15-wed-bike",
          type: "bike-trainer",
          title: "Short VO2 Openers",
          description: "60 min Zwift workout. 4×3 min at 216–224 W.",
          durationMinutes: 60,
          intensity: "very-hard",
        },
      ]),
      d("thu", [
        {
          id: "w15-thu-mobility",
          type: "mobility",
          title: "Mobility & Core",
          description: "Mobility and core work only. No lifting, no run.",
          durationMinutes: 20,
          intensity: "recovery",
        },
      ]),
      off(15, "fri"),
      d("sat", [
        {
          id: "w15-sat-bike",
          type: "bike-outdoor",
          title: "Easy Ride + Tempo",
          description:
            "3–3.5 h easy outdoor ride with 3×8 min at tempo effort.",
          durationMinutes: 195,
          intensity: "moderate",
        },
      ]),
      d("sun", [
        {
          id: "w15-sun-bike",
          type: "bike-outdoor",
          title: "Easy Ride",
          description: "2 h easy outdoor ride.",
          durationMinutes: 120,
          intensity: "easy",
        },
      ]),
    ],
  },
  {
    weekNumber: 16,
    phase: "taper",
    phaseName: "Taper",
    phaseNumber: 5,
    isDeload: false,
    totalHours: 4.5,
    notes:
      "Final taper week. Stay sharp but rested. Event starts next Monday.",
    days: [
      d("mon", [
        {
          id: "w16-mon-bike",
          type: "bike-trainer",
          title: "Short Tempo Spin",
          description: "45 min trainer ride. 2×8 min at 170–176 W.",
          durationMinutes: 45,
          intensity: "moderate",
        },
      ]),
      rest(16, "tue"),
      d("wed", [
        {
          id: "w16-wed-bike",
          type: "bike-trainer",
          title: "Openers + Spin-ups",
          description:
            "50–55 min Zwift workout. 3×3 min at 205–215 W plus 3×30 s spin-ups.",
          durationMinutes: 52,
          intensity: "hard",
        },
      ]),
      d("thu", [
        {
          id: "w16-thu-mobility",
          type: "mobility",
          title: "Mobility Only",
          description: "Mobility only. No gym, no run.",
          durationMinutes: 15,
          intensity: "recovery",
        },
      ]),
      d("fri", [
        {
          id: "w16-fri-bike",
          type: "bike-trainer",
          title: "Easy + Openers",
          description:
            "45 min easy ride with 3×1 min openers.",
          durationMinutes: 45,
          intensity: "easy",
        },
      ]),
      d("sat", [
        {
          id: "w16-sat-bike",
          type: "bike-outdoor",
          title: "Easy Pre-Event Spin",
          description: "75–90 min easy outdoor ride.",
          durationMinutes: 82,
          intensity: "easy",
        },
      ]),
      d("sun", [
        {
          id: "w16-sun-rest",
          type: "rest",
          title: "Off / Travel",
          description: "Off or travel day. Rest up for race week.",
          durationMinutes: 0,
          intensity: "recovery",
        },
      ]),
    ],
  },
];

export function getAllSessions(): Session[] {
  return PLAN.flatMap((week) =>
    week.days.flatMap((day) => day.sessions)
  );
}

export function getSessionById(id: string): Session | undefined {
  return getAllSessions().find((s) => s.id === id);
}
