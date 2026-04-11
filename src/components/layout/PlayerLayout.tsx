"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useCallback } from "react";
import clsx from "clsx";
import {
  HiHome,
  HiTv,
  HiFilm,
  HiRectangleStack,
  HiStar,
  HiMagnifyingGlass,
  HiCog6Tooth,
} from "react-icons/hi2";
import { useAuthStore } from "@/lib/store";

const navItems = [
  { href: "/", label: "Home", icon: HiHome, isFavorite: false },
  { href: "/favorites", label: "Favorites", icon: HiStar, isFavorite: true },
  { href: "/live", label: "Live TV", icon: HiTv, isFavorite: false },
  { href: "/movies", label: "Movies", icon: HiFilm, isFavorite: false },
  { href: "/series", label: "Series", icon: HiRectangleStack, isFavorite: false },
  { href: "/search", label: "Search", icon: HiMagnifyingGlass, isFavorite: false },
  { href: "/settings", label: "Settings", icon: HiCog6Tooth, isFavorite: false },
];

export default function PlayerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const macAddress = useAuthStore((s) => s.macAddress);
  const credentials = useAuthStore((s) => s.credentials);
  const navRef = useRef<HTMLUListElement>(null);

  const playlistName =
    credentials && "serverUrl" in credentials
      ? new URL(credentials.serverUrl).hostname
      : credentials && "url" in credentials
        ? "M3U Playlist"
        : "";

  const handleNavKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      if (!navRef.current) return;
      const items = navRef.current.querySelectorAll("a");
      let nextIndex = index;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        nextIndex = Math.min(index + 1, items.length - 1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        nextIndex = Math.max(index - 1, 0);
      }

      if (nextIndex !== index) {
        (items[nextIndex] as HTMLElement)?.focus();
      }
    },
    []
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f0f1a]">
      {/* Sidebar */}
      <aside className="hidden md:flex w-20 lg:w-72 flex-col border-r border-[#2a2a45] bg-[#0f0f1a]/95 backdrop-blur-sm">
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
          <ul ref={navRef} className="space-y-1">
            {navItems.map((item, index) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    tabIndex={0}
                    onKeyDown={(e) => handleNavKeyDown(e, index)}
                    className={clsx(
                      "flex items-center gap-3 rounded-xl px-3 transition-all duration-200",
                      "justify-center lg:justify-start",
                      "focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none",
                      item.isFavorite
                        ? clsx(
                            "py-3.5 text-lg font-bold",
                            isActive
                              ? "bg-gradient-to-r from-yellow-500/20 to-amber-500/10 text-yellow-400 shadow-sm shadow-yellow-500/10 border border-yellow-500/30"
                              : "text-yellow-400/80 hover:bg-yellow-500/10 hover:text-yellow-300 border border-transparent"
                          )
                        : clsx(
                            "py-3 text-base font-medium",
                            isActive
                              ? "bg-indigo-500/10 text-indigo-400 shadow-sm"
                              : "text-gray-400 hover:bg-white/5 hover:text-white"
                          )
                    )}
                  >
                    <item.icon
                      className={clsx(
                        "flex-shrink-0",
                        item.isFavorite ? "h-6 w-6" : "h-5 w-5",
                        item.isFavorite
                          ? isActive
                            ? "text-yellow-400"
                            : "text-yellow-400/80"
                          : isActive
                            ? "text-indigo-400"
                            : ""
                      )}
                    />
                    <span className="hidden lg:block">{item.label}</span>
                    {isActive && !item.isFavorite && (
                      <div className="hidden lg:block ml-auto h-2 w-2 rounded-full bg-indigo-400" />
                    )}
                    {item.isFavorite && isActive && (
                      <div className="hidden lg:block ml-auto h-2 w-2 rounded-full bg-yellow-400" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-[#2a2a45] p-3 lg:p-4 space-y-2">
          {playlistName && (
            <div className="rounded-lg bg-indigo-500/10 p-2 lg:p-3">
              <p className="hidden lg:block text-[10px] uppercase tracking-wider text-indigo-400 mb-1">
                Active Playlist
              </p>
              <p className="text-xs text-indigo-300 font-medium text-center lg:text-left truncate">
                {playlistName}
              </p>
            </div>
          )}
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
          {[navItems[0], navItems[1], navItems[2], navItems[3], navItems[4]].map(
            (item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "flex flex-col items-center gap-0.5 px-3 py-1",
                    "focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none rounded-lg",
                    item.isFavorite
                      ? clsx(
                          "text-xs font-bold",
                          isActive ? "text-yellow-400" : "text-yellow-500/70"
                        )
                      : clsx(
                          "text-[11px]",
                          isActive ? "text-indigo-400" : "text-gray-500"
                        )
                  )}
                >
                  <item.icon
                    className={clsx(
                      item.isFavorite ? "h-6 w-6" : "h-5 w-5"
                    )}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            }
          )}
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">{children}</main>
    </div>
  );
}
