import { type Session } from "@/data/plan";

const BODY_MASS_KG = 84;

export interface FuelingGuide {
  during: string | null;
  during_detail: string | null;
  post: string | null;
}

export function getFueling(session: Session): FuelingGuide {
  const h = session.durationMinutes / 60;

  if (session.type === "rest" || session.type === "mobility") {
    return { during: null, during_detail: null, post: null };
  }

  if (session.type === "strength") {
    return {
      during: "Water",
      during_detail: "Sip water throughout. No carbs needed.",
      post:
        h >= 0.5
          ? `${Math.round(BODY_MASS_KG * 0.3)}–${Math.round(BODY_MASS_KG * 0.4)}g protein within 30 min`
          : null,
    };
  }

  if (session.type === "run") {
    return {
      during: "Water",
      during_detail: "Hydrate well before. Water during if under 40 min.",
      post: `${Math.round(BODY_MASS_KG * 0.3)}–${Math.round(BODY_MASS_KG * 0.4)}g carbs + 25g protein`,
    };
  }

  // Bike sessions
  if (h <= 0) {
    return { during: null, during_detail: null, post: null };
  }

  const isHard =
    session.intensity === "hard" ||
    session.intensity === "very-hard" ||
    session.intensity === "moderate";

  // Under 75 min trainer — easy
  if (session.durationMinutes <= 75 && !isHard) {
    return {
      during: "Water only",
      during_detail: "No carbs needed for easy efforts under 75 min.",
      post: null,
    };
  }

  // Under 75 min — hard effort
  if (session.durationMinutes <= 75 && isHard) {
    const minG = Math.round(30 * h);
    const maxG = Math.round(40 * h);
    return {
      during: `${minG}–${maxG}g carbs`,
      during_detail: `30–40 g/h → ${minG}–${maxG}g total. 1 gel or bottle with mix.`,
      post: `${Math.round(BODY_MASS_KG * 1.0)}–${Math.round(BODY_MASS_KG * 1.2)}g carbs + 25g protein within 1h`,
    };
  }

  // 2–4h
  if (h >= 2 && h < 4) {
    const minG = Math.round(60 * h);
    const maxG = Math.round(75 * h);
    const gels = Math.ceil(minG / 22);
    return {
      during: `${minG}–${maxG}g carbs`,
      during_detail: `60–75 g/h → ${minG}–${maxG}g total. ~${gels} gels or 2 bottles with mix + snacks.`,
      post: `${Math.round(BODY_MASS_KG * 1.0)}–${Math.round(BODY_MASS_KG * 1.2)}g carbs + 25g protein within 1h`,
    };
  }

  // 4h+
  const minG = Math.round(75 * h);
  const maxG = Math.round(90 * h);
  const gels = Math.ceil(minG / 22);
  const bottles = Math.ceil(h / 1.5);
  return {
    during: `${minG}–${maxG}g carbs`,
    during_detail: `75–90 g/h → ${minG}–${maxG}g total. ~${gels} gels + ${bottles} bottles with mix. Start eating at 20 min, never wait until hungry.`,
    post: `${Math.round(BODY_MASS_KG * 1.0)}–${Math.round(BODY_MASS_KG * 1.2)}g carbs + 25g protein within 1h. Then a real meal.`,
  };
}
