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
} from "react-icons/hi2";
import { useAuthStore, usePlayerStore, useFavoritesStore } from "@/lib/store";
import {
  fetchLiveCategories,
  fetchLiveStreams,
  buildStreamUrl,
} from "@/lib/api-client";
import type { Category, Channel, XtreamCredentials } from "@/types";
import SearchBar from "@/components/ui/SearchBar";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorDisplay from "@/components/ui/ErrorDisplay";

// Country code to flag emoji + name mapping
const COUNTRY_MAP: Record<string, { flag: string; name: string }> = {
  AF: { flag: "\uD83C\uDDE6\uD83C\uDDEB", name: "Afghanistan" },
  AL: { flag: "\uD83C\uDDE6\uD83C\uDDF1", name: "Albania" },
  DZ: { flag: "\uD83C\uDDE9\uD83C\uDDFF", name: "Algeria" },
  AR: { flag: "\uD83C\uDDE6\uD83C\uDDF7", name: "Argentina" },
  AU: { flag: "\uD83C\uDDE6\uD83C\uDDFA", name: "Australia" },
  AT: { flag: "\uD83C\uDDE6\uD83C\uDDF9", name: "Austria" },
  BD: { flag: "\uD83C\uDDE7\uD83C\uDDE9", name: "Bangladesh" },
  BE: { flag: "\uD83C\uDDE7\uD83C\uDDEA", name: "Belgium" },
  BR: { flag: "\uD83C\uDDE7\uD83C\uDDF7", name: "Brazil" },
  BG: { flag: "\uD83C\uDDE7\uD83C\uDDEC", name: "Bulgaria" },
  CA: { flag: "\uD83C\uDDE8\uD83C\uDDE6", name: "Canada" },
  CL: { flag: "\uD83C\uDDE8\uD83C\uDDF1", name: "Chile" },
  CN: { flag: "\uD83C\uDDE8\uD83C\uDDF3", name: "China" },
  CO: { flag: "\uD83C\uDDE8\uD83C\uDDF4", name: "Colombia" },
  HR: { flag: "\uD83C\uDDED\uD83C\uDDF7", name: "Croatia" },
  CZ: { flag: "\uD83C\uDDE8\uD83C\uDDFF", name: "Czech Republic" },
  DK: { flag: "\uD83C\uDDE9\uD83C\uDDF0", name: "Denmark" },
  EG: { flag: "\uD83C\uDDEA\uD83C\uDDEC", name: "Egypt" },
  FI: { flag: "\uD83C\uDDEB\uD83C\uDDEE", name: "Finland" },
  FR: { flag: "\uD83C\uDDEB\uD83C\uDDF7", name: "France" },
  DE: { flag: "\uD83C\uDDE9\uD83C\uDDEA", name: "Germany" },
  GR: { flag: "\uD83C\uDDEC\uD83C\uDDF7", name: "Greece" },
  HK: { flag: "\uD83C\uDDED\uD83C\uDDF0", name: "Hong Kong" },
  HU: { flag: "\uD83C\uDDED\uD83C\uDDFA", name: "Hungary" },
  IN: { flag: "\uD83C\uDDEE\uD83C\uDDF3", name: "India" },
  ID: { flag: "\uD83C\uDDEE\uD83C\uDDE9", name: "Indonesia" },
  IR: { flag: "\uD83C\uDDEE\uD83C\uDDF7", name: "Iran" },
  IQ: { flag: "\uD83C\uDDEE\uD83C\uDDF6", name: "Iraq" },
  IE: { flag: "\uD83C\uDDEE\uD83C\uDDEA", name: "Ireland" },
  IL: { flag: "\uD83C\uDDEE\uD83C\uDDF1", name: "Israel" },
  IT: { flag: "\uD83C\uDDEE\uD83C\uDDF9", name: "Italy" },
  JP: { flag: "\uD83C\uDDEF\uD83C\uDDF5", name: "Japan" },
  KR: { flag: "\uD83C\uDDF0\uD83C\uDDF7", name: "South Korea" },
  KW: { flag: "\uD83C\uDDF0\uD83C\uDDFC", name: "Kuwait" },
  MY: { flag: "\uD83C\uDDF2\uD83C\uDDFE", name: "Malaysia" },
  MX: { flag: "\uD83C\uDDF2\uD83C\uDDFD", name: "Mexico" },
  MA: { flag: "\uD83C\uDDF2\uD83C\uDDE6", name: "Morocco" },
  NL: { flag: "\uD83C\uDDF3\uD83C\uDDF1", name: "Netherlands" },
  NZ: { flag: "\uD83C\uDDF3\uD83C\uDDFF", name: "New Zealand" },
  NG: { flag: "\uD83C\uDDF3\uD83C\uDDEC", name: "Nigeria" },
  NO: { flag: "\uD83C\uDDF3\uD83C\uDDF4", name: "Norway" },
  PK: { flag: "\uD83C\uDDF5\uD83C\uDDF0", name: "Pakistan" },
  PE: { flag: "\uD83C\uDDF5\uD83C\uDDEA", name: "Peru" },
  PH: { flag: "\uD83C\uDDF5\uD83C\uDDED", name: "Philippines" },
  PL: { flag: "\uD83C\uDDF5\uD83C\uDDF1", name: "Poland" },
  PT: { flag: "\uD83C\uDDF5\uD83C\uDDF9", name: "Portugal" },
  QA: { flag: "\uD83C\uDDF6\uD83C\uDDE6", name: "Qatar" },
  RO: { flag: "\uD83C\uDDF7\uD83C\uDDF4", name: "Romania" },
  RU: { flag: "\uD83C\uDDF7\uD83C\uDDFA", name: "Russia" },
  SA: { flag: "\uD83C\uDDF8\uD83C\uDDE6", name: "Saudi Arabia" },
  RS: { flag: "\uD83C\uDDF7\uD83C\uDDF8", name: "Serbia" },
  SG: { flag: "\uD83C\uDDF8\uD83C\uDDEC", name: "Singapore" },
  ZA: { flag: "\uD83C\uDDFF\uD83C\uDDE6", name: "South Africa" },
  ES: { flag: "\uD83C\uDDEA\uD83C\uDDF8", name: "Spain" },
  SE: { flag: "\uD83C\uDDF8\uD83C\uDDEA", name: "Sweden" },
  CH: { flag: "\uD83C\uDDE8\uD83C\uDDED", name: "Switzerland" },
  TW: { flag: "\uD83C\uDDF9\uD83C\uDDFC", name: "Taiwan" },
  TH: { flag: "\uD83C\uDDF9\uD83C\uDDED", name: "Thailand" },
  TR: { flag: "\uD83C\uDDF9\uD83C\uDDF7", name: "Turkey" },
  UA: { flag: "\uD83C\uDDFA\uD83C\uDDE6", name: "Ukraine" },
  AE: { flag: "\uD83C\uDDE6\uD83C\uDDEA", name: "UAE" },
  UK: { flag: "\uD83C\uDDEC\uD83C\uDDE7", name: "United Kingdom" },
  GB: { flag: "\uD83C\uDDEC\uD83C\uDDE7", name: "United Kingdom" },
  US: { flag: "\uD83C\uDDFA\uD83C\uDDF8", name: "United States" },
  VN: { flag: "\uD83C\uDDFB\uD83C\uDDF3", name: "Vietnam" },
  XX: { flag: "\uD83C\uDF0D", name: "International" },
};

