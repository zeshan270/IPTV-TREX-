"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { HiHeart, HiStar, HiPlay, HiTrash } from "react-icons/hi2";
import { useFavoritesStore, useSettingsStore } from "@/lib/store";
import { useT } from "@/lib/i18n";

type FilterTab = "all" | "live" | "movie" | "series";

export default function FavoritesPage() {
  const router = useRouter();
  const { favorites, toggle, setChannelNumber, isFavorite } = useFavoritesStore();
  const { showChannelNumbers, fontSize } = useSettingsStore();
  const t = useT();

  const tabs: { key: FilterTab; label: string; icon: string }[] = [
    { key: "all", label: t("favorites.all"), icon: "📺" },
    { key: "live", label: t("nav.liveTV"), icon: "📡" },
    { key: "movie", label: t("nav.movies"), icon: "🎬" },
    { key: "series", label: t("nav.series"), icon: "🎭" },
  ];
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [numberInput, setNumberInput] = useState("");
  const [showNumberOverlay, setShowNumberOverlay] = useState(false);
  const numberTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [editingNumber, setEditingNumber] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);

  const filtered =
    activeTab === "all"
      ? favorites
      : favorites.filter((f) => f.streamType === activeTab);

  const isLarge = fontSize === "large" || fontSize === "extra-large";

  // Number input for quick channel switching
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Number keys 0-9
      if (e.key >= "0" && e.key <= "9" && !editingNumber) {
        e.preventDefault();
        const newInput = numberInput + e.key;
        setNumberInput(newInput);
        setShowNumberOverlay(true);

        if (numberTimeoutRef.current) clearTimeout(numberTimeoutRef.current);

        // After 1.5s or 3 digits, jump to channel
        const shouldJump = newInput.length >= 3;
        const timeout = shouldJump ? 0 : 1500;

        numberTimeoutRef.current = setTimeout(() => {
          const num = parseInt(newInput, 10);
          const fav = favorites.find((f) => f.channelNumber === num);
          if (fav) {
            router.push(`/player/${fav.id}?type=${fav.streamType}`);
          }
          setNumberInput("");
          setShowNumberOverlay(false);
        }, timeout);
      }

      // Arrow key navigation in grid
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        const cols = window.innerWidth >= 1024 ? 5 : window.innerWidth >= 768 ? 4 : window.innerWidth >= 640 ? 3 : 2;
        let newIndex = focusedIndex;
        if (e.key === "ArrowRight") newIndex = Math.min(filtered.length - 1, focusedIndex + 1);
        if (e.key === "ArrowLeft") newIndex = Math.max(0, focusedIndex - 1);
        if (e.key === "ArrowDown") newIndex = Math.min(filtered.length - 1, focusedIndex + cols);
        if (e.key === "ArrowUp") newIndex = Math.max(0, focusedIndex - cols);
        setFocusedIndex(newIndex);
        const cards = gridRef.current?.querySelectorAll("[data-fav-card]");
        (cards?.[newIndex] as HTMLElement)?.focus();
      }

      // Enter to play focused item
      if (e.key === "Enter" && filtered[focusedIndex] && !editingNumber) {
        router.push(`/player/${filtered[focusedIndex].id}?type=${filtered[focusedIndex].streamType}`);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (numberTimeoutRef.current) clearTimeout(numberTimeoutRef.current);
    };
  }, [numberInput, favorites, filtered, focusedIndex, editingNumber, router]);

  const handleSaveNumber = (id: string) => {
    const num = parseInt(editValue, 10);
    if (num > 0 && num < 1000) {
      setChannelNumber(id, num);
    }
    setEditingNumber(null);
    setEditValue("");
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Number input overlay */}
      {showNumberOverlay && (
        <div className="fixed top-8 right-8 z-50 bg-yellow-500/90 text-black px-8 py-4 rounded-2xl shadow-2xl">
          <p className="text-sm font-bold mb-1">{t("favorites.channel")} Nr.</p>
          <p className="text-5xl font-black tabular-nums">{numberInput || "..."}</p>
        </div>
      )}

      {/* Header - special golden style for favorites */}
      <div className="p-4 md:p-6 border-b-2 border-yellow-500/30 bg-gradient-to-r from-yellow-500/5 via-amber-500/5 to-orange-500/5">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg shadow-yellow-500/20">
            <HiStar className="h-7 w-7 text-black" />
          </div>
          <div>
            <h1 className={clsx("font-black text-white", isLarge ? "text-3xl" : "text-2xl")}>
              ⭐ {t("favorites.title")}
            </h1>
            <p className="text-sm text-yellow-400/80">{favorites.length} {t("favorites.saved")} • {t("favorites.numberKeys")}</p>
          </div>
        </div>

        {/* Tabs with count badges */}
        <div className="flex gap-2 flex-wrap">
          {tabs.map((tab) => {
            const count = tab.key === "all" ? favorites.length : favorites.filter((f) => f.streamType === tab.key).length;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                tabIndex={0}
                className={clsx(
                  "rounded-xl px-5 py-3 font-bold transition-all focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none",
                  isLarge ? "text-lg" : "text-base",
                  activeTab === tab.key
                    ? "bg-gradient-to-r from-yellow-500 to-amber-500 text-black shadow-lg shadow-yellow-500/25"
                    : "bg-[#181820] text-gray-300 hover:bg-[#22222e] border border-gray-700"
                )}
              >
                {tab.icon} {tab.label}
                <span className={clsx(
                  "ml-2 px-2 py-0.5 rounded-full text-xs font-black",
                  activeTab === tab.key ? "bg-black/20 text-black" : "bg-gray-700 text-gray-300"
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-yellow-400/20 to-amber-500/20 mb-6">
              <HiHeart className="h-12 w-12 text-yellow-400" />
            </div>
            <h3 className={clsx("font-black text-white mb-3", isLarge ? "text-2xl" : "text-xl")}>
              {t("favorites.noFavorites")}
            </h3>
            <p className={clsx("text-gray-400 max-w-md", isLarge ? "text-lg" : "text-base")}>
              {t("favorites.noFavoritesDesc")}
            </p>
          </div>
        ) : (
          <div
            ref={gridRef}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          >
            {filtered.map((fav, idx) => (
              <div
                key={fav.id}
                data-fav-card
                tabIndex={0}
                onFocus={() => setFocusedIndex(idx)}
                onClick={() => router.push(`/player/${fav.id}?type=${fav.streamType}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") router.push(`/player/${fav.id}?type=${fav.streamType}`);
                }}
                className={clsx(
                  "group relative rounded-2xl overflow-hidden cursor-pointer glass-card",
                  "border-2 border-yellow-500/20 hover:border-yellow-400/60",
                  "focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none",
                  focusedIndex === idx && "ring-4 ring-yellow-400"
                )}
              >
                {/* Channel Number Badge */}
                {fav.channelNumber && showChannelNumbers && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingNumber(fav.id);
                      setEditValue(String(fav.channelNumber));
                    }}
                    className="absolute top-2 left-2 z-10 bg-yellow-500 text-black px-2.5 py-1 rounded-lg font-black text-lg shadow-lg hover:bg-yellow-400 transition-colors"
                  >
                    {fav.channelNumber}
                  </button>
                )}

                {/* Edit number input */}
                {editingNumber === fav.id && (
                  <div className="absolute top-2 left-2 z-20 flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="number"
                      min="1"
                      max="999"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleSaveNumber(fav.id); }}
                      autoFocus
                      className="w-16 px-2 py-1 rounded-lg bg-gray-800 border-2 border-yellow-400 text-white font-bold text-center"
                    />
                    <button onClick={() => handleSaveNumber(fav.id)} className="px-2 py-1 bg-yellow-500 text-black rounded-lg font-bold text-sm">OK</button>
                  </div>
                )}

                {/* Favorite heart + remove */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle({ id: fav.id, name: fav.name, streamType: fav.streamType, logo: fav.logo, categoryId: fav.categoryId });
                  }}
                  className="absolute top-2 right-2 z-10 p-2 rounded-full bg-red-500/80 text-white hover:bg-red-600 transition-colors"
                >
                  <HiTrash className="h-4 w-4" />
                </button>

                {/* Image */}
                <div className="aspect-video bg-[#0d0d14] flex items-center justify-center overflow-hidden">
                  {fav.logo ? (
                    <img src={fav.logo} alt={fav.name} className="w-full h-full object-contain" />
                  ) : (
                    <div className="text-4xl">
                      {fav.streamType === "live" ? "📺" : fav.streamType === "movie" ? "🎬" : "🎭"}
                    </div>
                  )}
                  {/* Play overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all">
                    <HiPlay className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                  </div>
                </div>

                {/* Info */}
                <div className="p-3">
                  <h3 className={clsx("font-bold text-white truncate", isLarge ? "text-lg" : "text-sm")}>
                    {fav.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={clsx(
                      "text-xs px-2 py-0.5 rounded-full font-medium",
                      fav.streamType === "live" ? "bg-green-500/20 text-green-400" :
                      fav.streamType === "movie" ? "bg-blue-500/20 text-blue-400" :
                      "bg-orange-500/20 text-orange-400"
                    )}>
                      {fav.streamType === "live" ? "LIVE" : fav.streamType === "movie" ? "FILM" : "SERIE"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
