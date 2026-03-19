"use client";

import Link from "next/link";
import { useId } from "react";

type BrandLogoProps = {
  variant?: "mark" | "horizontal" | "wordmark";
  className?: string;
  href?: string | null;
};

function Mark({ className = "w-9 h-9" }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  const gradId = `vo2-ring-${uid}`;

  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-hidden
    >
      <defs>
        <linearGradient
          id={gradId}
          x1="8"
          y1="6"
          x2="34"
          y2="32"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--color-brand)" />
          <stop offset="1" stopColor="var(--color-brand-warm)" />
        </linearGradient>
      </defs>
      <circle
        cx="20"
        cy="20"
        r="16.5"
        stroke="var(--color-border)"
        strokeWidth="1.25"
      />
      <path
        d="M 20 3.5 A 16.5 16.5 0 0 1 36.5 22"
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth="2.25"
        strokeLinecap="round"
      />
      <path
        d="M13.5 27.5 L20 12.5 L26.5 27.5"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-foreground"
      />
    </svg>
  );
}

function Wordmark() {
  return (
    <div className="flex flex-col justify-center min-w-0 leading-none">
      <span className="text-[15px] font-bold tracking-[-0.02em] text-foreground flex items-baseline gap-px">
        VO
        <span className="text-[11px] font-bold text-brand translate-y-0.5">2</span>
      </span>
      <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-muted mt-0.5">
        Studio
      </span>
    </div>
  );
}

/**
 * VO2 Studio — ring + V (uptake curve metaphor), optional wordmark.
 */
export default function BrandLogo({
  variant = "mark",
  className = "",
  href = "/",
}: BrandLogoProps) {
  const body =
    variant === "horizontal" ? (
      <>
        <Mark className="w-10 h-10" />
        <Wordmark />
      </>
    ) : variant === "wordmark" ? (
      <Wordmark />
    ) : (
      <Mark />
    );

  const focusRing =
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

  if (!href) {
    return (
      <span
        className={`inline-flex items-center gap-2.5 ${className}`}
      >
        {body}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2.5 rounded-xl ${focusRing} ${className}`}
      aria-label="VO2 Studio — Home"
    >
      {body}
    </Link>
  );
}
