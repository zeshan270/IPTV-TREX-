"use client";

import { useRouter } from "next/navigation";
import { HiTv, HiFilm, HiRectangleStack, HiPlay } from "react-icons/hi2";
import { useAuthStore, useFavoritesStore, useRecentStore } from "@/lib/store";
import ContentCard from "@/components/ui/ContentCard";

const quickAccess = [
  {
    href: "/live",
    label: "Live TV",
    icon: HiTv,
    gradient: "from-blue-600 to-indigo-600",
    desc: "Watch live channels",
  },
  {
    href: "/movies",
    label: "Movies",
    icon: HiFilm,
    gradient: "from-purple-600 to-pink-600",
    desc: "Browse movies",
  },
  {
    href: "/series",
    label: "Series",
    icon: HiRectangleStack,
    gradient: "from-orange-600 to-red-600",
    desc: "TV series & shows",
  },
];

export default function HomePage() {
  const router = useRouter();
  const credentials = useAuthStore((s) => s.credentials);
  const recentItems = useRecentStore((s) => s.items);
  const favorites = useFavoritesStore((s) => s.favorites);

  const username =
    credentials && "username" in credentials ? credentials.username : "User";

  return (
    <div className="min-h-full p-4 md:p-6 lg:p-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 border border-[#2a2a45] p-6 md:p-8 mb-8">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZyIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48Y2lyY2xlIGN4PSIxIiBjeT0iMSIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNnKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg==')] opacity-50" />
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Welcome back, <span className="gradient-text">{username}</span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            Your premium streaming experience awaits
          </p>
        </div>
      </div>

      {/* Quick Access */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickAccess.map((item) => (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${item.gradient} p-5 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
            >
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              <div className="relative z-10 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">
                    {item.label}
                  </h3>
                  <p className="text-sm text-white/60">{item.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Recently Watched */}
      {recentItems.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">
              Recently Watched
            </h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
            {recentItems.slice(0, 10).map((item) => (
              <div key={item.id} className="flex-shrink-0 w-36">
                <ContentCard
                  id={item.id}
                  title={item.name}
                  image={item.logo}
                  subtitle={item.streamType}
                  onClick={() => {
                    const type =
                      item.streamType === "live"
                        ? "live"
                        : item.streamType === "movie"
                          ? "movies"
                          : "series";
                    router.push(`/player/${item.id}?type=${type}`);
                  }}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Favorites */}
      {favorites.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Favorites</h2>
            <button
              onClick={() => router.push("/favorites")}
              className="text-sm text-indigo-400 hover:text-indigo-300"
            >
              View All
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
            {favorites.slice(0, 10).map((item) => (
              <div key={item.id} className="flex-shrink-0 w-36">
                <ContentCard
                  id={item.id}
                  title={item.name}
                  image={item.logo}
                  subtitle={item.streamType}
                  onClick={() =>
                    router.push(`/player/${item.id}?type=${item.streamType}`)
                  }
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty state if nothing */}
      {recentItems.length === 0 && favorites.length === 0 && (
        <section className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-500/10 mb-4">
            <HiPlay className="h-10 w-10 text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Start Watching
          </h3>
          <p className="text-sm text-gray-400 max-w-sm">
            Browse Live TV, Movies, or Series to start your streaming
            experience.
          </p>
        </section>
      )}
    </div>
  );
}
