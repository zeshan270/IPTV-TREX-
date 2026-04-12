"use client";

import { useRouter } from "next/navigation";
import clsx from "clsx";
import { HiTv, HiFilm, HiRectangleStack, HiStar, HiPlay } from "react-icons/hi2";
import { useAuthStore, useFavoritesStore, useRecentStore, usePlayerStore, useSettingsStore } from "@/lib/store";

const quickAccess = [
  { href: "/live", label: "Live TV", icon: HiTv, emoji: "📺", gradient: "from-blue-500 to-cyan-500" },
  { href: "/movies", label: "Filme", icon: HiFilm, emoji: "🎬", gradient: "from-purple-500 to-pink-500" },
  { href: "/series", label: "Serien", icon: HiRectangleStack, emoji: "🎭", gradient: "from-orange-500 to-red-500" },
  { href: "/favorites", label: "⭐ Favoriten", icon: HiStar, emoji: "⭐", gradient: "from-yellow-400 to-amber-500" },
];

export default function HomePage() {
  const router = useRouter();
  const { playlistName } = useAuthStore();
  const { favorites } = useFavoritesStore();
  const { items: recentItems } = useRecentStore();
  const { positions } = usePlayerStore();
  const { fontSize, remoteControlMode } = useSettingsStore();

  const isLarge = fontSize === "large" || fontSize === "extra-large" || remoteControlMode;

  // Continue watching: items with saved position < 95%
  const continueWatching = Object.entries(positions)
    .filter(([, pos]) => pos.duration > 0 && (pos.position / pos.duration) < 0.95 && (pos.position / pos.duration) > 0.02)
    .sort(([, a], [, b]) => b.updatedAt - a.updatedAt)
    .slice(0, 10)
    .map(([streamId, pos]) => {
      const recent = recentItems.find((r) => r.id === streamId);
      return { streamId, ...pos, name: recent?.name || `Stream ${streamId}`, logo: recent?.logo, streamType: recent?.streamType || "live" };
    });

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 6) return "Gute Nacht";
    if (h < 11) return "Guten Morgen";
    if (h < 14) return "Guten Mittag";
    if (h < 18) return "Guten Nachmittag";
    if (h < 22) return "Guten Abend";
    return "Gute Nacht";
  };

  return (
    <div className="min-h-full p-4 md:p-6 lg:p-8 overflow-y-auto">
      {/* Welcome Banner */}
      <div className="mb-8">
        <h1 className={clsx("font-black text-white mb-1", isLarge ? "text-4xl" : "text-2xl")}>
          {greeting()}
        </h1>
        {playlistName && (
          <p className={clsx("text-indigo-400 font-medium", isLarge ? "text-xl" : "text-base")}>
            📡 {playlistName}
          </p>
        )}
      </div>

      {/* Quick Access Cards */}
      <div className={clsx("grid gap-4 mb-8", isLarge ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4")}>
        {quickAccess.map((item) => (
          <button
            key={item.href}
            onClick={() => router.push(item.href)}
            tabIndex={0}
            className={clsx(
              "group relative overflow-hidden rounded-2xl transition-all duration-200",
              "hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]",
              "focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none",
              `bg-gradient-to-br ${item.gradient}`,
              isLarge ? "p-8" : "p-6",
              item.href === "/favorites" && "ring-2 ring-yellow-400/50"
            )}
          >
            <div className="flex flex-col items-center text-center">
              <span className={clsx("mb-2", isLarge ? "text-5xl" : "text-4xl")}>{item.emoji}</span>
              <h3 className={clsx("font-black text-white", isLarge ? "text-2xl" : "text-lg")}>{item.label}</h3>
              {item.href === "/favorites" && favorites.length > 0 && (
                <span className="mt-1 bg-white/20 text-white px-3 py-0.5 rounded-full text-sm font-bold">
                  {favorites.length} gespeichert
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Continue Watching */}
      {continueWatching.length > 0 && (
        <section className="mb-8">
          <h2 className={clsx("font-bold text-white mb-4 flex items-center gap-2", isLarge ? "text-2xl" : "text-lg")}>
            ▶️ Weiterschauen
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
            {continueWatching.map((item) => {
              const progress = item.duration > 0 ? (item.position / item.duration) * 100 : 0;
              return (
                <button
                  key={item.streamId}
                  onClick={() => router.push(`/player/${item.streamId}?type=${item.streamType}`)}
                  tabIndex={0}
                  className={clsx(
                    "flex-shrink-0 rounded-xl overflow-hidden glass-card group",
                    "focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none",
                    isLarge ? "w-52" : "w-40"
                  )}
                >
                  <div className="relative aspect-video bg-[#25253d] flex items-center justify-center overflow-hidden">
                    {item.logo ? (
                      <img src={item.logo} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <HiPlay className="h-8 w-8 text-gray-600" />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all">
                      <HiPlay className="h-10 w-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    {/* Progress bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/50">
                      <div className="h-full bg-indigo-500 rounded-r-full" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  <div className="p-2">
                    <p className={clsx("font-medium text-white truncate", isLarge ? "text-base" : "text-xs")}>{item.name}</p>
                    <p className="text-xs text-gray-500">{Math.round(progress)}% gesehen</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Recently Watched */}
      {recentItems.length > 0 && (
        <section className="mb-8">
          <h2 className={clsx("font-bold text-white mb-4 flex items-center gap-2", isLarge ? "text-2xl" : "text-lg")}>
            🕐 Zuletzt gesehen
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
            {recentItems.slice(0, 15).map((item) => (
              <button
                key={item.id}
                onClick={() => router.push(`/player/${item.id}?type=${item.streamType}`)}
                tabIndex={0}
                className={clsx(
                  "flex-shrink-0 rounded-xl overflow-hidden glass-card",
                  "focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none",
                  isLarge ? "w-36" : "w-28"
                )}
              >
                <div className="aspect-square bg-[#25253d] flex items-center justify-center overflow-hidden">
                  {item.logo ? (
                    <img src={item.logo} alt={item.name} className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-3xl">
                      {item.streamType === "live" ? "📺" : item.streamType === "movie" ? "🎬" : "🎭"}
                    </span>
                  )}
                </div>
                <div className="p-2">
                  <p className={clsx("font-medium text-white truncate", isLarge ? "text-sm" : "text-xs")}>{item.name}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Favorites Preview */}
      {favorites.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className={clsx("font-bold text-white flex items-center gap-2", isLarge ? "text-2xl" : "text-lg")}>
              ⭐ Favoriten
            </h2>
            <button onClick={() => router.push("/favorites")} tabIndex={0}
              className="text-yellow-400 hover:text-yellow-300 text-sm font-medium focus-visible:ring-2 focus-visible:ring-yellow-400 rounded px-2 py-1">
              Alle anzeigen →
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
            {favorites.slice(0, 10).map((fav) => (
              <button
                key={fav.id}
                onClick={() => router.push(`/player/${fav.id}?type=${fav.streamType}`)}
                tabIndex={0}
                className={clsx(
                  "flex-shrink-0 rounded-xl overflow-hidden glass-card border-2 border-yellow-500/30 hover:border-yellow-400/60",
                  "focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none",
                  isLarge ? "w-36" : "w-28"
                )}
              >
                <div className="aspect-square bg-[#25253d] flex items-center justify-center overflow-hidden">
                  {fav.logo ? (
                    <img src={fav.logo} alt={fav.name} className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-3xl">{fav.streamType === "live" ? "📺" : "🎬"}</span>
                  )}
                </div>
                <div className="p-2">
                  <p className={clsx("font-medium text-white truncate", isLarge ? "text-sm" : "text-xs")}>{fav.name}</p>
                  {fav.channelNumber && <p className="text-xs text-yellow-400 font-bold">#{fav.channelNumber}</p>}
                </div>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
