"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  HiOutlineViewGrid,
  HiOutlineDesktopComputer,
  HiOutlineCollection,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineMenu,
  HiOutlineX,
} from "react-icons/hi";
import { useAdminAuthStore } from "@/lib/admin-store";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: HiOutlineViewGrid },
  { href: "/admin/devices", label: "Devices", icon: HiOutlineDesktopComputer },
  { href: "/admin/playlists", label: "Playlists", icon: HiOutlineCollection },
  { href: "/admin/settings", label: "Settings", icon: HiOutlineCog },
];

export default function Sidebar() {
  const pathname = usePathname();
  const logout = useAdminAuthStore((s) => s.logout);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = "/admin/login";
  };

  const navContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-700/60">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-amber-600 flex items-center justify-center text-white font-bold text-sm">
          IT
        </div>
        <span className="text-lg font-semibold text-white tracking-tight">
          IPTV TREX <span className="text-xs font-normal text-gray-400">Admin</span>
        </span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                  : "text-gray-400 hover:text-white hover:bg-gray-700/50"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-700/60">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-gray-700/50 transition-colors w-full"
        >
          <HiOutlineLogout className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:text-white"
      >
        {mobileOpen ? <HiOutlineX className="w-5 h-5" /> : <HiOutlineMenu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={clsx(
          "lg:hidden fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 border-r border-gray-700/60 transform transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {navContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-gray-900 border-r border-gray-700/60">
        {navContent}
      </aside>
    </>
  );
}
