"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { HiHeart } from "react-icons/hi2";
import { useFavoritesStore } from "@/lib/store";
import ContentCard from "@/components/ui/ContentCard";

type FilterTab = "all" | "live" | "movie" | "series";

const tabs: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "live", label: "Live" },
  { key: "movie", label: "Movies" },
  { key: "series", label: "Series" },
];

export default function FavoritesPage() {
  const router = useRouter();
  const { favorites, toggle, isFavorite } = useFavoritesStore();
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const filtered =
    activeTab === "all"
      ? favorites
      : favorites.filter((f) => f.streamType === activeTab);

  const handleClick = (fav: (typeof favorites)[0]) => {
    const type =
      fav.streamType === "live"
        ? "live"
        : fav.streamType === "movie"
          ? "movies"
          : "series";
    router.push(`/player/${fav.id}?type=${fav.streamType}`);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-[#2a2a45]">
        <h1 className="text-xl font-bold text-white mb-4">Favorites</h1>

        {/* Tabs */}
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={clsx(
                "rounded-lg px-4 py-2 text-sm font-medium transition-all",
                activeTab === tab.key
                  ? "bg-indigo-500 text-white"
                  : "bg-[#1a1a2e] text-gray-400 hover:bg-[#25253d]"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-500/10 mb-4">
              <HiHeart className="h-8 w-8 text-pink-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              No Favorites Yet
            </h3>
            <p className="text-sm text-gray-400 max-w-sm">
              Add your favorite channels, movies, and series by tapping the
              heart icon on any content.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map((fav) => (
              <ContentCard
                key={fav.id}
                id={fav.id}
                title={fav.name}
                image={fav.logo}
                subtitle={fav.streamType}
                isFavorite={true}
                onFavoriteToggle={() =>
                  toggle({
                    id: fav.id,
                    name: fav.name,
                    streamType: fav.streamType,
                    logo: fav.logo,
                    categoryId: fav.categoryId,
                  })
                }
                onClick={() => handleClick(fav)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
