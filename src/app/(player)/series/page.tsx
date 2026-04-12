"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import clsx from "clsx";
import {
  HiRectangleStack,
  HiXMark,
  HiPlay,
  HiStar,
} from "react-icons/hi2";
import { useAuthStore, useFavoritesStore } from "@/lib/store";
import {
  fetchSeriesCategories,
  fetchSeries,
  fetchSeriesInfo,
  buildSeriesUrl,
} from "@/lib/api-client";
import type { Category, Series } from "@/types";
import SearchBar from "@/components/ui/SearchBar";
import ContentCard from "@/components/ui/ContentCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorDisplay from "@/components/ui/ErrorDisplay";

export default function SeriesPage() {
  const router = useRouter();
  const credentials = useAuthStore((s) => s.credentials);
  const { toggle, isFavorite } = useFavoritesStore();

  const [categories, setCategories] = useState<Category[]>([]);
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingSeries, setLoadingSeries] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Detail view state
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [seriesDetail, setSeriesDetail] = useState<{
    episodes: Record<string, { id: string; episode_num: number; title: string; container_extension: string; info: Record<string, unknown>; season: number }[]>;
  } | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<string>("1");
  const [loadingDetail, setLoadingDetail] = useState(false);

  const isXtream = credentials && "serverUrl" in credentials;
  const creds = credentials as { serverUrl: string; username: string; password: string } | null;

  useEffect(() => {
    if (!isXtream || !creds) return;
    setLoading(true);
    fetchSeriesCategories(creds)
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
    // Only load series when a category is selected - loading all is too slow
    if (!selectedCategory) {
      setSeriesList([]);
      return;
    }
    setLoadingSeries(true);
    fetchSeries(creds, selectedCategory)
      .then((s) => {
        setSeriesList(s);
        setLoadingSeries(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoadingSeries(false);
      });
  }, [credentials, isXtream, selectedCategory, creds]);

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
  }, []);

  const filteredSeries = searchQuery
    ? seriesList.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : seriesList;

  const openDetail = async (series: Series) => {
    if (!creds) return;
    setSelectedSeries(series);
    setLoadingDetail(true);
    try {
      const info = await fetchSeriesInfo(creds, series.seriesId);
      setSeriesDetail(info);
      const seasons = Object.keys(info.episodes || {}).sort(
        (a, b) => Number(a) - Number(b)
      );
      setSelectedSeason(seasons[0] || "1");
    } catch {
      setSeriesDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handlePlayEpisode = (episodeId: string, ext: string, episodeTitle?: string) => {
    if (!creds) return;
    const url = buildSeriesUrl(creds, Number(episodeId), ext);
    const name = episodeTitle ? `${selectedSeries?.name} - ${episodeTitle}` : selectedSeries?.name || episodeId;
    router.push(`/player/${episodeId}?type=series&url=${encodeURIComponent(url)}&name=${encodeURIComponent(name)}`);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner size="lg" text="Loading Series..." />
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
      <div className="p-4 border-b border-[#2a2a45]">
        <SearchBar
          placeholder="Search series..."
          onSearch={handleSearch}
          className="max-w-md mb-4"
        />
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          <button
            onClick={() => setSelectedCategory(null)}
            className={clsx(
              "flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all",
              selectedCategory === null
                ? "bg-indigo-500 text-white"
                : "bg-[#1a1a2e] text-gray-400 border border-[#2a2a45] hover:border-indigo-500/30"
            )}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.categoryId}
              onClick={() => setSelectedCategory(cat.categoryId)}
              className={clsx(
                "flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all whitespace-nowrap",
                selectedCategory === cat.categoryId
                  ? "bg-indigo-500 text-white"
                  : "bg-[#1a1a2e] text-gray-400 border border-[#2a2a45] hover:border-indigo-500/30"
              )}
            >
              {cat.categoryName}
            </button>
          ))}
        </div>
      </div>

      {/* Series grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {!selectedCategory && !searchQuery ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <HiRectangleStack className="h-16 w-16 text-gray-600 mb-4" />
            <p className="text-lg text-gray-400">Kategorie auswählen</p>
            <p className="text-sm text-gray-500 mt-1">Wähle eine Kategorie um Serien zu laden</p>
          </div>
        ) : loadingSeries ? (
          <div className="flex items-center justify-center py-16">
            <LoadingSpinner text="Lade Serien..." />
          </div>
        ) : filteredSeries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <HiRectangleStack className="h-16 w-16 text-gray-600 mb-4" />
            <p className="text-lg text-gray-400">Keine Serien gefunden</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredSeries.map((series) => (
              <ContentCard
                key={series.seriesId}
                id={String(series.seriesId)}
                title={series.name}
                image={series.cover}
                rating={series.rating}
                year={series.releaseDate?.split("-")[0]}
                subtitle={series.genre}
                isFavorite={isFavorite(String(series.seriesId))}
                onFavoriteToggle={() =>
                  toggle({
                    id: String(series.seriesId),
                    name: series.name,
                    streamType: "series",
                    logo: series.cover,
                    categoryId: series.categoryId,
                  })
                }
                onClick={() => openDetail(series)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Series detail modal */}
      {selectedSeries && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl glass-panel shadow-2xl">
            <button
              onClick={() => {
                setSelectedSeries(null);
                setSeriesDetail(null);
              }}
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
            >
              <HiXMark className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="relative h-56 overflow-hidden rounded-t-2xl bg-[#25253d]">
              {selectedSeries.cover && (
                <div
                  className="absolute inset-0 bg-cover bg-center blur-2xl opacity-30"
                  style={{ backgroundImage: `url(${selectedSeries.cover})` }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e] via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h2 className="text-xl font-bold text-white mb-2">
                  {selectedSeries.name}
                </h2>
                <div className="flex items-center gap-3 text-sm">
                  {selectedSeries.rating &&
                    parseFloat(selectedSeries.rating) > 0 && (
                      <span className="flex items-center gap-1 text-yellow-400">
                        <HiStar className="h-4 w-4" />
                        {parseFloat(selectedSeries.rating).toFixed(1)}
                      </span>
                    )}
                  {selectedSeries.releaseDate && (
                    <span className="text-gray-400">
                      {selectedSeries.releaseDate.split("-")[0]}
                    </span>
                  )}
                  {selectedSeries.genre && (
                    <span className="text-gray-400">{selectedSeries.genre}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Plot */}
              {selectedSeries.plot && (
                <p className="text-sm text-gray-300 leading-relaxed mb-4">
                  {selectedSeries.plot}
                </p>
              )}

              {loadingDetail ? (
                <LoadingSpinner text="Loading episodes..." className="py-8" />
              ) : seriesDetail && seriesDetail.episodes ? (
                <>
                  {/* Season tabs */}
                  <div className="flex gap-2 overflow-x-auto mb-4 hide-scrollbar">
                    {Object.keys(seriesDetail.episodes)
                      .sort((a, b) => Number(a) - Number(b))
                      .map((season) => (
                        <button
                          key={season}
                          onClick={() => setSelectedSeason(season)}
                          className={clsx(
                            "flex-shrink-0 rounded-lg px-4 py-2 text-xs font-medium transition-all",
                            selectedSeason === season
                              ? "bg-indigo-500 text-white"
                              : "bg-[#25253d] text-gray-400 hover:bg-[#2a2a45]"
                          )}
                        >
                          Season {season}
                        </button>
                      ))}
                  </div>

                  {/* Episode list */}
                  <div className="space-y-2">
                    {(seriesDetail.episodes[selectedSeason] || []).map((ep) => (
                      <button
                        key={ep.id}
                        onClick={() =>
                          handlePlayEpisode(ep.id, ep.container_extension, `S${ep.season}E${ep.episode_num} ${ep.title}`)
                        }
                        className="flex w-full items-center gap-3 rounded-xl glass-row p-3 text-left"
                      >
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-500/10">
                          <HiPlay className="h-5 w-5 text-indigo-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            E{ep.episode_num}. {ep.title}
                          </p>
                          {ep.info?.duration ? (
                            <p className="text-xs text-gray-500">
                              {String(ep.info.duration)}
                            </p>
                          ) : null}
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No episode information available
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
