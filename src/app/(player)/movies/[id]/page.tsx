"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import clsx from "clsx";
import { HiPlay, HiHeart, HiOutlineHeart, HiStar, HiArrowLeft, HiClock, HiFilm } from "react-icons/hi2";
import { useAuthStore, usePlayerStore, useFavoritesStore } from "@/lib/store";
import { fetchVodInfo, buildVodUrl } from "@/lib/api-client";
import type { MovieInfo, XtreamCredentials } from "@/types";

function formatDuration(raw: string): string {
  if (!raw) return "";
  const hms = raw.match(/^(\d+):(\d+):(\d+)$/);
  if (hms) {
    const h = parseInt(hms[1], 10), m = parseInt(hms[2], 10);
    if (h > 0 && m > 0) return `${h}h ${m}min`;
    if (h > 0) return `${h}h`;
    return m > 0 ? `${m}min` : raw;
  }
  const minMatch = raw.match(/^(\d+)\s*min/i);
  if (minMatch) {
    const t = parseInt(minMatch[1], 10);
    return t >= 60 ? `${Math.floor(t / 60)}h ${t % 60}min` : `${t}min`;
  }
  return raw;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function MovieDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const credentials = useAuthStore((s) => s.credentials);
  const { getPosition } = usePlayerStore();
  const { toggle, isFavorite } = useFavoritesStore();

  const [movie, setMovie] = useState<MovieInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plotExpanded, setPlotExpanded] = useState(false);

  const isXtream = credentials && "serverUrl" in credentials;
  const creds = isXtream ? (credentials as XtreamCredentials) : null;

  useEffect(() => {
    if (!creds) return;
    setLoading(true);
    setError(null);
    fetchVodInfo(creds, Number(id))
      .then((info) => { setMovie(info); setLoading(false); })
      .catch((err) => { setError(err.message || "Film konnte nicht geladen werden"); setLoading(false); });
  }, [id, creds]);

  const saved = movie ? getPosition(String(movie.streamId)) : null;
  const progress = saved && saved.duration > 0 ? saved.position / saved.duration : 0;
  const showContinue = saved && progress > 0.02 && progress < 0.95 && saved.position > 5;

  const handlePlay = () => {
    if (!creds || !movie) return;
    const streamUrl = buildVodUrl(creds, movie.streamId, movie.containerExtension);
    router.push(
      `/player/${movie.streamId}?type=movie&url=${encodeURIComponent(streamUrl)}&name=${encodeURIComponent(movie.name)}`
    );
  };

  const handleFavorite = () => {
    if (!movie) return;
    toggle({ id: String(movie.streamId), name: movie.name, streamType: "movie", logo: movie.cover });
  };

  const backdropSrc = movie?.backdropPath?.[0] || movie?.coverBig || movie?.cover || "";
  const posterSrc = movie?.cover || movie?.coverBig || "";
  const year = movie?.year || movie?.releaseDate?.split("-")[0] || "";
  const rating = movie ? parseFloat(movie.rating) : 0;
  const genres = movie?.genre ? movie.genre.split(/[,/]/).map((g) => g.trim()).filter(Boolean) : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d14]">
        <div className="relative h-[50vh] bg-[#181820] animate-pulse" />
        <div className="max-w-5xl mx-auto px-4 -mt-32 relative z-10">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-48 h-72 rounded-xl bg-[#22222e] animate-pulse flex-shrink-0 mx-auto md:mx-0" />
            <div className="flex-1 space-y-4 pt-4">
              <div className="h-8 w-3/4 bg-[#22222e] rounded animate-pulse" />
              <div className="h-5 w-1/2 bg-[#22222e] rounded animate-pulse" />
              <div className="h-14 w-full bg-[#22222e] rounded-xl animate-pulse" />
              <div className="h-20 w-full bg-[#22222e] rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-[#0d0d14] flex flex-col items-center justify-center gap-4 p-8">
        <HiFilm className="h-16 w-16 text-gray-600" />
        <p className="text-lg text-gray-400">{error || "Film nicht gefunden"}</p>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 rounded-xl bg-[#22222e] px-5 py-3 text-sm text-gray-300 hover:bg-[#2a2a38] transition-colors"
        >
          <HiArrowLeft className="h-4 w-4" />
          Zurueck
        </button>
      </div>
    );
  }

  const plotIsLong = movie.plot.length > 250;
  const faved = isFavorite(String(movie.streamId));

  return (
    <div className="min-h-screen bg-[#0d0d14] pb-12">
      {/* Backdrop */}
      <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
        {backdropSrc && (
          <Image src={backdropSrc} alt="" fill className="object-cover" unoptimized priority />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d14] via-[#0d0d14]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d14]/80 to-transparent" />
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 z-20 flex items-center gap-2 rounded-full bg-black/50 backdrop-blur-sm px-4 py-2 text-sm text-white hover:bg-black/70 transition-colors"
        >
          <HiArrowLeft className="h-4 w-4" />
          Zurueck
        </button>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 -mt-36 md:-mt-44 relative z-10">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Poster */}
          {posterSrc && (
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <div className="relative w-40 h-60 md:w-48 md:h-72 rounded-xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10">
                <Image src={posterSrc} alt={movie.name} fill className="object-cover" unoptimized />
              </div>
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight mb-3">
              {movie.name}
            </h1>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 mb-4">
              {year && <span className="font-medium text-gray-300">{year}</span>}
              {movie.duration && (
                <span className="flex items-center gap-1">
                  <HiClock className="h-4 w-4" />
                  {formatDuration(movie.duration)}
                </span>
              )}
              {rating > 0 && (
                <span className="flex items-center gap-1 text-amber-400 font-medium">
                  <HiStar className="h-4 w-4" />
                  {rating.toFixed(1)}
                </span>
              )}
              {movie.country && <span>{movie.country}</span>}
            </div>

            {/* Genre badges */}
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {genres.map((g) => (
                  <span key={g} className="rounded-full bg-white/10 backdrop-blur-sm px-3 py-1 text-xs font-medium text-gray-300 ring-1 ring-white/5">
                    {g}
                  </span>
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={handlePlay}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-orange-400 transition-all active:scale-[0.98]"
              >
                <HiPlay className="h-5 w-5" />
                {showContinue ? "Fortsetzen" : "Abspielen"}
              </button>
              <button
                onClick={handleFavorite}
                className={clsx(
                  "flex items-center gap-2 rounded-xl px-5 py-3.5 text-base font-medium transition-all ring-1",
                  faved
                    ? "bg-rose-500/15 text-rose-400 ring-rose-500/30 hover:bg-rose-500/25"
                    : "bg-white/5 text-gray-400 ring-white/10 hover:bg-white/10 hover:text-white"
                )}
              >
                {faved ? <HiHeart className="h-5 w-5" /> : <HiOutlineHeart className="h-5 w-5" />}
                Favorit
              </button>
              {movie.youtubeTrailer && (
                <a
                  href={`https://www.youtube.com/watch?v=${movie.youtubeTrailer}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl bg-white/5 px-5 py-3.5 text-base font-medium text-gray-400 ring-1 ring-white/10 hover:bg-white/10 hover:text-white transition-all"
                >
                  <HiFilm className="h-5 w-5" />
                  Trailer
                </a>
              )}
            </div>

            {/* Continue watching progress */}
            {showContinue && saved && (
              <div className="mb-6 max-w-sm">
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mb-1.5">
                  <div className="h-full rounded-full bg-amber-500" style={{ width: `${Math.min(progress * 100, 100)}%` }} />
                </div>
                <p className="text-xs text-gray-500">Fortsetzen ab {formatTime(saved.position)}</p>
              </div>
            )}

            {/* Plot */}
            {movie.plot && (
              <div className="mb-6">
                <p className={clsx("text-sm md:text-base text-gray-300 leading-relaxed", !plotExpanded && plotIsLong && "line-clamp-4")}>
                  {movie.plot}
                </p>
                {plotIsLong && (
                  <button onClick={() => setPlotExpanded(!plotExpanded)} className="mt-2 text-sm text-amber-400 hover:text-amber-300 transition-colors">
                    {plotExpanded ? "Weniger" : "Mehr anzeigen"}
                  </button>
                )}
              </div>
            )}

            {/* Cast & Director */}
            <div className="space-y-4 border-t border-white/5 pt-5">
              {movie.director && (
                <div>
                  <span className="text-xs uppercase tracking-wider text-gray-500">Regie</span>
                  <p className="text-sm text-gray-300 mt-0.5">{movie.director}</p>
                </div>
              )}
              {movie.cast && (
                <div>
                  <span className="text-xs uppercase tracking-wider text-gray-500">Besetzung</span>
                  <p className="text-sm text-gray-300 mt-0.5">{movie.cast}</p>
                </div>
              )}
              {movie.originalName && movie.originalName !== movie.name && (
                <div>
                  <span className="text-xs uppercase tracking-wider text-gray-500">Originaltitel</span>
                  <p className="text-sm text-gray-300 mt-0.5">{movie.originalName}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