// Reverse lookup: country name to code
const NAME_TO_CODE: Record<string, string> = {};
Object.entries(COUNTRY_MAP).forEach(([code, { name }]) => {
  NAME_TO_CODE[name.toLowerCase()] = code;
});

function extractCountryFromCategory(categoryName: string): { countryCode: string; subCategory: string } {
  const name = categoryName.trim();

  // Pattern: "XX: Category" or "XX : Category"
  const colonMatch = name.match(/^([A-Z]{2})\s*:\s*(.+)$/);
  if (colonMatch && COUNTRY_MAP[colonMatch[1]]) {
    return { countryCode: colonMatch[1], subCategory: colonMatch[2].trim() };
  }

  // Pattern: "XX | Category"
  const pipeMatch = name.match(/^([A-Z]{2})\s*\|\s*(.+)$/);
  if (pipeMatch && COUNTRY_MAP[pipeMatch[1]]) {
    return { countryCode: pipeMatch[1], subCategory: pipeMatch[2].trim() };
  }

  // Pattern: "|XX| Category"
  const pipeSurroundMatch = name.match(/^\|([A-Z]{2})\|\s*(.+)$/);
  if (pipeSurroundMatch && COUNTRY_MAP[pipeSurroundMatch[1]]) {
    return { countryCode: pipeSurroundMatch[1], subCategory: pipeSurroundMatch[2].trim() };
  }

  // Pattern: "XX - Category"
  const dashMatch = name.match(/^([A-Z]{2})\s*-\s*(.+)$/);
  if (dashMatch && COUNTRY_MAP[dashMatch[1]]) {
    return { countryCode: dashMatch[1], subCategory: dashMatch[2].trim() };
  }

  // Pattern: starts with country name
  const lowerName = name.toLowerCase();
  for (const [cname, code] of Object.entries(NAME_TO_CODE)) {
    if (lowerName.startsWith(cname + " ") || lowerName.startsWith(cname + ":") || lowerName.startsWith(cname + "-") || lowerName.startsWith(cname + "|")) {
      const rest = name.substring(cname.length).replace(/^[\s:\-|]+/, "").trim();
      return { countryCode: code, subCategory: rest || "General" };
    }
    if (lowerName === cname) {
      return { countryCode: code, subCategory: "General" };
    }
  }

  return { countryCode: "XX", subCategory: name };
}

