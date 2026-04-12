"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useCallback, useState, useEffect } from "react";
import clsx from "clsx";
import {
  HiHome,
  HiTv,
  HiFilm,
  HiRectangleStack,
  HiStar,
  HiMagnifyingGlass,
  HiCog6Tooth,
  HiBars3,
  HiXMark,
} from "react-icons/hi2";
import { useAuthStore, useSettingsStore } from "@/lib/store";

const navItems = [
  { href: "/", label: "Home", icon: HiHome, isFavorite: false },
  { href: "/favorites", label: "Favoriten", icon: HiStar, isFavorite: true },
  { href: "/live", label: "Live TV", icon: HiTv, isFavorite: false },
  { href: "/movies", label: "Filme", icon: HiFilm, isFavorite: false },
  { href: "/series", label: "Serien", icon: HiRectangleStack, isFavorite: false },
  { href: "/search", label: "Suche", icon: HiMagnifyingGlass, isFavorite: false },
  { href: "/settings", label: "Einstellungen", icon: HiCog6Tooth, isFavorite: false },
];

export default function PlayerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const macAddress = useAuthStore((s) => s.macAddress);
  const credentials = useAuthStore((s) => s.credentials);
  const playlistName = useAuthStore((s) => s.playlistName);
  const { fontSize, remoteControlMode } = useSettingsStore();
  const navRef = useRef<HTMLUListElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const isLarge = fontSize === "large" || fontSize === "extra-large" || remoteControlMode;

  const serverHost =
    credentials && "serverUrl" in credentials
      ? new URL(credentials.serverUrl).hostname
      : credentials && "url" in credentials
        ? "M3U Playlist"
        : "";

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Close menu on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const handleNavKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      if (!navRef.current) return;
      const items = navRef.current.querySelectorAll("a");
      let nextIndex = index;
      if (e.key === "ArrowDown") { e.preventDefault(); nextIndex = Math.min(index + 1, items.length - 1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); nextIndex = Math.max(index - 1, 0); }
      if (nextIndex !== index) (items[nextIndex] as HTMLElement)?.focus();
    },
    []
  );

  const NavLink = ({ item, index }: { item: typeof navItems[0]; index: number }) => {
    const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
    return (
      <Link
        href={item.href}
        tabIndex={0}
        onKeyDown={(e) => handleNavKeyDown(e, index)}
        onClick={() => setMenuOpen(false)}
        className={clsx(
          "flex items-center gap-3 rounded-xl px-3 transition-all duration-200 glass-nav",
          "focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none",
          item.isFavorite
            ? clsx(
                isLarge ? "py-4 text-xl" : "py-3.5 text-lg",
                "font-bold",
                isActive
                  ? "bg-gradient-to-r from-yellow-500/20 to-amber-500/10 text-yellow-400 shadow-sm shadow-yellow-500/10 border border-yellow-500/30 active"
                  : "text-yellow-400/80 hover:bg-yellow-500/10 hover:text-yellow-300 border border-transparent"
              )
            : clsx(
                isLarge ? "py-4 text-lg" : "py-3 text-base",
                "font-medium",
                isActive
                  ? "bg-indigo-500/10 text-indigo-400 shadow-sm active"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              )
        )}
      >
        <item.icon className={clsx("flex-shrink-0", item.isFavorite ? "h-6 w-6" : "h-5 w-5", item.isFavorite ? (isActive ? "text-yellow-400" : "text-yellow-400/80") : isActive ? "text-indigo-400" : "")} />
        <span>{item.label}</span>
        {isActive && !item.isFavorite && <div className="ml-auto h-2 w-2 rounded-full bg-indigo-400" />}
        {item.isFavorite && isActive && <div className="ml-auto h-2 w-2 rounded-full bg-yellow-400" />}
      </Link>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f0f1a]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-20 lg:w-72 flex-col border-r border-[#2a2a45] bg-[#0f0f1a]/95 backdrop-blur-sm">
        {/* Logo */}
        <div className="flex h-16 items-center justify-center lg:justify-start lg:px-6 border-b border-[#2a2a45]">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
              <span className="text-sm font-bold text-white">T</span>
            </div>
            <span className="hidden xl:block text-lg font-bold gradient-text">IPTV TREX</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 lg:px-3">
          <ul ref={navRef} className="space-y-1">
            {navItems.map((item, index) => (
              <li key={item.href}>
                <NavLink item={item} index={index} />
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-[#2a2a45] p-3 lg:p-4 space-y-2">
          {(playlistName || serverHost) && (
            <div className="rounded-lg bg-indigo-500/10 p-2 lg:p-3">
              <p className="hidden xl:block text-[10px] uppercase tracking-wider text-indigo-400 mb-1">Aktive Playlist</p>
              <p className="text-xs text-indigo-300 font-medium text-center lg:text-left truncate">{playlistName || serverHost}</p>
            </div>
          )}
          <div className="rounded-lg bg-[#1a1a2e] p-2 lg:p-3">
            <p className="hidden xl:block text-[10px] uppercase tracking-wider text-gray-500 mb-1">Geräte-MAC</p>
            <p className="text-[10px] lg:text-xs text-gray-400 font-mono text-center lg:text-left truncate">{macAddress || "00:00:00:00:00:00"}</p>
          </div>
        </div>
      </aside>

      {/* Mobile hamburger menu overlay */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />

          {/* Slide-in panel */}
          <div className="absolute left-0 top-0 bottom-0 w-72 glass-panel menu-slide-in border-r border-[#2a2a45] flex flex-col" style={{ borderRadius: 0 }}>
            {/* Menu header */}
            <div className="flex items-center justify-between p-4 border-b border-[#2a2a45]">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                  <span className="text-sm font-bold text-white">T</span>
                </div>
                <span className="text-lg font-bold gradient-text">IPTV TREX</span>
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <HiXMark className="h-6 w-6" />
              </button>
            </div>

            {/* Menu nav items */}
            <nav className="flex-1 overflow-y-auto py-4 px-3">
              <ul className="space-y-1">
                {navItems.map((item, index) => (
                  <li key={item.href}>
                    <NavLink item={item} index={index} />
                  </li>
                ))}
              </ul>
            </nav>

            {/* Menu footer */}
            <div className="border-t border-[#2a2a45] p-4 space-y-2">
              {(playlistName || serverHost) && (
                <div className="glass-card rounded-lg p-3">
                  <p className="text-[10px] uppercase tracking-wider text-indigo-400 mb-1">Aktive Playlist</p>
                  <p className="text-xs text-indigo-300 font-medium truncate">{playlistName || serverHost}</p>
                </div>
              )}
              <div className="glass-card rounded-lg p-3">
                <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Geräte-MAC</p>
                <p className="text-[10px] text-gray-400 font-mono truncate">{macAddress || "00:00:00:00:00:00"}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile top bar with hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14 border-b border-[#2a2a45] bg-[#0f0f1a]/95 backdrop-blur-sm">
        <button
          onClick={() => setMenuOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 transition-colors focus-visible:ring-4 focus-visible:ring-blue-400"
          aria-label="Menü öffnen"
        >
          <HiBars3 className="h-6 w-6" />
        </button>

        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
            <span className="text-xs font-bold text-white">T</span>
          </div>
          <span className="text-base font-bold gradient-text">IPTV TREX</span>
        </Link>

        <Link
          href="/settings"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 transition-colors focus-visible:ring-4 focus-visible:ring-blue-400"
        >
          <HiCog6Tooth className="h-5 w-5" />
        </Link>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">{children}</main>
    </div>
  );
}
