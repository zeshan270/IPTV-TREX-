"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import { useAdminAuthStore } from "@/lib/admin-store";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn, isLoading, checkAuth } = useAdminAuthStore();
  const [mounted, setMounted] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    checkAuth().then(() => setMounted(true));
  }, [checkAuth]);

  useEffect(() => {
    if (!mounted) return;
    if (!isLoggedIn && !isLoginPage) {
      router.replace("/admin/login");
    }
    if (isLoggedIn && isLoginPage) {
      router.replace("/admin/dashboard");
    }
  }, [mounted, isLoggedIn, isLoginPage, router]);

  // Show nothing while checking auth
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Login page has its own full layout
  if (isLoginPage) {
    return <div className="min-h-screen bg-gray-950">{children}</div>;
  }

  // Don't render protected content until logged in
  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Sidebar />
      <div className="lg:pl-64">
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
