"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { HiMagnifyingGlass } from "react-icons/hi2";
import { useAuthStore, useFavoritesStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import {
  fetchLiveStreams,
  fetchVodStreams,
  fetchSeries,
  buildVodUrl,
  buildSeriesUrl,
} from "@/lib/api-client";
import type { Channel, Movie, Series } from "@/types";
import SearchBar from "@/components/ui/SearchBar";
import ContentCard from "@/components/ui/ContentCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

type SearchTab = "all" | "live" | "movies" | "series";

interface SearchResults {
  live: Channel[];
  movies: Movie[];
  series: Series[];
}

export default function SearchPage() {
  const router = useRouter();
  const t = useT();
  const credentials = useAuthStore((s) => s.credentials);
  const { toggle, isFavorite } = useFavoritesStore();

  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<SearchTab>("all");
  const [results, setResults] = useState<SearchResults>({
    live: [],
    movies: [],
    series: [],
  });
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const isXtream = credentials && "serverUrl" in credentials;
  const creds = credentials as { serverUrl: string; username: string; password: string } | null;

  const doSearch = useCallback(
    async (q: string) => {
      if (!q.trim() || !isXtream || !creds) {
        setResults({ live: [], movies: [], series: [] });
        setHasSearched(false);
        return;
      }
      setLoading(true);
      setHasSearched(true);
      const lowerQ = q.toLowerCase();

      try {
        const [liveAll, moviesAll, seriesAll] = await Promise.allSettled([
          fetchLiveStreams(creds),
          fetchVodStreams(creds),
          fetchSeries(creds),
        ]);

        const live =
          liveAll.status === "fulfilled"
            ? liveAll.value.filter((c) =>
                c.name.toLowerCase().includes(lowerQ)
              )
            : [];
        const movies =
          moviesAll.status === "fulfilled"
            ? moviesAll.value.filter((m) =>
                m.name.toLowerCase().includes(lowerQ)
              )
            : [];
        const series =
          seriesAll.status === "fulfilled"
            ? seriesAll.value.filter((s) =>
                s.name.toLowerCase().includes(lowerQ)
              )
            : [];

        setResults({
          live: live.slice(0, 50),
          movies: movies.slice(0, 50),
          series: series.slice(0, 50),
        });
      } catch {
        setResults({ live: [], movies: [], series: [] });
      } finally {
        setLoading(false);
      }
    },
    [isXtream, creds]
  );

  const handleSearch = useCallback(
    (q: string) => {
      setQuery(q);
      doSearch(q);
    },
    [doSearch]
  );

  const totalResults =
    results.live.length + results.movies.length + results.series.length;

  const tabs: { key: SearchTab; label: string; count: number }[] = [
    {
      key: "all",
      label: t("favorites.all"),
      count: totalResults,
    },
    { key: "live", label: t("nav.liveTV"), count: results.live.length },
    { key: "movies", label: t("nav.movies"), count: results.movies.length },
    { key: "series", label: t("nav.series"), count: results.series.length },
  ];

  const showLive = tab === "all" || tab === "live";
  const showMovies = tab === "all" || tab === "movies";
  const showSeries = tab === "all" || tab === "series";

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-[#2a2a38]">
        <SearchBar
          placeholder={t("search.placeholder")}
          onSearch={handleSearch}
          className="max-w-xl mb-4"
          autoFocus
          debounceMs={500}
        />
        {hasSearched && (
          <div className="flex gap-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={clsx(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                  tab === t.key
                    ? "bg-amber-500 text-white"
                    : "bg-[#181820] text-gray-400 hover:bg-[#22222e]"
                )}
              >
                {t.label} ({t.count})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <LoadingSpinner text={t("common.loading")} />
          </div>
        ) : !hasSearched ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 mb-4">
              <HiMagnifyingGlass className="h-8 w-8 text-amber-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {t("nav.search")}
            </h3>
            <p className="text-sm text-gray-400 max-w-sm">
              {t("search.placeholder")}
            </p>
          </div>
        ) : totalResults === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-gray-500">
              {t("search.noResults")} &quot;{query}&quot;
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Live results */}
            {showLive && results.live.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  {t("nav.liveTV")} ({results.live.length})
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {results.live.map((ch) => (
                    <ContentCard
                      key={ch.id}
                      id={ch.id}
                      title={ch.name}
                      image={ch.logo}
                      subtitle="Live"
                      isFavorite={isFavorite(ch.id)}
                      onFavoriteToggle={() =>
                        toggle({
                          id: ch.id,
                          name: ch.name,
                          streamType: "live",
                          logo: ch.logo,
                        })
                      }
                      onClick={() =>
                        router.push(
                          `/player/${ch.id}?type=live&url=${encodeURIComponent(ch.url)}`
                        )
                      }
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Movie results */}
            {showMovies && results.movies.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  {t("nav.movies")} ({results.movies.length})
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {results.movies.map((movie) => (
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
                        })
                      }
                      onClick={() => {
                        if (!creds) return;
                        const url = buildVodUrl(
                          creds,
                          movie.streamId,
                          movie.containerExtension
                        );
                        router.push(
                          `/player/${movie.streamId}?type=movie&url=${encodeURIComponent(url)}`
                        );
                      }}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Series results */}
            {showSeries && results.series.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  {t("nav.series")} ({results.series.length})
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {results.series.map((s) => (
                    <ContentCard
                      key={s.seriesId}
                      id={String(s.seriesId)}
                      title={s.name}
                      image={s.cover}
                      rating={s.rating}
                      year={s.releaseDate?.split("-")[0]}
                      subtitle={s.genre}
                      isFavorite={isFavorite(String(s.seriesId))}
                      onFavoriteToggle={() =>
                        toggle({
                          id: String(s.seriesId),
                          name: s.name,
                          streamType: "series",
                          logo: s.cover,
                        })
                      }
                      onClick={() =>
                        router.push(`/series?detail=${s.seriesId}`)
                      }
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
