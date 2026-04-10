"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { HiFilm, HiXMark, HiPlay, HiStar } from "react-icons/hi2";
import { useAuthStore, useFavoritesStore } from "@/lib/store";
import { fetchVodCategories, fetchVodStreams, buildVodUrl } from "@/lib/api-client";
import type { Category, Movie } from "@/types";
import SearchBar from "@/components/ui/SearchBar";
import ContentCard from "@/components/ui/ContentCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorDisplay from "@/components/ui/ErrorDisplay";

export default function MoviesPage() {
  const router = useRouter();
  const credentials = useAuthStore((s) => s.credentials);
  const { toggle, isFavorite } = useFavoritesStore();

  const [categories, setCategories] = useState<Category[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMovies, setLoadingMovies] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

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
    setLoadingMovies(true);
    fetchVodStreams(creds, selectedCategory ?? undefined)
      .then((m) => {
        setMovies(m);
        setLoadingMovies(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoadingMovies(false);
      });
  }, [credentials, isXtream, selectedCategory, creds]);

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
  }, []);

  const filteredMovies = searchQuery
    ? movies.filter((m) =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : movies;

  const handlePlay = (movie: Movie) => {
    if (!creds) return;
    const url = buildVodUrl(creds, movie.streamId, movie.containerExtension);
    router.push(`/player/${movie.streamId}?type=movie&url=${encodeURIComponent(url)}`);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner size="lg" text="Loading Movies..." />
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
          placeholder="Search movies..."
          onSearch={handleSearch}
          className="max-w-md mb-4"
        />

        {/* Category chips */}
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

      {/* Movie grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {loadingMovies ? (
          <div className="flex items-center justify-center py-16">
            <LoadingSpinner text="Loading movies..." />
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <HiFilm className="h-12 w-12 text-gray-600 mb-3" />
            <p className="text-sm text-gray-500">No movies found</p>
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
                onClick={() => setSelectedMovie(movie)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Movie detail modal */}
      {selectedMovie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#1a1a2e] border border-[#2a2a45] shadow-2xl">
            {/* Close */}
            <button
              onClick={() => setSelectedMovie(null)}
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
            >
              <HiXMark className="h-5 w-5" />
            </button>

            {/* Header with poster */}
            <div className="relative h-64 overflow-hidden rounded-t-2xl bg-[#25253d]">
              {selectedMovie.streamIcon && (
                <div
                  className="absolute inset-0 bg-cover bg-center blur-2xl opacity-30"
                  style={{
                    backgroundImage: `url(${selectedMovie.streamIcon})`,
                  }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e] via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h2 className="text-xl font-bold text-white mb-2">
                  {selectedMovie.name}
                </h2>
                <div className="flex items-center gap-3 text-sm">
                  {selectedMovie.rating && parseFloat(selectedMovie.rating) > 0 && (
                    <span className="flex items-center gap-1 text-yellow-400">
                      <HiStar className="h-4 w-4" />
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
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-sm font-semibold text-white hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/20 mb-4"
              >
                <HiPlay className="h-5 w-5" />
                Play Movie
              </button>

              {/* Plot */}
              {selectedMovie.plot && (
                <div className="mb-4">
                  <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                    Plot
                  </h3>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {selectedMovie.plot}
                  </p>
                </div>
              )}

              {/* Cast */}
              {selectedMovie.cast && (
                <div className="mb-4">
                  <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                    Cast
                  </h3>
                  <p className="text-sm text-gray-400">{selectedMovie.cast}</p>
                </div>
              )}

              {/* Director */}
              {selectedMovie.director && (
                <div>
                  <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                    Director
                  </h3>
                  <p className="text-sm text-gray-400">
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
