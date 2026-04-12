"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import PlayerLayout from "@/components/layout/PlayerLayout";

export default function PlayerGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const [hydrated, setHydrated] = useState(false);

  // Wait for Zustand store to hydrate from localStorage
  useEffect(() => {
    // useAuthStore.persist is available because the store uses the persist middleware
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    // If already hydrated (e.g. on client-side navigation)
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true);
    }
    return unsub;
  }, []);

  useEffect(() => {
    if (hydrated && !isLoggedIn && pathname !== "/login") {
      router.replace("/login");
    }
  }, [hydrated, isLoggedIn, pathname, router]);

  // Login page renders without the player layout
  if (pathname === "/login") {
    return <>{children}</>;
  }

  // Show nothing while waiting for hydration or redirecting
  if (!hydrated || !isLoggedIn) {
    return null;
  }

  return <PlayerLayout>{children}</PlayerLayout>;
}
