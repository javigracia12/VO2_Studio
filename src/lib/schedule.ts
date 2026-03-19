import { TRAINING_START_DATE } from "@/data/config";
import {
  PLAN,
  DAY_ORDER,
  type DayOfWeek,
  type DayPlan,
  type WeekPlan,
} from "@/data/plan";

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

const DAY_OFFSET: Record<DayOfWeek, number> = {
  mon: 0,
  tue: 1,
  wed: 2,
  thu: 3,
  fri: 4,
  sat: 5,
  sun: 6,
};

export function getDateForDay(weekNumber: number, day: DayOfWeek): string {
  const start = parseDate(TRAINING_START_DATE);
  const weekStart = addDays(start, (weekNumber - 1) * 7);
  return toDateStr(addDays(weekStart, DAY_OFFSET[day]));
}

export function getWeekDates(weekNumber: number): Record<DayOfWeek, string> {
  const result = {} as Record<DayOfWeek, string>;
  for (const day of DAY_ORDER) {
    result[day] = getDateForDay(weekNumber, day);
  }
  return result;
}

export function getCurrentWeekNumber(): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = parseDate(TRAINING_START_DATE);
  const diffMs = today.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const weekNum = Math.floor(diffDays / 7) + 1;
  // Return `0` when we're before `TRAINING_START_DATE` so the UI doesn't
  // incorrectly show Week 1 tasks early.
  return Math.max(0, Math.min(16, weekNum));
}

export function getTodayDayOfWeek(): DayOfWeek {
  const jsDay = new Date().getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const map: DayOfWeek[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return map[jsDay];
}

export function getTomorrowDayOfWeek(): DayOfWeek {
  const jsDay = (new Date().getDay() + 1) % 7;
  const map: DayOfWeek[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return map[jsDay];
}

export function getTodayPlan(): { week: WeekPlan; day: DayPlan } | null {
  const weekNum = getCurrentWeekNumber();
  const week = PLAN.find((w) => w.weekNumber === weekNum);
  if (!week) return null;
  const todayDow = getTodayDayOfWeek();
  const day = week.days.find((d) => d.day === todayDow);
  if (!day) return null;
  return { week, day };
}

export function getTomorrowPlan(): { week: WeekPlan; day: DayPlan } | null {
  const todayDow = getTodayDayOfWeek();
  let weekNum = getCurrentWeekNumber();
  if (todayDow === "sun") weekNum = Math.min(16, weekNum + 1);
  const week = PLAN.find((w) => w.weekNumber === weekNum);
  if (!week) return null;
  const tmrwDow = getTomorrowDayOfWeek();
  const day = week.days.find((d) => d.day === tmrwDow);
  if (!day) return null;
  return { week, day };
}

export function getCurrentWeek(): WeekPlan | null {
  return PLAN.find((w) => w.weekNumber === getCurrentWeekNumber()) ?? null;
}

export function getThisWeekDays(): { date: string; dayPlan: DayPlan }[] {
  const week = getCurrentWeek();
  if (!week) return [];
  const dates = getWeekDates(week.weekNumber);
  return week.days.map((dp) => ({
    date: dates[dp.day],
    dayPlan: dp,
  }));
}

export function hasTrainingStarted(): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today >= parseDate(TRAINING_START_DATE);
}

export function daysUntilStart(): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = parseDate(TRAINING_START_DATE);
  const diff = start.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function formatDate(dateStr: string): string {
  const d = parseDate(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatDateLong(dateStr: string): string {
  const d = parseDate(dateStr);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function isToday(dateStr: string): boolean {
  return dateStr === toDateStr(new Date());
}

export function isPast(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return parseDate(dateStr) < today;
}
