import { NextResponse } from "next/server";

/** Required for Cloudflare Pages (`@cloudflare/next-on-pages`). */
export const runtime = "edge";

/** Server reads env at request time — works with `.env.local` and hosted env without rebuilding the client bundle. */
function resolveWebConfig() {
  const apiKey =
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim() ||
    process.env.FIREBASE_API_KEY?.trim();
  const authDomain =
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim() ||
    process.env.FIREBASE_AUTH_DOMAIN?.trim();
  const projectId =
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() ||
    process.env.FIREBASE_PROJECT_ID?.trim();
  const storageBucket =
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() ||
    process.env.FIREBASE_STORAGE_BUCKET?.trim();
  const messagingSenderId =
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim() ||
    process.env.FIREBASE_MESSAGING_SENDER_ID?.trim();
  const appId =
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim() ||
    process.env.FIREBASE_APP_ID?.trim();

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
  };
}

export const dynamic = "force-dynamic";

export async function GET() {
  const c = resolveWebConfig();
  const missing: string[] = [];
  if (!c.apiKey) {
    missing.push("NEXT_PUBLIC_FIREBASE_API_KEY or FIREBASE_API_KEY");
  }
  if (!c.authDomain) {
    missing.push("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN or FIREBASE_AUTH_DOMAIN");
  }
  if (!c.projectId) {
    missing.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID or FIREBASE_PROJECT_ID");
  }

  if (missing.length > 0) {
    return NextResponse.json({ configured: false, missing }, { status: 503 });
  }

  return NextResponse.json({
    apiKey: c.apiKey,
    authDomain: c.authDomain,
    projectId: c.projectId,
    ...(c.storageBucket && { storageBucket: c.storageBucket }),
    ...(c.messagingSenderId && { messagingSenderId: c.messagingSenderId }),
    ...(c.appId && { appId: c.appId }),
  });
}
