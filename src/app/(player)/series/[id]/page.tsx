"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import clsx from "clsx";
import { HiPlay, HiHeart, HiOutlineHeart, HiStar, HiArrowLeft, HiClock } from "react-icons/hi2";
import { useAuthStore, usePlayerStore, useFavoritesStore } from "@/lib/store";
import { fetchFullSeriesInfo, buildSeriesUrl } from "@/lib/api-client";
import type { SeriesInfo, EpisodeInfo, XtreamCredentials } from "@/types";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

function formatDuration(duration?: string): string | null {
  if (!duration) return null;
  const mins = parseInt(duration, 10);
  if (!isNaN(mins) && mins > 0) return `${mins} Min`;
  const parts = duration.split(":");
  if (parts.length === 3) {
    const total = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    if (total > 0) return `${total} Min`;
  }
  return duration;
}

export default function SeriesDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const credentials = useAuthStore((s) => s.credentials);
  const getPosition = usePlayerStore((s) => s.getPosition);
  const { isFavorite, toggle: toggleFavorite } = useFavoritesStore();

  const [series, setSeries] = useState<SeriesInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [plotExpanded, setPlotExpanded] = useState(false);

  const creds =
    credentials && "serverUrl" in credentials ? (credentials as XtreamCredentials) : null;

  useEffect(() => {
    if (!creds) return;
    setLoading(true);
    setError(null);
    fetchFullSeriesInfo(creds, Number(id))
      .then((data) => {
        setSeries(data);
        const sorted = [...data.seasons].sort((a, b) => a.seasonNumber - b.seasonNumber);
        if (sorted.length > 0) setSelectedSeason(sorted[0].seasonNumber);
      })
      .catch((err) => setError(err.message || "Fehler beim Laden"))
      .finally(() => setLoading(false));
  }, [creds?.serverUrl, creds?.username, creds?.password, id]);

  const sortedSeasons = useMemo(() => {
    if (!series) return [];
    return [...series.seasons].sort((a, b) => a.seasonNumber - b.seasonNumber);
  }, [series]);

  const episodes = useMemo(() => {
    if (!series || selectedSeason === null) return [];
    const seasonEps = series.episodes[String(selectedSeason)] || [];
    return [...seasonEps].sort((a, b) => a.episodeNum - b.episodeNum);
  }, [series, selectedSeason]);

  const backdropUrl = series?.backdropPath?.[0] || series?.cover || "";
  const year = series?.releaseDate?.slice(0, 4) || "";
  const genres = series?.genre?.split(/[,/]/).map((g) => g.trim()).filter(Boolean) || [];
  const favorited = isFavorite(id);

  function handleToggleFavorite() {
    if (!series) return;
    toggleFavorite({ id, name: series.name, streamType: "series", logo: series.cover });
  }

  function handlePlay(ep: EpisodeInfo) {
    if (!creds) return;
    const url = buildSeriesUrl(creds, Number(ep.id), ep.containerExtension);
    const name = `${series!.name} - ${ep.title}`;
    router.push(
      `/player/${ep.id}?type=series&url=${encodeURIComponent(url)}&name=${encodeURIComponent(name)}`
    );
  }

  function getEpisodeProgress(ep: EpisodeInfo): number | null {
    const pos = getPosition(String(ep.id));
    if (!pos || pos.duration <= 0) return null;
    const pct = pos.position / pos.duration;
    return pct >= 0.01 && pct <= 0.95 ? pct : null;
  }

  if (loading) {
    return (
      <div className="flex h-full min-h-screen items-center justify-center bg-[#0d0d14]">
        <LoadingSpinner text="Serie wird geladen..." size="lg" />
      </div>
    );
  }

  if (error || !series) {
    return (
      <div className="flex h-full min-h-screen flex-col items-center justify-center gap-4 bg-[#0d0d14]">
        <p className="text-red-400 text-lg">{error || "Serie nicht gefunden"}</p>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20 transition-colors"
        >
          <HiArrowLeft className="h-4 w-4" /> Zurück
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d14] text-white pb-8">
      {/* Backdrop hero */}
      <div className="relative h-[50vh] min-h-[320px] w-full">
        {backdropUrl && (
          <Image src={backdropUrl} alt={series.name} fill unoptimized className="object-cover" priority />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d14] via-[#0d0d14]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d14]/80 to-transparent" />
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors"
        >
          <HiArrowLeft className="h-5 w-5" />
        </button>
      </div>

      {/* Series info */}
      <div className="relative z-10 -mt-32 px-4 sm:px-8 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Cover poster */}
          {series.cover && (
            <div className="shrink-0 w-36 sm:w-44 self-start">
              <div className="relative aspect-[2/3] overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/10">
                <Image src={series.cover} alt={series.name} fill unoptimized className="object-cover" />
              </div>
            </div>
          )}

          {/* Details */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">{series.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-400">
              {series.rating && Number(series.rating) > 0 && (
                <span className="flex items-center gap-1 text-amber-400 font-medium">
                  <HiStar className="h-4 w-4" /> {Number(series.rating).toFixed(1)}
                </span>
              )}
              {year && <span>{year}</span>}
              {sortedSeasons.length > 0 && <span>{sortedSeasons.length} Staffeln</span>}
            </div>

            {genres.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {genres.map((g) => (
                  <span key={g} className="rounded-full bg-white/10 px-3 py-1 text-xs text-gray-300">{g}</span>
                ))}
              </div>
            )}

            {series.plot && (
              <div className="mt-4">
                <p className={clsx("text-sm text-gray-300 leading-relaxed", !plotExpanded && "line-clamp-3")}>
                  {series.plot}
                </p>
                {series.plot.length > 180 && (
                  <button onClick={() => setPlotExpanded((v) => !v)} className="mt-1 text-xs text-amber-400 hover:text-amber-300">
                    {plotExpanded ? "Weniger anzeigen" : "Mehr anzeigen"}
                  </button>
                )}
              </div>
            )}

            <div className="mt-4 space-y-1 text-sm text-gray-400">
              {series.cast && <p><span className="text-gray-500">Besetzung:</span> {series.cast}</p>}
              {series.director && <p><span className="text-gray-500">Regie:</span> {series.director}</p>}
            </div>

            <button
              onClick={handleToggleFavorite}
              className={clsx(
                "mt-4 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                favorited ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30" : "bg-white/10 text-gray-300 hover:bg-white/20"
              )}
            >
              {favorited ? <HiHeart className="h-5 w-5 text-amber-400" /> : <HiOutlineHeart className="h-5 w-5" />}
              {favorited ? "Favorit" : "Als Favorit"}
            </button>
          </div>
        </div>

        {/* Season selector */}
        {sortedSeasons.length > 0 && (
          <div className="mt-8 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {sortedSeasons.map((season) => (
              <button
                key={season.seasonNumber}
                onClick={() => setSelectedSeason(season.seasonNumber)}
                className={clsx(
                  "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap",
                  selectedSeason === season.seasonNumber
                    ? "bg-amber-500 text-black"
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                )}
              >
                Staffel {season.seasonNumber}
              </button>
            ))}
          </div>
        )}

        {/* Episode list */}
        <div className="mt-6 space-y-3">
          {episodes.length === 0 && (
            <p className="text-sm text-gray-500 py-4">Keine Episoden verfügbar.</p>
          )}
          {episodes.map((ep) => {
            const progress = getEpisodeProgress(ep);
            const thumb = ep.info.movieImage || series.cover;
            const duration = formatDuration(ep.info.duration);
            return (
              <div key={ep.id} className="group relative flex gap-4 rounded-xl bg-white/5 p-3 hover:bg-white/10 transition-colors overflow-hidden">
                {/* Episode number badge */}
                <div className="absolute top-3 left-3 z-10 flex h-6 w-6 items-center justify-center rounded-md bg-black/60 text-xs font-bold text-amber-400">
                  {ep.episodeNum}
                </div>

                {/* Thumbnail with play overlay */}
                <button onClick={() => handlePlay(ep)} className="relative shrink-0 w-36 sm:w-44 aspect-video rounded-lg overflow-hidden bg-white/5">
                  {thumb && <Image src={thumb} alt={ep.title} fill unoptimized className="object-cover" />}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                    <HiPlay className="h-10 w-10 text-white drop-shadow-lg" />
                  </div>
                  {progress !== null && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.round(progress * 100)}%` }} />
                    </div>
                  )}
                </button>

                {/* Episode info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    <h3 className="text-sm font-semibold text-white truncate">{ep.title}</h3>
                    <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                      {duration && (
                        <span className="flex items-center gap-1"><HiClock className="h-3.5 w-3.5" /> {duration}</span>
                      )}
                      {ep.info.rating && Number(ep.info.rating) > 0 && (
                        <span className="flex items-center gap-1 text-amber-400">
                          <HiStar className="h-3.5 w-3.5" /> {Number(ep.info.rating).toFixed(1)}
                        </span>
                      )}
                    </div>
                    {ep.info.plot && (
                      <p className="mt-1.5 text-xs text-gray-400 line-clamp-2 leading-relaxed">{ep.info.plot}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handlePlay(ep)}
                    className="mt-2 self-start flex items-center gap-1.5 rounded-md bg-amber-500/20 px-3 py-1.5 text-xs font-medium text-amber-400 hover:bg-amber-500/30 transition-colors"
                  >
                    <HiPlay className="h-3.5 w-3.5" /> {progress !== null ? "Fortsetzen" : "Abspielen"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
