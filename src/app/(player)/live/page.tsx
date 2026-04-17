"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import clsx from "clsx";
import {
  HiSignal,
  HiHeart,
  HiOutlineHeart,
  HiGlobeAlt,
  HiStar,
  HiViewColumns,
} from "react-icons/hi2";
import { useAuthStore, usePlayerStore, useFavoritesStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import {
  fetchLiveCategories,
  fetchLiveStreams,
  buildStreamUrl,
} from "@/lib/api-client";
import { extractCountryFromGroup, getCountryInfo, type CountryInfo } from "@/lib/countries";
import type { Category, Channel, XtreamCredentials } from "@/types";
import SearchBar from "@/components/ui/SearchBar";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorDisplay from "@/components/ui/ErrorDisplay";

// ==================== localStorage Cache ====================

const LS_PREFIX = "iptv-trex-cache-";
const LS_TTL = 30 * 60 * 1000; // 30 minutes

function lsGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(LS_PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as { data: T; ts: number };
    if (Date.now() - entry.ts > LS_TTL) {
      localStorage.removeItem(LS_PREFIX + key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

function lsSet<T>(key: string, data: T) {
  try {
    localStorage.setItem(LS_PREFIX + key, JSON.stringify({ data, ts: Date.now() }));
  } catch {
    // localStorage might be full - silently fail
  }
}

// ==================== Types ====================

interface CountryGroup {
  code: string;
  flag: string;
  name: string;
  categories: { categoryId: string; categoryName: string; subCategory: string }[];
  channelCount: number;
}

// ==================== Component ====================

export default function LiveTVPage() {
  const router = useRouter();
  const t = useT();
  const credentials = useAuthStore((s) => s.credentials);
  const setPlaylist = usePlayerStore((s) => s.setPlaylist);
  const setChannel = usePlayerStore((s) => s.setChannel);
  const { toggle, isFavorite, favorites } = useFavoritesStore();

  const [categories, setCategories] = useState<Category[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [allChannels, setAllChannels] = useState<Channel[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(true);
  const [showAllChannels, setShowAllChannels] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [loadingAll, setLoadingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);
  const countryGridRef = useRef<HTMLDivElement>(null);

  const isXtream = credentials && "serverUrl" in credentials;
  const creds = isXtream ? (credentials as XtreamCredentials) : null;

  // Load categories - with localStorage cache
  useEffect(() => {
    if (!isXtream || !creds) return;
    setLoading(true);

    const cacheKey = `cats-${creds.serverUrl}-${creds.username}`;
    const cached = lsGet<Category[]>(cacheKey);
    if (cached) {
      setCategories(cached);
      setLoading(false);
      // Refresh in background
      fetchLiveCategories(creds).then((cats) => {
        setCategories(cats);
        lsSet(cacheKey, cats);
      }).catch(() => {});
      return;
    }

    fetchLiveCategories(creds)
      .then((cats) => {
        setCategories(cats);
        lsSet(cacheKey, cats);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isXtream]);

  // Load channels for selected category - with localStorage cache
  useEffect(() => {
    if (!isXtream || !creds) return;
    if (!selectedCategory) {
      setChannels([]);
      return;
    }
    setLoadingChannels(true);

    const cacheKey = `ch-${creds.serverUrl}-${creds.username}-${selectedCategory}`;
    const cached = lsGet<Channel[]>(cacheKey);
    if (cached) {
      setChannels(cached);
      setPlaylist(cached);
      setLoadingChannels(false);
      // Background refresh
      fetchLiveStreams(creds, selectedCategory).then((streams) => {
        setChannels(streams);
        setPlaylist(streams);
        lsSet(cacheKey, streams);
      }).catch(() => {});
      return;
    }

    fetchLiveStreams(creds, selectedCategory)
      .then((streams) => {
        setChannels(streams);
        setPlaylist(streams);
        lsSet(cacheKey, streams);
        setLoadingChannels(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoadingChannels(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isXtream, selectedCategory]);

  // Load ALL channels when "All Channels" is selected
  const loadAllChannels = useCallback(async () => {
    if (!creds || allChannels.length > 0) {
      setShowAllChannels(true);
      return;
    }
    setLoadingAll(true);
    setShowAllChannels(true);
    setShowFavoritesOnly(false);
    setSelectedCountry(null);
    setSelectedCategory(null);

    const cacheKey = `all-ch-${creds.serverUrl}-${creds.username}`;
    const cached = lsGet<Channel[]>(cacheKey);
    if (cached) {
      setAllChannels(cached);
      setPlaylist(cached);
      setLoadingAll(false);
      return;
    }

    try {
      // Load all categories' channels in parallel batches
      const batchSize = 5;
      const all: Channel[] = [];
      for (let i = 0; i < categories.length; i += batchSize) {
        const batch = categories.slice(i, i + batchSize);
        const results = await Promise.allSettled(
          batch.map((cat) => fetchLiveStreams(creds, cat.categoryId))
        );
        results.forEach((r) => {
          if (r.status === "fulfilled") all.push(...r.value);
        });
      }
      // Deduplicate by channel ID
      const unique = Array.from(new Map(all.map((c) => [c.id, c])).values());
      setAllChannels(unique);
      setPlaylist(unique);
      lsSet(cacheKey, unique);
    } catch (err) {
      setError(t("common.error"));
    }
    setLoadingAll(false);
  }, [creds, categories, allChannels.length, setPlaylist, t]);

  // Extract country info from category name using countries.ts
  function extractCountry(categoryName: string): { countryCode: string; subCategory: string; info: CountryInfo } {
    const countryInfo = extractCountryFromGroup(categoryName);
    if (countryInfo) {
      // Extract the sub-category (everything after the country identifier)
      const name = categoryName.trim();
      let subCategory = name;
      // Try to remove country prefix patterns
      const patterns = [
        new RegExp(`^${countryInfo.code}\\s*[:|\\-]\\s*`, "i"),
        new RegExp(`^\\|${countryInfo.code}\\|\\s*`, "i"),
        new RegExp(`^\\[${countryInfo.code}\\]\\s*`, "i"),
        new RegExp(`^${countryInfo.code}\\s+`, "i"),
      ];
      for (const p of patterns) {
        const match = name.match(p);
        if (match) {
          subCategory = name.slice(match[0].length).trim();
          break;
        }
      }
      // Also try removing country name from start
      const nameKeys = [countryInfo.name.toLowerCase()];
      for (const nk of nameKeys) {
        const lower = subCategory.toLowerCase();
        if (lower.startsWith(nk)) {
          subCategory = subCategory.slice(nk.length).replace(/^[\s:\-|]+/, "").trim();
          break;
        }
      }
      if (!subCategory) subCategory = "General";
      return { countryCode: countryInfo.code, subCategory, info: countryInfo };
    }
    // Fallback: International
    const intl = getCountryInfo("INT");
    return { countryCode: "INT", subCategory: categoryName, info: intl };
  }

  // Group categories by country
  const countryGroups = useMemo(() => {
    const groups: Record<string, CountryGroup> = {};

    categories.forEach((cat) => {
      const { countryCode, subCategory, info } = extractCountry(cat.categoryName);
      if (!groups[countryCode]) {
        groups[countryCode] = {
          code: countryCode,
          flag: info.flag,
          name: info.name,
          categories: [],
          channelCount: 0,
        };
      }
      groups[countryCode].categories.push({
        categoryId: cat.categoryId,
        categoryName: cat.categoryName,
        subCategory,
      });
    });

    // Sort: preferred countries first, then alphabetical, International last
    const preferred = ["DE", "UK", "US", "TR", "FR", "IT", "ES", "NL", "AR", "IN", "PK", "RU", "PL"];
    return Object.values(groups).sort((a, b) => {
      if (a.code === "INT") return 1;
      if (b.code === "INT") return -1;
      const aIdx = preferred.indexOf(a.code);
      const bIdx = preferred.indexOf(b.code);
      if (aIdx >= 0 && bIdx >= 0) return aIdx - bIdx;
      if (aIdx >= 0) return -1;
      if (bIdx >= 0) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [categories]);

  // Categories for selected country
  const countryCategories = useMemo(() => {
    if (!selectedCountry) return [];
    const group = countryGroups.find((g) => g.code === selectedCountry);
    return group?.categories || [];
  }, [selectedCountry, countryGroups]);

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
  }, []);

  const filteredChannels = useMemo(() => {
    if (showFavoritesOnly) {
      const favChannels: Channel[] = favorites
        .filter((f) => f.streamType === "live")
        .map((f) => ({
          id: f.id,
          name: f.name,
          logo: f.logo || "",
          group: f.categoryId || "",
          url: creds ? buildStreamUrl(creds, Number(f.id), "live", "m3u8") : "",
          tvgId: "",
          tvgName: f.name,
          isLive: true,
          streamType: "live" as const,
          categoryId: f.categoryId || "",
        }));
      if (searchQuery) {
        return favChannels.filter((c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      return favChannels;
    }

    // "All Channels" mode
    if (showAllChannels) {
      let result = allChannels;
      if (searchQuery) {
        result = result.filter((c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      return result;
    }

    let result = channels;
    if (searchQuery) {
      result = result.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return result;
  }, [channels, allChannels, searchQuery, showFavoritesOnly, showAllChannels, favorites, creds]);

  const handleChannelClick = (channel: Channel) => {
    setChannel(channel);
    setPlaylist(filteredChannels);
    router.push(`/player/${channel.id}?type=live&url=${encodeURIComponent(channel.url)}&name=${encodeURIComponent(channel.name)}`);
  };

  const handleCountrySelect = (code: string | null) => {
    setShowFavoritesOnly(false);
    setShowAllChannels(false);
    setSelectedCountry(code);
    setSelectedCategory(null);
    if (code) {
      const group = countryGroups.find((g) => g.code === code);
      if (group && group.categories.length === 1) {
        setSelectedCategory(group.categories[0].categoryId);
      }
    }
  };

  const handleCategorySelect = (catId: string | null) => {
    setSelectedCategory(catId);
  };

  // Keyboard navigation for grid items
  const handleGridKeyDown = useCallback(
    (e: React.KeyboardEvent, items: HTMLElement[], currentIndex: number, cols: number) => {
      let nextIndex = currentIndex;
      switch (e.key) {
        case "ArrowRight": e.preventDefault(); nextIndex = Math.min(currentIndex + 1, items.length - 1); break;
        case "ArrowLeft": e.preventDefault(); nextIndex = Math.max(currentIndex - 1, 0); break;
        case "ArrowDown": e.preventDefault(); nextIndex = Math.min(currentIndex + cols, items.length - 1); break;
        case "ArrowUp": e.preventDefault(); nextIndex = Math.max(currentIndex - cols, 0); break;
        default: return;
      }
      if (nextIndex !== currentIndex) items[nextIndex]?.focus();
    },
    []
  );

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner size="lg" text={t("live.loading")} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <ErrorDisplay message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  const needsCategory = !selectedCategory && !searchQuery && !showFavoritesOnly && !showAllChannels;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top bar */}
      <div className="p-4 border-b border-[#2a2a38] space-y-3">
        <div className="flex items-center gap-2">
          <SearchBar
            placeholder={t("live.searchChannels")}
            onSearch={handleSearch}
            className="flex-1 max-w-md"
          />

          {/* Favorites button */}
          <button
            onClick={() => { setShowFavoritesOnly(!showFavoritesOnly); setShowAllChannels(false); }}
            tabIndex={0}
            className={clsx(
              "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all",
              "focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none",
              "min-h-[44px]",
              showFavoritesOnly
                ? "bg-gradient-to-r from-yellow-500 to-amber-500 text-black shadow-lg shadow-yellow-500/30"
                : "bg-gradient-to-r from-yellow-500/20 to-amber-500/10 text-yellow-400 border border-yellow-500/40 hover:border-yellow-400"
            )}
          >
            <HiStar className="h-5 w-5" />
            <span className="hidden sm:inline">{t("live.favorites")}</span>
          </button>
        </div>

        {/* Country navigation */}
        <div className="space-y-2">
          <div
            ref={countryGridRef}
            className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar"
          >
            {/* All Channels button */}
            <button
              onClick={() => { loadAllChannels(); }}
              tabIndex={0}
              className={clsx(
                "flex-shrink-0 flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all min-h-[44px]",
                "focus-visible:ring-4 focus-visible:ring-amber-400 focus-visible:outline-none",
                showAllChannels && !showFavoritesOnly
                  ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
                  : "bg-[#181820] text-gray-300 border border-[#2a2a38] hover:border-amber-500/30"
              )}
            >
              <HiViewColumns className="h-4 w-4" />
              {t("live.allChannels")}
            </button>

            {/* All Countries button */}
            <button
              onClick={() => handleCountrySelect(null)}
              tabIndex={0}
              className={clsx(
                "flex-shrink-0 flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all min-h-[44px]",
                "focus-visible:ring-4 focus-visible:ring-amber-400 focus-visible:outline-none",
                selectedCountry === null && !showFavoritesOnly && !showAllChannels
                  ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
                  : "bg-[#181820] text-gray-300 border border-[#2a2a38] hover:border-amber-500/30"
              )}
            >
              <HiGlobeAlt className="h-4 w-4" />
              {t("live.countries")}
            </button>

            {countryGroups.map((group) => (
              <button
                key={group.code}
                onClick={() => handleCountrySelect(group.code)}
                tabIndex={0}
                className={clsx(
                  "flex-shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all whitespace-nowrap min-h-[44px]",
                  "focus-visible:ring-4 focus-visible:ring-amber-400 focus-visible:outline-none",
                  selectedCountry === group.code
                    ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
                    : "bg-[#181820] text-gray-300 border border-[#2a2a38] hover:border-amber-500/30"
                )}
              >
                <span className="text-lg">{group.flag}</span>
                <span>{group.name}</span>
                <span className="text-xs opacity-50">({group.categories.length})</span>
              </button>
            ))}
          </div>

          {/* Sub-category chips for selected country */}
          {selectedCountry && countryCategories.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
              <button
                onClick={() => handleCategorySelect(null)}
                tabIndex={0}
                className={clsx(
                  "flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all min-h-[38px]",
                  "focus-visible:ring-4 focus-visible:ring-amber-400 focus-visible:outline-none",
                  selectedCategory === null
                    ? "bg-amber-500 text-white"
                    : "bg-[#181820] text-gray-400 border border-[#2a2a38] hover:border-amber-500/30"
                )}
              >
                Alle {countryGroups.find((g) => g.code === selectedCountry)?.name}
              </button>
              {countryCategories.map((cat) => (
                <button
                  key={cat.categoryId}
                  onClick={() => handleCategorySelect(cat.categoryId)}
                  tabIndex={0}
                  className={clsx(
                    "flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all whitespace-nowrap min-h-[38px]",
                    "focus-visible:ring-4 focus-visible:ring-amber-400 focus-visible:outline-none",
                    selectedCategory === cat.categoryId
                      ? "bg-amber-500 text-white"
                      : "bg-[#181820] text-gray-400 border border-[#2a2a38] hover:border-amber-500/30"
                  )}
                >
                  {cat.subCategory}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Channels grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {loadingAll ? (
          <div className="flex items-center justify-center py-16">
            <LoadingSpinner text={t("live.loadingAll")} />
          </div>
        ) : needsCategory ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <HiSignal className="h-16 w-16 text-gray-600 mb-4" />
            <p className="text-lg text-gray-400">{t("live.selectCategory")}</p>
            <p className="text-sm text-gray-500 mt-1">{t("live.selectCategoryDesc")}</p>
          </div>
        ) : loadingChannels ? (
          <div className="flex items-center justify-center py-16">
            <LoadingSpinner text={t("common.loading")} />
          </div>
        ) : filteredChannels.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <HiSignal className="h-16 w-16 text-gray-600 mb-4" />
            <p className="text-lg text-gray-400">
              {showFavoritesOnly
                ? t("live.noFavorites")
                : t("live.noChannels")}
            </p>
          </div>
        ) : (
          <>
            {/* Channel count */}
            <p className="text-xs text-gray-500 mb-3">
              {filteredChannels.length} {t("live.channels")}
            </p>
            <div
              ref={gridRef}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3"
            >
              {filteredChannels.map((channel, idx) => {
                const fav = isFavorite(channel.id);
                return (
                  <div
                    key={channel.id}
                    tabIndex={0}
                    role="button"
                    onClick={() => handleChannelClick(channel)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleChannelClick(channel); return; }
                      if (!gridRef.current) return;
                      const items = Array.from(gridRef.current.querySelectorAll("[role='button']")) as HTMLElement[];
                      const ci = items.indexOf(e.currentTarget as HTMLElement);
                      const cols = Math.round(gridRef.current.offsetWidth / (items[0]?.offsetWidth || 200));
                      handleGridKeyDown(e, items, ci, cols || 4);
                    }}
                    className={clsx(
                      "group relative rounded-xl glass-card p-3 text-left cursor-pointer",
                      "focus-visible:ring-4 focus-visible:ring-amber-400 focus-visible:outline-none",
                      "min-h-[100px]"
                    )}
                  >
                    {/* Favorite heart */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggle({
                          id: channel.id,
                          name: channel.name,
                          streamType: "live",
                          logo: channel.logo,
                          categoryId: channel.categoryId,
                        });
                      }}
                      tabIndex={-1}
                      className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition-all hover:bg-black/60 hover:scale-110"
                      aria-label={fav ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"}
                    >
                      {fav ? (
                        <HiHeart className="h-4 w-4 text-red-500" />
                      ) : (
                        <HiOutlineHeart className="h-4 w-4 text-white/50 group-hover:text-white/80" />
                      )}
                    </button>

                    {/* Channel number badge in favorites view */}
                    {showFavoritesOnly && (
                      <div className="absolute top-2 left-2 z-10 flex h-6 min-w-[1.5rem] items-center justify-center rounded-md bg-gradient-to-br from-yellow-500 to-amber-600 px-1.5">
                        <span className="text-xs font-bold text-black">{idx + 1}</span>
                      </div>
                    )}

                    <div className="relative aspect-video w-full mb-2 rounded-lg overflow-hidden bg-[#22222e]">
                      {channel.logo ? (
                        <Image
                          src={channel.logo}
                          alt={channel.name}
                          fill
                          className="object-contain p-2"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <HiSignal className="h-6 w-6 text-gray-600" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-200 truncate group-hover:text-white leading-tight">
                      {channel.name}
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
