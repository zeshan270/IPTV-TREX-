"use client";

import { useEffect } from "react";
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

  useEffect(() => {
    if (!isLoggedIn && pathname !== "/login") {
      router.replace("/login");
    }
  }, [isLoggedIn, pathname, router]);

  // Login page renders without the player layout
  if (pathname === "/login") {
    return <>{children}</>;
  }

  // Show nothing while redirecting
  if (!isLoggedIn) {
    return null;
  }

  return <PlayerLayout>{children}</PlayerLayout>;
}
