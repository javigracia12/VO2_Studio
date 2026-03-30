"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import { ProgressProvider } from "@/context/ProgressProvider";
import Navigation from "@/components/Navigation";

export default function TrainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <ProgressProvider>
      <Navigation />
      <main className="lg:pl-[72px] pb-20 lg:pb-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
          {children}
        </div>
      </main>
    </ProgressProvider>
  );
}
