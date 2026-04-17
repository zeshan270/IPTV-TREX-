"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import clsx from "clsx";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { HiTv, HiStar, HiXMark, HiClock, HiPlay, HiArchiveBox, HiSignal } from "react-icons/hi2";
import { useAuthStore, usePlayerStore, useFavoritesStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { fetchLiveCategories, fetchLiveStreams, fetchFullEpg, buildStreamUrl, buildCatchupUrl } from "@/lib/api-client";
import type { Category, Channel, EpgProgram, XtreamCredentials } from "@/types";

// ==================== Constants ====================
const PX_PER_MS = 4 / 60000; // 4px per minute
const CHANNEL_COL = 160;
const ROW_H = 60;
const HOURS_RANGE = 3; // +/- from now (6h total)
const BATCH_SIZE = 8;

function getGridRange() {
  const now = Date.now();
  return { start: now - HOURS_RANGE * 3600000, end: now + HOURS_RANGE * 3600000 };
}
function fmtHour(ts: number) { return format(new Date(ts), "HH:mm"); }
function fmtRange(a: number, b: number) { return `${fmtHour(a)} - ${fmtHour(b)}`; }
function fmtDate(ts: number) { return format(new Date(ts), "EEEE, d. MMMM", { locale: de }); }

// ==================== Skeleton ====================
function SkeletonGrid() {
  return (
    <div className="flex flex-col">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="flex" style={{ height: ROW_H }}>
          <div className="flex-shrink-0 border-r border-b border-[#2a2a38] bg-[#0d0d14] flex items-center gap-2 px-2" style={{ width: CHANNEL_COL }}>
            <div className="h-8 w-8 rounded-md bg-[#1a1a26] animate-pulse" />
            <div className="h-3 w-16 rounded bg-[#1a1a26] animate-pulse" />
          </div>
          <div className="flex-1 flex gap-1 items-center px-1 border-b border-[#2a2a38]">
            {[1, 2, 3].map((j) => (
              <div key={j} className="h-10 rounded-md bg-[#1a1a26] animate-pulse" style={{ width: 80 + j * 60 }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ==================== Program Popup ====================
function ProgramPopup({ program, channel, onClose, onWatch, onCatchup }: {
  program: EpgProgram; channel: Channel; onClose: () => void; onWatch: () => void; onCatchup: () => void;
}) {
  const t = useT();
  const now = Date.now();
  const isLive = program.startTimestamp <= now && program.endTimestamp > now;
  const isPast = program.endTimestamp <= now;
  const showCatchup = isPast && program.hasArchive;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative w-full max-w-md rounded-2xl bg-[#181820] border border-[#2a2a38] shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-[#2a2a38]">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-1">
              {isLive && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />Live
                </span>
              )}
              {showCatchup && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                  <HiArchiveBox className="h-3 w-3" />Catchup
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-white leading-tight">{program.title || t("epg.noTitle")}</h3>
            <p className="text-sm text-gray-400 mt-1">{channel.name}</p>
          </div>
          <button onClick={onClose} className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
            <HiXMark className="h-5 w-5" />
          </button>
        </div>
        {/* Time */}
        <div className="px-4 py-3 border-b border-[#2a2a38] flex items-center gap-3 text-sm">
          <HiClock className="h-4 w-4 text-gray-500 flex-shrink-0" />
          <div>
            <p className="text-gray-300">{fmtRange(program.startTimestamp, program.endTimestamp)}</p>
            <p className="text-gray-500 text-xs mt-0.5">{fmtDate(program.startTimestamp)}</p>
          </div>
        </div>
        {/* Description */}
        {program.description && (
          <div className="px-4 py-3 border-b border-[#2a2a38]">
            <p className="text-sm text-gray-400 leading-relaxed line-clamp-6">{program.description}</p>
          </div>
        )}
        {/* Actions */}
        <div className="p-4 flex gap-2">
          {isLive && (
            <button onClick={onWatch} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all">
              <HiPlay className="h-5 w-5" />{t("epg.watchNow")}
            </button>
          )}
          {showCatchup && (
            <button onClick={onCatchup} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all">
              <HiArchiveBox className="h-5 w-5" />{t("epg.catchup")}
            </button>
          )}
          {!isLive && !showCatchup && (
            <button onClick={onWatch} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-[#2a2a38] px-4 py-3 text-sm font-medium text-gray-300 hover:bg-white/10 transition-all">
              <HiTv className="h-5 w-5" />{t("epg.goToChannel")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== Main Component ====================
export default function EpgPage() {
  const router = useRouter();
  const t = useT();
  const credentials = useAuthStore((s) => s.credentials);
  const setChannel = usePlayerStore((s) => s.setChannel);
  const setPlaylist = usePlayerStore((s) => s.setPlaylist);
  const { favorites } = useFavoritesStore();

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [useFavs, setUseFavs] = useState(true);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [epgData, setEpgData] = useState<Record<string, EpgProgram[]>>({});
  const [loadingChannels, setLoadingChannels] = useState(true);
  const [loadingEpg, setLoadingEpg] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<{ program: EpgProgram; channel: Channel } | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const dragOrigin = useRef({ x: 0, y: 0, sl: 0, st: 0 });

  const isXtream = credentials && "serverUrl" in credentials;
  const creds = isXtream ? (credentials as XtreamCredentials) : null;
  const { start: gridStart, end: gridEnd } = useMemo(getGridRange, []);
  const gridW = (gridEnd - gridStart) * PX_PER_MS;
  const nowPx = useMemo(() => (Date.now() - gridStart) * PX_PER_MS, [gridStart]);

  // Timeline 30-min slots
  const timeSlots = useMemo(() => {
    const slots: number[] = [];
    for (let t = Math.floor(gridStart / 1800000) * 1800000; t < gridEnd; t += 1800000) slots.push(t);
    return slots;
  }, [gridStart, gridEnd]);

  // Load categories
  useEffect(() => {
    if (creds) fetchLiveCategories(creds).then(setCategories).catch(() => {});
  }, [creds]);

  // Load channels
  useEffect(() => {
    if (!creds) return;
    if (useFavs) {
      const favCh: Channel[] = favorites.filter((f) => f.streamType === "live").map((f) => ({
        id: f.id, name: f.name, logo: f.logo || "", group: f.categoryId || "",
        url: buildStreamUrl(creds, Number(f.id), "live", "m3u8"),
        tvgId: "", tvgName: f.name, isLive: true, streamType: "live" as const, categoryId: f.categoryId || "",
      }));
      setChannels(favCh);
      setLoadingChannels(false);
      return;
    }
    if (!selectedCategory) {
      if (categories.length > 0) setSelectedCategory(categories[0].categoryId);
      return;
    }
    setLoadingChannels(true);
    fetchLiveStreams(creds, selectedCategory)
      .then((s) => { setChannels(s); setLoadingChannels(false); })
      .catch(() => setLoadingChannels(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creds, useFavs, selectedCategory, categories, favorites]);

  // Load EPG in batches
  useEffect(() => {
    if (!creds || channels.length === 0) return;
    setLoadingEpg(true);
    let cancelled = false;
    const acc: Record<string, EpgProgram[]> = {};
    (async () => {
      for (let i = 0; i < channels.length; i += BATCH_SIZE) {
        if (cancelled) return;
        const batch = channels.slice(i, i + BATCH_SIZE);
        const res = await Promise.all(
          batch.map((ch) => fetchFullEpg(creds!, Number(ch.id), 50).then((p) => ({ id: ch.id, p })).catch(() => ({ id: ch.id, p: [] as EpgProgram[] })))
        );
        if (cancelled) return;
        for (const { id, p } of res) acc[id] = p;
        setEpgData((prev) => ({ ...prev, ...acc }));
      }
      if (!cancelled) setLoadingEpg(false);
    })();
    return () => { cancelled = true; };
  }, [creds, channels]);

  // Scroll to now
  useEffect(() => {
    const c = scrollRef.current;
    if (!c) return;
    const t = setTimeout(() => { c.scrollLeft = Math.max(0, nowPx - c.clientWidth / 3); }, 100);
    return () => clearTimeout(t);
  }, [nowPx, channels.length]);

  // Drag scroll handlers
  const onDown = useCallback((e: React.MouseEvent) => {
    const c = scrollRef.current; if (!c) return;
    dragging.current = true;
    dragOrigin.current = { x: e.clientX, y: e.clientY, sl: c.scrollLeft, st: c.scrollTop };
    c.style.cursor = "grabbing"; c.style.userSelect = "none";
  }, []);
  const onMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return;
    const c = scrollRef.current; if (!c) return;
    c.scrollLeft = dragOrigin.current.sl - (e.clientX - dragOrigin.current.x);
    c.scrollTop = dragOrigin.current.st - (e.clientY - dragOrigin.current.y);
  }, []);
  const onUp = useCallback(() => {
    dragging.current = false;
    const c = scrollRef.current;
    if (c) { c.style.cursor = "grab"; c.style.userSelect = ""; }
  }, []);

  const goChannel = useCallback((ch: Channel) => {
    setChannel(ch); setPlaylist(channels);
    router.push(`/player/${ch.id}?type=live&url=${encodeURIComponent(ch.url)}&name=${encodeURIComponent(ch.name)}`);
  }, [router, setChannel, setPlaylist, channels]);

  const goCatchup = useCallback((ch: Channel, program: EpgProgram) => {
    if (!creds) return;
    const catchupUrl = buildCatchupUrl(creds, Number(ch.id), program.startTimestamp, program.endTimestamp);
    const name = `${ch.name} — ${program.title}`;
    router.push(`/player/${ch.id}?type=movie&url=${encodeURIComponent(catchupUrl)}&name=${encodeURIComponent(name)}`);
  }, [router, creds]);

  const visiblePrograms = useCallback((chId: string) => {
    const p = epgData[chId];
    return p ? p.filter((x) => x.endTimestamp > gridStart && x.startTimestamp < gridEnd) : [];
  }, [epgData, gridStart, gridEnd]);

  const hasFavs = favorites.some((f) => f.streamType === "live");

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-[#2a2a38] space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <HiTv className="h-5 w-5 text-amber-400" />
          <h1 className="text-lg font-bold text-white">{t("epg.title")}</h1>
          <span className="text-xs text-gray-500 ml-auto">{format(new Date(), "EEEE, d. MMM yyyy", { locale: de })}</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {hasFavs && (
            <button onClick={() => { setUseFavs(true); setSelectedCategory(null); }} className={clsx(
              "flex-shrink-0 flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-all whitespace-nowrap",
              useFavs ? "bg-gradient-to-r from-yellow-500 to-amber-500 text-black shadow-lg shadow-yellow-500/30" : "bg-[#181820] text-gray-300 border border-[#2a2a38] hover:border-amber-500/30"
            )}>
              <HiStar className="h-4 w-4" />{t("live.favorites")}
            </button>
          )}
          {categories.map((cat) => (
            <button key={cat.categoryId} onClick={() => { setUseFavs(false); setSelectedCategory(cat.categoryId); }} className={clsx(
              "flex-shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-all whitespace-nowrap",
              !useFavs && selectedCategory === cat.categoryId ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" : "bg-[#181820] text-gray-300 border border-[#2a2a38] hover:border-amber-500/30"
            )}>
              {cat.categoryName}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loadingChannels ? (
        <div className="flex-1 overflow-hidden p-4"><SkeletonGrid /></div>
      ) : channels.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <HiSignal className="h-16 w-16 text-gray-600 mb-4" />
          <p className="text-lg text-gray-400">{useFavs ? t("epg.noFavorites") : t("epg.noChannels")}</p>
        </div>
      ) : (
        <div className="flex-1 relative overflow-hidden">
          <div ref={scrollRef} className="h-full overflow-auto cursor-grab" onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}>
            <div className="relative" style={{ width: gridW + CHANNEL_COL, minHeight: channels.length * ROW_H + ROW_H }}>
              {/* Timeline header */}
              <div className="sticky top-0 z-30 flex" style={{ height: ROW_H }}>
                <div className="sticky left-0 z-40 flex-shrink-0 bg-[#0d0d14] border-b border-r border-[#2a2a38] flex items-end pb-2 px-3" style={{ width: CHANNEL_COL }}>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider hidden sm:block">{t("epg.channels")}</span>
                  <HiTv className="h-4 w-4 text-gray-500 sm:hidden" />
                </div>
                <div className="relative flex-1" style={{ width: gridW }}>
                  <div className="absolute inset-0 bg-[#0d0d14] border-b border-[#2a2a38]" />
                  {timeSlots.map((ts) => (
                    <div key={ts} className="absolute top-0 bottom-0 flex items-end pb-2 pl-2 border-l border-[#2a2a38]" style={{ left: (ts - gridStart) * PX_PER_MS }}>
                      <span className="text-xs text-gray-400 font-medium">{fmtHour(ts)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Channel rows */}
              {channels.map((ch) => {
                const progs = visiblePrograms(ch.id);
                const hasEpg = epgData[ch.id] !== undefined;
                return (
                  <div key={ch.id} className="flex" style={{ height: ROW_H }}>
                    {/* Channel label */}
                    <div className="sticky left-0 z-20 flex-shrink-0 bg-[#0d0d14] border-b border-r border-[#2a2a38] flex items-center gap-2 px-2 cursor-pointer hover:bg-[#181820] transition-colors group" style={{ width: CHANNEL_COL }} onClick={() => goChannel(ch)} title={ch.name}>
                      <div className="hidden sm:flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-[#1a1a26] overflow-hidden">
                        {ch.logo ? <Image src={ch.logo} alt="" width={32} height={32} className="object-contain" unoptimized /> : <HiTv className="h-4 w-4 text-gray-600" />}
                      </div>
                      <span className="text-xs sm:text-sm text-gray-300 truncate group-hover:text-amber-400 transition-colors font-medium">{ch.name}</span>
                    </div>
                    {/* Programs */}
                    <div className="relative flex-1 border-b border-[#2a2a38]" style={{ width: gridW }}>
                      {!hasEpg && loadingEpg && (
                        <div className="absolute inset-0 flex items-center px-2"><div className="h-10 w-full rounded-md bg-[#1a1a26] animate-pulse" /></div>
                      )}
                      {hasEpg && progs.length === 0 && (
                        <div className="absolute inset-0 flex items-center px-2"><span className="text-xs text-gray-600 italic">{t("epg.noEpg")}</span></div>
                      )}
                      {progs.map((pg) => {
                        const now = Date.now();
                        const live = pg.startTimestamp <= now && pg.endTimestamp > now;
                        const past = pg.endTimestamp <= now;
                        const l = (Math.max(pg.startTimestamp, gridStart) - gridStart) * PX_PER_MS;
                        const w = (Math.min(pg.endTimestamp, gridEnd) - Math.max(pg.startTimestamp, gridStart)) * PX_PER_MS;
                        if (w < 2) return null;
                        return (
                          <div
                            key={pg.id || `${pg.channelId}-${pg.startTimestamp}`}
                            className={clsx(
                              "absolute top-1 bottom-1 rounded-md px-2 flex items-center overflow-hidden cursor-pointer transition-all border border-transparent hover:border-amber-500/50 hover:brightness-125",
                              live ? "bg-amber-500/15 text-amber-200" : past ? "bg-[#15151f] text-gray-500" : "bg-[#1a1a26] text-gray-300"
                            )}
                            style={{ left: l, width: w }}
                            onClick={(e) => { e.stopPropagation(); if (!dragging.current) setSelectedProgram({ program: pg, channel: ch }); }}
                            title={`${pg.title}\n${fmtRange(pg.startTimestamp, pg.endTimestamp)}`}
                          >
                            {live && <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-amber-400 mr-1.5 animate-pulse" />}
                            {past && pg.hasArchive && w > 60 && <HiArchiveBox className="flex-shrink-0 h-3 w-3 text-blue-400 mr-1" />}
                            <span className="text-xs truncate font-medium leading-tight">{pg.title || "..."}</span>
                            {w > 120 && <span className="ml-auto flex-shrink-0 text-[10px] text-gray-500 pl-1">{fmtHour(pg.startTimestamp)}</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Current time marker */}
              <div className="absolute z-10 pointer-events-none" style={{ left: CHANNEL_COL + nowPx, top: 0, bottom: 0, width: 2 }}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-3 w-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50" />
                <div className="h-full w-full bg-red-500/80" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Program popup */}
      {selectedProgram && (
        <ProgramPopup
          program={selectedProgram.program}
          channel={selectedProgram.channel}
          onClose={() => setSelectedProgram(null)}
          onWatch={() => { setSelectedProgram(null); goChannel(selectedProgram.channel); }}
          onCatchup={() => { setSelectedProgram(null); goCatchup(selectedProgram.channel, selectedProgram.program); }}
        />
      )}
    </div>
  );
}