interface CountryGroup {
  code: string;
  flag: string;
  name: string;
  categories: { categoryId: string; categoryName: string; subCategory: string }[];
  channelCount: number;
}

export default function LiveTVPage() {
  const router = useRouter();
  const credentials = useAuthStore((s) => s.credentials);
  const setPlaylist = usePlayerStore((s) => s.setPlaylist);
  const setChannel = usePlayerStore((s) => s.setChannel);
  const { toggle, isFavorite, favorites } = useFavoritesStore();

  const [categories, setCategories] = useState<Category[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);
  const countryGridRef = useRef<HTMLDivElement>(null);

  const isXtream = credentials && "serverUrl" in credentials;

  // Load categories
  useEffect(() => {
    if (!isXtream || !credentials) return;
    const creds = credentials as { serverUrl: string; username: string; password: string };
    setLoading(true);
    fetchLiveCategories(creds)
      .then((cats) => {
        setCategories(cats);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [credentials, isXtream]);

  // Load channels only when a specific category is selected
  useEffect(() => {
    if (!isXtream || !credentials) return;
    if (!selectedCategory) {
      setChannels([]);
      return;
    }
    const creds = credentials as { serverUrl: string; username: string; password: string };
    setLoadingChannels(true);
    fetchLiveStreams(creds, selectedCategory)
      .then((streams) => {
        setChannels(streams);
        setPlaylist(streams);
        setLoadingChannels(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoadingChannels(false);
      });
  }, [credentials, isXtream, selectedCategory, setPlaylist]);

  // Group categories by country
  const countryGroups = useMemo(() => {
    const groups: Record<string, CountryGroup> = {};

    categories.forEach((cat) => {
      const { countryCode, subCategory } = extractCountryFromCategory(cat.categoryName);
      if (!groups[countryCode]) {
        const info = COUNTRY_MAP[countryCode] || { flag: "\uD83C\uDF0D", name: countryCode };
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

    return Object.values(groups).sort((a, b) => {
      if (a.code === "XX") return 1;
      if (b.code === "XX") return -1;
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
      // Build channel objects directly from favorites store
      const creds = credentials as XtreamCredentials | null;
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
    let result = channels;
    if (searchQuery) {
      result = result.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return result;
  }, [channels, searchQuery, showFavoritesOnly, favorites, credentials]);

  const handleChannelClick = (channel: Channel) => {
    setChannel(channel);
    setPlaylist(filteredChannels);
    router.push(`/player/${channel.id}?type=live&url=${encodeURIComponent(channel.url)}&name=${encodeURIComponent(channel.name)}`);
  };

  const handleCountrySelect = (code: string | null) => {
    setShowFavoritesOnly(false);
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
        case "ArrowRight":
          e.preventDefault();
          nextIndex = Math.min(currentIndex + 1, items.length - 1);
          break;
        case "ArrowLeft":
          e.preventDefault();
          nextIndex = Math.max(currentIndex - 1, 0);
          break;
        case "ArrowDown":
          e.preventDefault();
          nextIndex = Math.min(currentIndex + cols, items.length - 1);
          break;
        case "ArrowUp":
          e.preventDefault();
          nextIndex = Math.max(currentIndex - cols, 0);
          break;
        default:
          return;
      }
      if (nextIndex !== currentIndex) {
        items[nextIndex]?.focus();
      }
    },
    []
  );

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner size="lg" text="Loading Live TV..." />
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

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top bar */}
      <div className="p-4 border-b border-[#2a2a45] space-y-4">
        <div className="flex items-center gap-3">
          <SearchBar
            placeholder="Search channels..."
            onSearch={handleSearch}
            className="flex-1 max-w-md"
          />

          {/* Favorites filter button */}
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            tabIndex={0}
            className={clsx(
              "flex items-center gap-2 rounded-xl px-5 py-3 text-base font-bold transition-all duration-300",
              "focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none",
              "min-h-[48px]",
              showFavoritesOnly
                ? "bg-gradient-to-r from-yellow-500 to-amber-500 text-black shadow-lg shadow-yellow-500/30"
                : "bg-gradient-to-r from-yellow-500/20 to-amber-500/10 text-yellow-400 border-2 border-yellow-500/40 hover:border-yellow-400"
            )}
          >
            <HiStar className="h-5 w-5" />
            <span>Favorites</span>
          </button>
        </div>

        {/* Country navigation - always visible */}
        <div className="space-y-3">
            {/* All Countries button + country cards */}
            <div
              ref={countryGridRef}
              className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar"
            >
              <button
                onClick={() => handleCountrySelect(null)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (!countryGridRef.current) return;
                  const btns = Array.from(countryGridRef.current.querySelectorAll("button")) as HTMLElement[];
                  const idx = btns.indexOf(e.currentTarget as HTMLElement);
                  handleGridKeyDown(e, btns, idx, btns.length);
                }}
                className={clsx(
                  "flex-shrink-0 flex items-center gap-2 rounded-xl px-5 py-3 text-base font-semibold transition-all min-h-[52px]",
                  "focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none",
                  selectedCountry === null && !showFavoritesOnly
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                    : "bg-[#1a1a2e] text-gray-300 border-2 border-[#2a2a45] hover:border-indigo-500/30"
                )}
              >
                <HiGlobeAlt className="h-5 w-5" />
                All Countries
              </button>

              {countryGroups.map((group) => (
                <button
                  key={group.code}
                  onClick={() => handleCountrySelect(group.code)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (!countryGridRef.current) return;
                    const btns = Array.from(countryGridRef.current.querySelectorAll("button")) as HTMLElement[];
                    const idx = btns.indexOf(e.currentTarget as HTMLElement);
                    handleGridKeyDown(e, btns, idx, btns.length);
                  }}
                  className={clsx(
                    "flex-shrink-0 flex items-center gap-2 rounded-xl px-4 py-3 text-base font-medium transition-all whitespace-nowrap min-h-[52px]",
                    "focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none",
                    selectedCountry === group.code
                      ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                      : "bg-[#1a1a2e] text-gray-300 border-2 border-[#2a2a45] hover:border-indigo-500/30"
                  )}
                >
                  <span className="text-xl">{group.flag}</span>
                  <span>{group.name}</span>
                  <span className="text-sm opacity-60">({group.categories.length})</span>
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
                    "flex-shrink-0 rounded-full px-5 py-2.5 text-base font-medium transition-all min-h-[44px]",
                    "focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none",
                    selectedCategory === null
                      ? "bg-indigo-500 text-white"
                      : "bg-[#1a1a2e] text-gray-400 border-2 border-[#2a2a45] hover:border-indigo-500/30"
                  )}
                >
                  All {COUNTRY_MAP[selectedCountry]?.name || selectedCountry}
                </button>
                {countryCategories.map((cat) => (
                  <button
                    key={cat.categoryId}
                    onClick={() => handleCategorySelect(cat.categoryId)}
                    tabIndex={0}
                    className={clsx(
                      "flex-shrink-0 rounded-full px-5 py-2.5 text-base font-medium transition-all whitespace-nowrap min-h-[44px]",
                      "focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none",
                      selectedCategory === cat.categoryId
                        ? "bg-indigo-500 text-white"
                        : "bg-[#1a1a2e] text-gray-400 border-2 border-[#2a2a45] hover:border-indigo-500/30"
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
        {!selectedCategory && !searchQuery && !showFavoritesOnly ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <HiSignal className="h-16 w-16 text-gray-600 mb-4" />
            <p className="text-lg text-gray-400">Kategorie auswählen</p>
            <p className="text-sm text-gray-500 mt-1">Wähle ein Land und eine Kategorie um Kanäle zu laden</p>
          </div>
        ) : loadingChannels ? (
          <div className="flex items-center justify-center py-16">
            <LoadingSpinner text="Lade Kanäle..." />
          </div>
        ) : filteredChannels.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <HiSignal className="h-16 w-16 text-gray-600 mb-4" />
            <p className="text-lg text-gray-400">
              {showFavoritesOnly
                ? "Noch keine Favoriten. Tippe auf das Herz-Symbol um Kanäle hinzuzufügen!"
                : "Keine Kanäle gefunden"}
            </p>
          </div>
        ) : (
          <div
            ref={gridRef}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
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
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleChannelClick(channel);
                      return;
                    }
                    if (!gridRef.current) return;
                    const items = Array.from(gridRef.current.querySelectorAll("[role='button']")) as HTMLElement[];
                    const currentIdx = items.indexOf(e.currentTarget as HTMLElement);
                    const cols = Math.round(gridRef.current.offsetWidth / (items[0]?.offsetWidth || 200));
                    handleGridKeyDown(e, items, currentIdx, cols || 4);
                  }}
                  className={clsx(
                    "group relative rounded-xl glass-card p-4 text-left cursor-pointer",
                    "focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none",
                    "min-h-[120px]"
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
                    className="absolute top-2 right-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition-all hover:bg-black/60 hover:scale-110"
                    aria-label={fav ? "Remove from favorites" : "Add to favorites"}
                  >
                    {fav ? (
                      <HiHeart className="h-5 w-5 text-red-500" />
                    ) : (
                      <HiOutlineHeart className="h-5 w-5 text-white/50 group-hover:text-white/80" />
                    )}
                  </button>

                  {/* Channel number badge in favorites view */}
                  {showFavoritesOnly && (
                    <div className="absolute top-2 left-2 z-10 flex h-8 min-w-[2rem] items-center justify-center rounded-lg bg-gradient-to-br from-yellow-500 to-amber-600 px-2">
                      <span className="text-sm font-bold text-black">{idx + 1}</span>
                    </div>
                  )}

                  <div className="relative aspect-video w-full mb-3 rounded-lg overflow-hidden bg-[#25253d]">
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
                        <HiSignal className="h-8 w-8 text-gray-600" />
                      </div>
                    )}
                  </div>
                  <p className="text-base font-semibold text-gray-200 truncate group-hover:text-white leading-tight">
                    {channel.name}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
