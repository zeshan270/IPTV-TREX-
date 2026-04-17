"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { HiFilm, HiXMark, HiPlay, HiStar, HiGlobeAlt } from "react-icons/hi2";
import { useAuthStore, useFavoritesStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { fetchVodCategories, fetchVodStreams, buildVodUrl } from "@/lib/api-client";
import type { Category, Movie } from "@/types";
import SearchBar from "@/components/ui/SearchBar";
import ContentCard from "@/components/ui/ContentCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorDisplay from "@/components/ui/ErrorDisplay";

const COUNTRY_MAP: Record<string, { flag: string; name: string }> = {
  AF: { flag: "\uD83C\uDDE6\uD83C\uDDEB", name: "Afghanistan" },
  AL: { flag: "\uD83C\uDDE6\uD83C\uDDF1", name: "Albania" },
  AR: { flag: "\uD83C\uDDE6\uD83C\uDDF7", name: "Argentina" },
  AU: { flag: "\uD83C\uDDE6\uD83C\uDDFA", name: "Australia" },
  AT: { flag: "\uD83C\uDDE6\uD83C\uDDF9", name: "Austria" },
  BD: { flag: "\uD83C\uDDE7\uD83C\uDDE9", name: "Bangladesh" },
  BE: { flag: "\uD83C\uDDE7\uD83C\uDDEA", name: "Belgium" },
  BR: { flag: "\uD83C\uDDE7\uD83C\uDDF7", name: "Brazil" },
  CA: { flag: "\uD83C\uDDE8\uD83C\uDDE6", name: "Canada" },
  CN: { flag: "\uD83C\uDDE8\uD83C\uDDF3", name: "China" },
  CO: { flag: "\uD83C\uDDE8\uD83C\uDDF4", name: "Colombia" },
  CZ: { flag: "\uD83C\uDDE8\uD83C\uDDFF", name: "Czech Republic" },
  DK: { flag: "\uD83C\uDDE9\uD83C\uDDF0", name: "Denmark" },
  EG: { flag: "\uD83C\uDDEA\uD83C\uDDEC", name: "Egypt" },
  FI: { flag: "\uD83C\uDDEB\uD83C\uDDEE", name: "Finland" },
  FR: { flag: "\uD83C\uDDEB\uD83C\uDDF7", name: "France" },
  DE: { flag: "\uD83C\uDDE9\uD83C\uDDEA", name: "Germany" },
  GR: { flag: "\uD83C\uDDEC\uD83C\uDDF7", name: "Greece" },
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
  MY: { flag: "\uD83C\uDDF2\uD83C\uDDFE", name: "Malaysia" },
  MX: { flag: "\uD83C\uDDF2\uD83C\uDDFD", name: "Mexico" },
  NL: { flag: "\uD83C\uDDF3\uD83C\uDDF1", name: "Netherlands" },
  NO: { flag: "\uD83C\uDDF3\uD83C\uDDF4", name: "Norway" },
  PK: { flag: "\uD83C\uDDF5\uD83C\uDDF0", name: "Pakistan" },
  PL: { flag: "\uD83C\uDDF5\uD83C\uDDF1", name: "Poland" },
  PT: { flag: "\uD83C\uDDF5\uD83C\uDDF9", name: "Portugal" },
  RO: { flag: "\uD83C\uDDF7\uD83C\uDDF4", name: "Romania" },
  RU: { flag: "\uD83C\uDDF7\uD83C\uDDFA", name: "Russia" },
  ES: { flag: "\uD83C\uDDEA\uD83C\uDDF8", name: "Spain" },
  SE: { flag: "\uD83C\uDDF8\uD83C\uDDEA", name: "Sweden" },
  CH: { flag: "\uD83C\uDDE8\uD83C\uDDED", name: "Switzerland" },
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

const NAME_TO_CODE: Record<string, string> = {};
Object.entries(COUNTRY_MAP).forEach(([code, { name }]) => {
  NAME_TO_CODE[name.toLowerCase()] = code;
});

function extractCountry(categoryName: string): { countryCode: string; subCategory: string } {
  const name = categoryName.trim();
  const colonMatch = name.match(/^([A-Z]{2})\s*:\s*(.+)$/);
  if (colonMatch && COUNTRY_MAP[colonMatch[1]]) return { countryCode: colonMatch[1], subCategory: colonMatch[2].trim() };
  const pipeMatch = name.match(/^([A-Z]{2})\s*\|\s*(.+)$/);
  if (pipeMatch && COUNTRY_MAP[pipeMatch[1]]) return { countryCode: pipeMatch[1], subCategory: pipeMatch[2].trim() };
  const pipeSurroundMatch = name.match(/^\|([A-Z]{2})\|\s*(.+)$/);
  if (pipeSurroundMatch && COUNTRY_MAP[pipeSurroundMatch[1]]) return { countryCode: pipeSurroundMatch[1], subCategory: pipeSurroundMatch[2].trim() };
  const dashMatch = name.match(/^([A-Z]{2})\s*-\s*(.+)$/);
  if (dashMatch && COUNTRY_MAP[dashMatch[1]]) return { countryCode: dashMatch[1], subCategory: dashMatch[2].trim() };
  const lowerName = name.toLowerCase();
  for (const [cname, code] of Object.entries(NAME_TO_CODE)) {
    if (lowerName.startsWith(cname + " ") || lowerName.startsWith(cname + ":") || lowerName.startsWith(cname + "-") || lowerName === cname) {
      const rest = name.substring(cname.length).replace(/^[\s:\-|]+/, "").trim();
      return { countryCode: code, subCategory: rest || "General" };
    }
  }
  return { countryCode: "XX", subCategory: name };
}

export default function MoviesPage() {
  const router = useRouter();
  const t = useT();
  const credentials = useAuthStore((s) => s.credentials);
  const { toggle, isFavorite } = useFavoritesStore();

  const [categories, setCategories] = useState<Category[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMovies, setLoadingMovies] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  const isXtream = credentials && "serverUrl" in credentials;
  const creds = credentials as { serverUrl: string; username: string; password: string } | null;

  useEffect(() => {
    if (!isXtream || !creds) return;
    setLoading(true);
    fetchVodCategories(creds)
      .then((cats) => {
        setCategories(cats);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [credentials, isXtream, creds]);

  useEffect(() => {
    if (!isXtream || !creds) return;
    // Only load movies when a category is selected - loading all is too slow
    if (!selectedCategory) {
      setMovies([]);
      return;
    }
    setLoadingMovies(true);
    fetchVodStreams(creds, selectedCategory)
      .then((m) => {
        setMovies(m);
        setLoadingMovies(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoadingMovies(false);
      });
  }, [credentials, isXtream, selectedCategory, creds]);

  // Group categories by country
  const countryGroups = useMemo(() => {
    const groups: Record<string, { code: string; flag: string; name: string; categories: { categoryId: string; subCategory: string }[] }> = {};
    categories.forEach((cat) => {
      const { countryCode, subCategory } = extractCountry(cat.categoryName);
      if (!groups[countryCode]) {
        const info = COUNTRY_MAP[countryCode] || { flag: "\uD83C\uDF0D", name: countryCode };
        groups[countryCode] = { code: countryCode, flag: info.flag, name: info.name, categories: [] };
      }
      groups[countryCode].categories.push({ categoryId: cat.categoryId, subCategory });
    });
    return Object.values(groups).sort((a, b) => {
      if (a.code === "XX") return 1;
      if (b.code === "XX") return -1;
      return a.name.localeCompare(b.name);
    });
  }, [categories]);

  const countryCategories = useMemo(() => {
    if (!selectedCountry) return [];
    return countryGroups.find((g) => g.code === selectedCountry)?.categories || [];
  }, [selectedCountry, countryGroups]);

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
  }, []);

  const filteredMovies = searchQuery
    ? movies.filter((m) => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : movies;

  const handlePlay = (movie: Movie) => {
    if (!creds) return;
    const url = buildVodUrl(creds, movie.streamId, movie.containerExtension);
    router.push(`/player/${movie.streamId}?type=movie&url=${encodeURIComponent(url)}&name=${encodeURIComponent(movie.name)}`);
  };

  const handleCountrySelect = (code: string | null) => {
    setSelectedCountry(code);
    setSelectedCategory(null);
    if (code) {
      const group = countryGroups.find((g) => g.code === code);
      if (group && group.categories.length === 1) {
        setSelectedCategory(group.categories[0].categoryId);
      }
    }
  };

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedMovie) {
        setSelectedMovie(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedMovie]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner size="lg" text={t("movies.loading")} />
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
      <div className="p-4 border-b border-[#2a2a38] space-y-3">
        <SearchBar
          placeholder={t("search.placeholder")}
          onSearch={handleSearch}
          className="max-w-md"
        />

        {/* Country filter bar */}
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          <button
            onClick={() => handleCountrySelect(null)}
            tabIndex={0}
            className={clsx(
              "flex-shrink-0 flex items-center gap-2 rounded-xl px-4 py-2.5 text-base font-semibold transition-all min-h-[48px]",
              "focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none",
              selectedCountry === null
                ? "bg-amber-500 text-white shadow-lg"
                : "bg-[#181820] text-gray-300 border-2 border-[#2a2a38] hover:border-amber-500/30"
            )}
          >
            <HiGlobeAlt className="h-5 w-5" />
            {t("favorites.all")}
          </button>
          {countryGroups.map((group) => (
            <button
              key={group.code}
              onClick={() => handleCountrySelect(group.code)}
              tabIndex={0}
              className={clsx(
                "flex-shrink-0 flex items-center gap-2 rounded-xl px-4 py-2.5 text-base font-medium transition-all whitespace-nowrap min-h-[48px]",
                "focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none",
                selectedCountry === group.code
                  ? "bg-amber-500 text-white shadow-lg"
                  : "bg-[#181820] text-gray-300 border-2 border-[#2a2a38] hover:border-amber-500/30"
              )}
            >
              <span className="text-lg">{group.flag}</span>
              <span className="hidden sm:inline">{group.name}</span>
            </button>
          ))}
        </div>

        {/* Category chips */}
        {selectedCountry && countryCategories.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
            <button
              onClick={() => setSelectedCategory(null)}
              tabIndex={0}
              className={clsx(
                "flex-shrink-0 rounded-full px-5 py-2.5 text-base font-medium transition-all min-h-[44px]",
                "focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none",
                selectedCategory === null
                  ? "bg-amber-500 text-white"
                  : "bg-[#181820] text-gray-400 border-2 border-[#2a2a38] hover:border-amber-500/30"
              )}
            >
              {t("favorites.all")}
            </button>
            {countryCategories.map((cat) => (
              <button
                key={cat.categoryId}
                onClick={() => setSelectedCategory(cat.categoryId)}
                tabIndex={0}
                className={clsx(
                  "flex-shrink-0 rounded-full px-5 py-2.5 text-base font-medium transition-all whitespace-nowrap min-h-[44px]",
                  "focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none",
                  selectedCategory === cat.categoryId
                    ? "bg-amber-500 text-white"
                    : "bg-[#181820] text-gray-400 border-2 border-[#2a2a38] hover:border-amber-500/30"
                )}
              >
                {cat.subCategory}
              </button>
            ))}
          </div>
        )}

        {/* Show all categories if no country selected */}
        {!selectedCountry && (
          <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
            <button
              onClick={() => setSelectedCategory(null)}
              tabIndex={0}
              className={clsx(
                "flex-shrink-0 rounded-full px-5 py-2.5 text-base font-medium transition-all min-h-[44px]",
                "focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none",
                selectedCategory === null
                  ? "bg-amber-500 text-white"
                  : "bg-[#181820] text-gray-400 border-2 border-[#2a2a38] hover:border-amber-500/30"
              )}
            >
              {t("favorites.all")}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.categoryId}
                onClick={() => setSelectedCategory(cat.categoryId)}
                tabIndex={0}
                className={clsx(
                  "flex-shrink-0 rounded-full px-5 py-2.5 text-base font-medium transition-all whitespace-nowrap min-h-[44px]",
                  "focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none",
                  selectedCategory === cat.categoryId
                    ? "bg-amber-500 text-white"
                    : "bg-[#181820] text-gray-400 border-2 border-[#2a2a38] hover:border-amber-500/30"
                )}
              >
                {cat.categoryName}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Movie grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {!selectedCategory && !searchQuery ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <HiFilm className="h-16 w-16 text-gray-600 mb-4" />
            <p className="text-lg text-gray-400">{t("live.selectCategory")}</p>
            <p className="text-sm text-gray-500 mt-1">{t("live.selectCategoryDesc")}</p>
          </div>
        ) : loadingMovies ? (
          <div className="flex items-center justify-center py-16">
            <LoadingSpinner text={t("movies.loading")} />
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <HiFilm className="h-16 w-16 text-gray-600 mb-4" />
            <p className="text-lg text-gray-400">{t("movies.notFound")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredMovies.map((movie) => (
              <ContentCard
                key={movie.streamId}
                id={String(movie.streamId)}
                title={movie.name}
                image={movie.streamIcon}
                rating={movie.rating}
                year={movie.releaseDate?.split("-")[0]}
                isFavorite={isFavorite(String(movie.streamId))}
                onFavoriteToggle={() =>
                  toggle({
                    id: String(movie.streamId),
                    name: movie.name,
                    streamType: "movie",
                    logo: movie.streamIcon,
                    categoryId: movie.categoryId,
                  })
                }
                onClick={() => router.push(`/movies/${movie.streamId}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Movie detail modal */}
      {selectedMovie && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedMovie(null);
          }}
        >
          <div
            ref={modalRef}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl glass-panel shadow-2xl"
          >
            {/* Close */}
            <button
              onClick={() => setSelectedMovie(null)}
              tabIndex={0}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none"
            >
              <HiXMark className="h-6 w-6" />
            </button>

            {/* Header with poster */}
            <div className="relative h-72 overflow-hidden rounded-t-2xl bg-[#22222e]">
              {selectedMovie.streamIcon && (
                <div
                  className="absolute inset-0 bg-cover bg-center blur-2xl opacity-30"
                  style={{
                    backgroundImage: `url(${selectedMovie.streamIcon})`,
                  }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#181820] via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {selectedMovie.name}
                </h2>
                <div className="flex items-center gap-3 text-base">
                  {selectedMovie.rating && parseFloat(selectedMovie.rating) > 0 && (
                    <span className="flex items-center gap-1 text-yellow-400">
                      <HiStar className="h-5 w-5" />
                      {parseFloat(selectedMovie.rating).toFixed(1)}
                    </span>
                  )}
                  {selectedMovie.releaseDate && (
                    <span className="text-gray-400">
                      {selectedMovie.releaseDate.split("-")[0]}
                    </span>
                  )}
                  {selectedMovie.duration && (
                    <span className="text-gray-400">{selectedMovie.duration}</span>
                  )}
                  {selectedMovie.genre && (
                    <span className="text-gray-400">{selectedMovie.genre}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Play button */}
              <button
                onClick={() => handlePlay(selectedMovie)}
                tabIndex={0}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 py-4 text-lg font-semibold text-white hover:from-amber-500 hover:to-orange-500 transition-all shadow-lg shadow-amber-500/20 mb-5 focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none min-h-[56px]"
              >
                <HiPlay className="h-6 w-6" />
                {t("movies.play")}
              </button>

              {/* Favorite toggle */}
              <button
                onClick={() =>
                  toggle({
                    id: String(selectedMovie.streamId),
                    name: selectedMovie.name,
                    streamType: "movie",
                    logo: selectedMovie.streamIcon,
                    categoryId: selectedMovie.categoryId,
                  })
                }
                tabIndex={0}
                className={clsx(
                  "w-full flex items-center justify-center gap-2 rounded-xl py-3 text-base font-semibold transition-all mb-5 min-h-[48px]",
                  "focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none",
                  isFavorite(String(selectedMovie.streamId))
                    ? "bg-yellow-500/20 text-yellow-400 border-2 border-yellow-500/40"
                    : "bg-[#22222e] text-gray-400 border-2 border-[#2a2a38] hover:border-yellow-500/30"
                )}
              >
                <HiStar className="h-5 w-5" />
                {t("movies.favorite")}
              </button>

              {/* Plot */}
              {selectedMovie.plot && (
                <div className="mb-5">
                  <h3 className="text-sm text-gray-500 uppercase tracking-wider mb-2">
                    Plot
                  </h3>

                  <p className="text-base text-gray-300 leading-relaxed">
                    {selectedMovie.plot}
                  </p>
                </div>
              )}

              {/* Cast */}
              {selectedMovie.cast && (
                <div className="mb-5">
                  <h3 className="text-sm text-gray-500 uppercase tracking-wider mb-2">
                    {t("movies.cast")}
                  </h3>
                  <p className="text-base text-gray-400">{selectedMovie.cast}</p>
                </div>
              )}

              {/* Director */}
              {selectedMovie.director && (
                <div>
                  <h3 className="text-sm text-gray-500 uppercase tracking-wider mb-2">
                    {t("movies.director")}
                  </h3>
                  <p className="text-base text-gray-400">
                    {selectedMovie.director}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
