"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  HiChartBarSquare,
  HiUsers,
  HiDeviceTablet,
  HiCog6Tooth,
  HiArrowLeftOnRectangle,
  HiServerStack,
} from "react-icons/hi2";

const adminNav = [
  { href: "/admin", label: "Dashboard", icon: HiChartBarSquare },
  { href: "/admin/users", label: "Users", icon: HiUsers },
  { href: "/admin/devices", label: "Devices", icon: HiDeviceTablet },
  { href: "/admin/servers", label: "Servers", icon: HiServerStack },
  { href: "/admin/settings", label: "Settings", icon: HiCog6Tooth },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f0f1a]">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-[#2a2a45] bg-[#0f0f1a]">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-[#2a2a45] px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
            <span className="text-sm font-bold text-white">T</span>
          </div>
          <div>
            <p className="text-sm font-bold gradient-text">IPTV TREX</p>
            <p className="text-[10px] text-gray-500">Admin Panel</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {adminNav.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={clsx(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                      isActive
                        ? "bg-indigo-500/10 text-indigo-400"
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="border-t border-[#2a2a45] p-3">
          <Link
            href="/login"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <HiArrowLeftOnRectangle className="h-5 w-5" />
            <span>Logout</span>
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
