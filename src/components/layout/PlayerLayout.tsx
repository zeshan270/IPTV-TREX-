"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  HiHome,
  HiTv,
  HiFilm,
  HiRectangleStack,
  HiHeart,
  HiMagnifyingGlass,
  HiCog6Tooth,
} from "react-icons/hi2";
import { useAuthStore } from "@/lib/store";

const navItems = [
  { href: "/", label: "Home", icon: HiHome },
  { href: "/live", label: "Live TV", icon: HiTv },
  { href: "/movies", label: "Movies", icon: HiFilm },
  { href: "/series", label: "Series", icon: HiRectangleStack },
  { href: "/favorites", label: "Favorites", icon: HiHeart },
  { href: "/search", label: "Search", icon: HiMagnifyingGlass },
  { href: "/settings", label: "Settings", icon: HiCog6Tooth },
];

export default function PlayerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const macAddress = useAuthStore((s) => s.macAddress);

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f0f1a]">
      {/* Sidebar */}
      <aside className="hidden md:flex w-20 lg:w-64 flex-col border-r border-[#2a2a45] bg-[#0f0f1a]/95 backdrop-blur-sm">
        {/* Logo */}
        <div className="flex h-16 items-center justify-center lg:justify-start lg:px-6 border-b border-[#2a2a45]">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
              <span className="text-sm font-bold text-white">T</span>
            </div>
            <span className="hidden lg:block text-lg font-bold gradient-text">
              IPTV TREX
            </span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 lg:px-3">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={clsx(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      "justify-center lg:justify-start",
                      isActive
                        ? "bg-indigo-500/10 text-indigo-400 shadow-sm"
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <item.icon
                      className={clsx(
                        "h-5 w-5 flex-shrink-0",
                        isActive ? "text-indigo-400" : ""
                      )}
                    />
                    <span className="hidden lg:block">{item.label}</span>
                    {isActive && (
                      <div className="hidden lg:block ml-auto h-1.5 w-1.5 rounded-full bg-indigo-400" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* MAC Address */}
        <div className="border-t border-[#2a2a45] p-3 lg:p-4">
          <div className="rounded-lg bg-[#1a1a2e] p-2 lg:p-3">
            <p className="hidden lg:block text-[10px] uppercase tracking-wider text-gray-500 mb-1">
              Device MAC
            </p>
            <p className="text-[10px] lg:text-xs text-gray-400 font-mono text-center lg:text-left truncate">
              {macAddress || "00:00:00:00:00:00"}
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[#2a2a45] bg-[#0f0f1a]/95 backdrop-blur-sm">
        <div className="flex items-center justify-around py-2">
          {navItems.slice(0, 5).map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex flex-col items-center gap-0.5 px-3 py-1 text-[10px]",
                  isActive ? "text-indigo-400" : "text-gray-500"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">{children}</main>
    </div>
  );
}
