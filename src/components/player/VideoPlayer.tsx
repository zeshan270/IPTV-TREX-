"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Hls from "hls.js";
import clsx from "clsx";
import {
  HiPlay,
  HiPause,
  HiSpeakerWave,
  HiSpeakerXMark,
  HiArrowsPointingOut,
  HiArrowsPointingIn,
  HiChevronUp,
  HiChevronDown,
  HiArrowPath,
  HiCog6Tooth,
  HiSun,
} from "react-icons/hi2";

// Persist player preferences
function loadPref<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const v = localStorage.getItem(`iptv-trex-${key}`);
  if (v === null) return fallback;
  return JSON.parse(v) as T;
}
function savePref(key: string, value: unknown) {
  if (typeof window !== "undefined") localStorage.setItem(`iptv-trex-${key}`, JSON.stringify(value));
}

type AspectRatio = "16:9" | "4:3" | "fill";

interface VideoPlayerProps {
  src: string;
  title?: string;
  initialPosition?: number;
  onChannelNext?: () => void;
  onChannelPrev?: () => void;
  onBack?: () => void;
  onPositionChange?: (position: number, duration: number) => void;
  autoPlay?: boolean;
}

/**
 * Build a proxied URL to bypass CORS/mixed-content for IPTV streams.
 */
function proxyUrl(url: string): string {
  const trimmed = url.trim();
  if (typeof window === "undefined") return trimmed;
  if (trimmed.startsWith("/")) return trimmed;
  try {
    const parsed = new URL(trimmed);
    if (parsed.origin === window.location.origin) return trimmed;
  } catch {}
  return `/api/proxy?url=${encodeURIComponent(trimmed)}`;
}

export default function VideoPlayer({
  src,
  title,
  initialPosition,
  onChannelNext,
  onChannelPrev,
  onBack,
  onPositionChange,
  autoPlay = true,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const positionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const initialSeekDoneRef = useRef(false);
  const retryCountRef = useRef(0);
  const swipeIndicatorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(() => loadPref("volume", 1));
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(() => loadPref("aspectRatio", "16:9"));
  const [audioTracks, setAudioTracks] = useState<{ id: number; name: string; lang: string }[]>([]);
  const [subtitleTracks, setSubtitleTracks] = useState<{ id: number; name: string; lang: string }[]>([]);
  const [selectedAudio, setSelectedAudio] = useState(0);
  const [selectedSubtitle, setSelectedSubtitle] = useState(-1);
  const [showSettings, setShowSettings] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("Verbinde...");
  const [brightness, setBrightness] = useState(() => loadPref("brightness", 1));
  const [swipeIndicator, setSwipeIndicator] = useState<{ type: "volume" | "brightness"; value: number } | null>(null);

  // Touch gesture tracking - use refs for smooth performance (no re-renders during swipe)
  const touchRef = useRef<{
    startX: number; startY: number;
    startVol: number; startBright: number;
    side: "left" | "right" | null;
    swiping: boolean;
    lastUpdate: number;
  }>({ startX: 0, startY: 0, startVol: 1, startBright: 1, side: null, swiping: false, lastUpdate: 0 });

  const isHLS = src.includes(".m3u8") || src.includes("m3u8");
  const isLive = !duration || duration === Infinity;

  // Properly destroy HLS instance and stop all network activity
  const destroyHls = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.stopLoad();
      hlsRef.current.detachMedia();
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  }, []);

  // Initialize player
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    setError(null);
    setIsBuffering(true);
    setLoadingStatus("Verbinde...");
    initialSeekDoneRef.current = false;
    retryCountRef.current = 0;

    // CRITICAL: Fully stop previous stream before starting new one
    destroyHls();
    video.removeAttribute("src");
    video.load(); // Force browser to release previous connection

    // Small delay to ensure previous connection is fully released
    const startTimer = setTimeout(() => {
      if (isHLS) {
        tryHlsProxy(video);
      } else {
        setLoadingStatus("Lade Stream...");
        video.src = proxyUrl(src);
        video.onerror = () => {
          video.onerror = () => { video.onerror = null; setError("Stream konnte nicht geladen werden."); setIsBuffering(false); };
          video.src = src;
          if (autoPlay) video.play().catch(() => {});
        };
        if (autoPlay) video.play().catch(() => {});
      }
    }, 200);

    function tryHlsProxy(vid: HTMLVideoElement) {
      if (!Hls.isSupported()) {
        setLoadingStatus("Lade Stream (Safari)...");
        vid.src = proxyUrl(src);
        if (autoPlay) vid.play().catch(() => {});
        return;
      }

      setLoadingStatus("Lade Stream (HLS)...");
      const proxiedSrc = proxyUrl(src);

      const hls = new Hls({
        maxBufferLength: 10,
        maxMaxBufferLength: 30,
        maxBufferSize: 30 * 1000 * 1000,
        maxBufferHole: 0.5,
        lowLatencyMode: true,
        startFragPrefetch: true,
        enableWorker: true,
        fragLoadingTimeOut: 15000,
        manifestLoadingTimeOut: 10000,
        levelLoadingTimeOut: 10000,
        fragLoadingMaxRetry: 4,
        manifestLoadingMaxRetry: 4,
        levelLoadingMaxRetry: 4,
      });

      hls.loadSource(proxiedSrc);
      hls.attachMedia(vid);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsBuffering(false);
        setLoadingStatus("");
        // Restore user volume after HLS re-attaches media
        vid.volume = userVolumeRef.current;
        vid.muted = false;
        if (autoPlay) vid.play().catch(() => {});

        setAudioTracks(hls.audioTracks.map((t, i) => ({ id: i, name: t.name || `Track ${i + 1}`, lang: t.lang || "" })));
        setSubtitleTracks(hls.subtitleTracks.map((t, i) => ({ id: i, name: t.name || `Subtitle ${i + 1}`, lang: t.lang || "" })));
      });

      hls.on(Hls.Events.FRAG_LOADED, () => { setIsBuffering(false); setLoadingStatus(""); });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        const httpStatus = data.response?.code;
        if (httpStatus === 456) {
          destroyHls();
          setError("Stream blockiert (Fehler 456). Bitte prüfe dein Abo.");
          setIsBuffering(false);
          return;
        }
        if (httpStatus === 458) {
          // Don't show max connections as fatal - auto-retry after cleanup
          destroyHls();
          if (retryCountRef.current < 2) {
            retryCountRef.current++;
            setLoadingStatus(`Verbindung wird freigegeben (${retryCountRef.current}/2)...`);
            setTimeout(() => tryHlsProxy(vid), 1500);
          } else {
            setError("Maximale Verbindungen erreicht. Bitte warte kurz und versuche es erneut.");
            setIsBuffering(false);
          }
          return;
        }

        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              if (retryCountRef.current < 3) {
                retryCountRef.current++;
                setLoadingStatus(`Neuer Versuch (${retryCountRef.current}/3)...`);
                hls.startLoad();
              } else {
                setLoadingStatus("Versuche alternatives Format...");
                destroyHls();
                vid.src = proxyUrl(src);
                vid.onerror = () => {
                  vid.onerror = null;
                  setError("Stream konnte nicht geladen werden.");
                  setIsBuffering(false);
                };
                if (autoPlay) vid.play().catch(() => {});
              }
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              destroyHls();
              vid.src = proxyUrl(src);
              if (autoPlay) vid.play().catch(() => {});
              break;
          }
        }
      });

      hlsRef.current = hls;
    }

    return () => {
      clearTimeout(startTimer);
      destroyHls();
      if (video) video.onerror = null;
    };
  }, [src, autoPlay, isHLS, destroyHls]);

  // Seek to initial position
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !initialPosition || initialSeekDoneRef.current) return;
    const handleCanPlay = () => {
      if (!initialSeekDoneRef.current && initialPosition > 0) { video.currentTime = initialPosition; initialSeekDoneRef.current = true; }
    };
    video.addEventListener("canplay", handleCanPlay);
    if (video.readyState >= 3 && !initialSeekDoneRef.current && initialPosition > 0) { video.currentTime = initialPosition; initialSeekDoneRef.current = true; }
    return () => video.removeEventListener("canplay", handleCanPlay);
  }, [initialPosition, src]);

  // Position save interval
  useEffect(() => {
    if (!onPositionChange) return;
    positionIntervalRef.current = setInterval(() => {
      const video = videoRef.current;
      if (video && !video.paused && isFinite(video.currentTime) && video.currentTime > 0) onPositionChange(video.currentTime, video.duration || 0);
    }, 5000);
    return () => { if (positionIntervalRef.current) clearInterval(positionIntervalRef.current); };
  }, [onPositionChange]);

  // Save position on unmount
  useEffect(() => {
    return () => {
      const video = videoRef.current;
      if (video && onPositionChange && isFinite(video.currentTime) && video.currentTime > 0) onPositionChange(video.currentTime, video.duration || 0);
    };
  }, [onPositionChange]);

  // Ref to track user-intended volume (never overwritten by browser resets)
  const userVolumeRef = useRef(loadPref("volume", 1));

  // Force-apply saved volume to video element
  const applyVolume = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const vol = userVolumeRef.current;
    video.volume = vol;
    video.muted = false;
    setVolume(vol);
    setIsMuted(false);
  }, []);

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPlay = () => {
      setIsPlaying(true); setIsBuffering(false); setLoadingStatus("");
      // Always restore volume when playback starts (fixes autoplay muting)
      applyVolume();
    };
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onDurationChange = () => setDuration(video.duration);
    const onWaiting = () => { setIsBuffering(true); setLoadingStatus("Buffering..."); };
    const onCanPlay = () => { setIsBuffering(false); setLoadingStatus(""); };
    const onPlaying = () => {
      setIsBuffering(false); setLoadingStatus("");
      // Double-check volume on playing event too
      applyVolume();
    };
    const onError = () => {};
    const onVolumeChange = () => {
      // Only save volume if it's a real user change (not a browser reset to 0)
      const vol = video.volume;
      const muted = video.muted;
      setVolume(vol);
      setIsMuted(muted);
      // Only persist if volume > 0 or user explicitly set it to 0
      if (vol > 0) {
        userVolumeRef.current = vol;
        savePref("volume", vol);
      }
    };

    // Restore persisted volume
    applyVolume();

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("durationchange", onDurationChange);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("error", onError);
    video.addEventListener("volumechange", onVolumeChange);
    return () => {
      video.removeEventListener("play", onPlay); video.removeEventListener("pause", onPause);
      video.removeEventListener("timeupdate", onTimeUpdate); video.removeEventListener("durationchange", onDurationChange);
      video.removeEventListener("waiting", onWaiting); video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("playing", onPlaying); video.removeEventListener("error", onError);
      video.removeEventListener("volumechange", onVolumeChange);
    };
  }, [applyVolume]);

  // Fullscreen change + orientation lock
  useEffect(() => {
    const onFsChange = () => {
      const fs = !!document.fullscreenElement;
      setIsFullscreen(fs);
      // Try to lock to landscape in fullscreen for better viewing
      try {
        const ori = screen.orientation as unknown as { lock?: (o: string) => Promise<void>; unlock?: () => void };
        if (fs && ori.lock) {
          ori.lock("landscape").catch(() => {});
        } else if (!fs && ori.unlock) {
          ori.unlock();
        }
      } catch {}
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // Auto-hide controls
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => { if (isPlaying) setShowControls(false); }, 3000);
  }, [isPlaying]);

  useEffect(() => {
    resetHideTimer();
    return () => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current); };
  }, [isPlaying, resetHideTimer]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const video = videoRef.current;
      if (!video) return;
      switch (e.key.toLowerCase()) {
        case " ": case "k": e.preventDefault(); video.paused ? video.play() : video.pause(); resetHideTimer(); break;
        case "f": e.preventDefault(); toggleFullscreen(); break;
        case "m": e.preventDefault(); video.muted = !video.muted; break;
        case "arrowleft": e.preventDefault(); video.currentTime = Math.max(0, video.currentTime - 10); resetHideTimer(); break;
        case "arrowright": e.preventDefault(); video.currentTime = Math.min(duration, video.currentTime + 10); resetHideTimer(); break;
        case "arrowup": e.preventDefault(); video.volume = Math.min(1, video.volume + 0.1); resetHideTimer(); break;
        case "arrowdown": e.preventDefault(); video.volume = Math.max(0, video.volume - 0.1); resetHideTimer(); break;
        case "escape": if (isFullscreen) document.exitFullscreen(); break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [duration, isFullscreen, resetHideTimer]);

  const togglePlayPause = () => { const v = videoRef.current; if (v) v.paused ? v.play() : v.pause(); };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    document.fullscreenElement ? document.exitFullscreen() : container.requestFullscreen();
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    if (!v.muted) {
      // When unmuting, ensure volume is restored
      v.volume = userVolumeRef.current;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => { const v = videoRef.current; if (v) v.currentTime = Number(e.target.value); };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const newVol = Number(e.target.value);
    v.volume = newVol;
    v.muted = false;
    userVolumeRef.current = newVol;
    setVolume(newVol);
    setIsMuted(false);
    savePref("volume", newVol);
  };

  const cycleAspectRatio = () => {
    const ratios: AspectRatio[] = ["16:9", "4:3", "fill"];
    const next = ratios[(ratios.indexOf(aspectRatio) + 1) % ratios.length];
    setAspectRatio(next);
    savePref("aspectRatio", next);
  };

  const handleAudioTrack = (id: number) => { if (hlsRef.current) { hlsRef.current.audioTrack = id; setSelectedAudio(id); } setShowSettings(false); };
  const handleSubtitleTrack = (id: number) => { if (hlsRef.current) { hlsRef.current.subtitleTrack = id; setSelectedSubtitle(id); } setShowSettings(false); };

  const retry = () => {
    setError(null);
    retryCountRef.current = 0;
    destroyHls();
    const video = videoRef.current;
    if (video) {
      video.removeAttribute("src");
      video.load();
      setTimeout(() => { video.src = proxyUrl(src); video.load(); video.play().catch(() => {}); }, 300);
    }
  };

  const formatTime = (t: number) => {
    if (!isFinite(t) || isNaN(t)) return "0:00";
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = Math.floor(t % 60);
    return h > 0 ? `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}` : `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Smooth touch gesture handlers - read from video element directly for sync
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const relX = touch.clientX - rect.left;
    touchRef.current = {
      startX: touch.clientX, startY: touch.clientY,
      startVol: video ? video.volume : 1,
      startBright: brightness,
      side: relX < rect.width / 2 ? "left" : "right",
      swiping: false, lastUpdate: 0,
    };
  }, [brightness]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const t = touchRef.current;
    const container = containerRef.current;
    if (!container) return;

    const deltaY = t.startY - touch.clientY;
    const deltaX = Math.abs(touch.clientX - t.startX);
    if (Math.abs(deltaY) < 10 || deltaX > Math.abs(deltaY)) return;

    t.swiping = true;
    e.preventDefault();

    // Throttle to ~60fps for smoothness
    const now = performance.now();
    if (now - t.lastUpdate < 16) return;
    t.lastUpdate = now;

    const rect = container.getBoundingClientRect();
    const sensitivity = deltaY / (rect.height * 0.5);

    if (t.side === "right") {
      const newVol = Math.max(0, Math.min(1, t.startVol + sensitivity));
      const video = videoRef.current;
      if (video) {
        video.volume = newVol;
        video.muted = false;
        userVolumeRef.current = newVol;
        setVolume(newVol);
        setIsMuted(false);
        savePref("volume", newVol);
      }
      setSwipeIndicator({ type: "volume", value: newVol });
    } else {
      const newBright = Math.max(0.1, Math.min(1, t.startBright + sensitivity));
      setBrightness(newBright);
      savePref("brightness", newBright);
      setSwipeIndicator({ type: "brightness", value: newBright });
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    const wasSwiping = touchRef.current.swiping;
    touchRef.current.swiping = false;
    touchRef.current.side = null;
    if (swipeIndicatorTimer.current) clearTimeout(swipeIndicatorTimer.current);
    swipeIndicatorTimer.current = setTimeout(() => setSwipeIndicator(null), 600);
    if (!wasSwiping) resetHideTimer();
  }, [resetHideTimer]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const aspectClass = aspectRatio === "fill" ? "object-fill" : aspectRatio === "4:3" ? "object-contain max-w-[75%] mx-auto" : "object-contain";

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-black select-none group"
      onMouseMove={resetHideTimer}
      onClick={() => { if (!showSettings) resetHideTimer(); }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <video ref={videoRef} className={clsx("w-full h-full", aspectClass)} style={{ filter: `brightness(${brightness})` }} playsInline />

      {/* Swipe gesture indicator - no transition for instant response */}
      {swipeIndicator && (
        <div className={clsx(
          "absolute top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-2 bg-black/70 rounded-2xl px-3 py-4 backdrop-blur-sm",
          swipeIndicator.type === "volume" ? "right-6" : "left-6"
        )}>
          {swipeIndicator.type === "volume" ? <HiSpeakerWave className="h-5 w-5 text-white" /> : <HiSun className="h-5 w-5 text-yellow-400" />}
          <div className="w-1 h-24 bg-white/20 rounded-full relative overflow-hidden">
            <div className={clsx("absolute bottom-0 w-full rounded-full", swipeIndicator.type === "volume" ? "bg-indigo-500" : "bg-yellow-400")}
              style={{ height: `${swipeIndicator.value * 100}%` }} />
          </div>
          <span className="text-[10px] text-white font-medium">{Math.round(swipeIndicator.value * 100)}%</span>
        </div>
      )}

      {/* Buffering */}
      {isBuffering && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 pointer-events-none gap-3">
          <div className="w-10 h-10 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          {loadingStatus && <p className="text-xs text-white/70 font-medium">{loadingStatus}</p>}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-4">
          <p className="text-red-400 text-sm text-center px-8">{error}</p>
          <button onClick={(e) => { e.stopPropagation(); retry(); }}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm text-white hover:bg-indigo-500">
            <HiArrowPath className="h-4 w-4" /> Erneut versuchen
          </button>
        </div>
      )}

      {/* Controls overlay */}
      <div className={clsx("absolute inset-0 flex flex-col justify-between transition-opacity duration-300 pointer-events-none", showControls ? "opacity-100" : "opacity-0")}
        onClick={(e) => e.stopPropagation()}>

        {/* Top bar */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-b from-black/70 to-transparent pointer-events-auto">
          {onBack && (
            <button onClick={onBack} className="flex items-center text-sm text-white/80 hover:text-white h-10 px-3 rounded-lg bg-white/10">
              Zurück
            </button>
          )}
          {title && <h2 className="text-sm font-medium text-white truncate max-w-[50%] mx-auto">{title}</h2>}
          <button onClick={cycleAspectRatio} className="rounded-lg bg-white/10 px-2.5 py-1.5 text-xs text-white/80 hover:bg-white/20 h-10">
            {aspectRatio}
          </button>
        </div>

        {/* Center controls - minimalistic */}
        <div className="flex items-center justify-center gap-6 pointer-events-auto">
          {onChannelPrev && (
            <button onClick={onChannelPrev} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20">
              <HiChevronUp className="h-5 w-5" />
            </button>
          )}
          <button onClick={togglePlayPause} className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 shadow-xl">
            {isPlaying ? <HiPause className="h-8 w-8" /> : <HiPlay className="h-8 w-8 ml-0.5" />}
          </button>
          {onChannelNext && (
            <button onClick={onChannelNext} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20">
              <HiChevronDown className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Bottom bar */}
        <div className="p-3 bg-gradient-to-t from-black/70 to-transparent pointer-events-auto">
          {!isLive && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-white/90 w-12 text-right tabular-nums">{formatTime(currentTime)}</span>
              <div className="relative flex-1 h-[14px] flex items-center group/seek">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-[4px] rounded-full bg-white/20 group-hover/seek:h-[8px] transition-all">
                    <div className="h-full rounded-full bg-indigo-500" style={{ width: `${progressPercent}%` }} />
                  </div>
                </div>
                <input type="range" min={0} max={duration || 0} value={currentTime} onChange={handleSeek}
                  className="absolute inset-0 w-full h-full appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-[14px] [&::-webkit-slider-thumb]:w-[14px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white" />
              </div>
              <span className="text-xs font-semibold text-white/90 w-12 tabular-nums">{formatTime(duration)}</span>
            </div>
          )}

          {isLive && (
            <div className="flex items-center gap-1.5 mb-2">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-medium text-red-400">LIVE</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={togglePlayPause} className="text-white/80 hover:text-white h-10 w-10 flex items-center justify-center">
                {isPlaying ? <HiPause className="h-5 w-5" /> : <HiPlay className="h-5 w-5" />}
              </button>
              <div className="flex items-center gap-1.5 group/vol">
                <button onClick={toggleMute} className="text-white/80 hover:text-white h-10 w-10 flex items-center justify-center">
                  {isMuted || volume === 0 ? <HiSpeakerXMark className="h-5 w-5" /> : <HiSpeakerWave className="h-5 w-5" />}
                </button>
                <input type="range" min={0} max={1} step={0.05} value={volume} onChange={handleVolumeChange}
                  className="w-0 group-hover/vol:w-20 transition-all duration-200 h-1.5 appearance-none bg-white/20 rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-[12px] [&::-webkit-slider-thumb]:w-[12px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              {(audioTracks.length > 1 || subtitleTracks.length > 0) && (
                <div className="relative">
                  <button onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }}
                    className="text-white/80 hover:text-white h-10 w-10 flex items-center justify-center">
                    <HiCog6Tooth className="h-5 w-5" />
                  </button>
                  {showSettings && (
                    <div className="absolute bottom-12 right-0 w-56 rounded-xl glass-panel overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
                      {audioTracks.length > 1 && (
                        <div className="p-2.5 border-b border-white/10">
                          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Audio</p>
                          {audioTracks.map((t) => (
                            <button key={t.id} onClick={() => handleAudioTrack(t.id)}
                              className={clsx("block w-full text-left text-sm py-1.5 px-2.5 rounded-lg",
                                selectedAudio === t.id ? "text-indigo-400 bg-indigo-500/10" : "text-gray-300 hover:bg-white/5"
                              )}>{t.name} {t.lang && `(${t.lang})`}</button>
                          ))}
                        </div>
                      )}
                      {subtitleTracks.length > 0 && (
                        <div className="p-2.5">
                          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Untertitel</p>
                          <button onClick={() => handleSubtitleTrack(-1)}
                            className={clsx("block w-full text-left text-sm py-1.5 px-2.5 rounded-lg",
                              selectedSubtitle === -1 ? "text-indigo-400 bg-indigo-500/10" : "text-gray-300 hover:bg-white/5"
                            )}>Aus</button>
                          {subtitleTracks.map((t) => (
                            <button key={t.id} onClick={() => handleSubtitleTrack(t.id)}
                              className={clsx("block w-full text-left text-sm py-1.5 px-2.5 rounded-lg",
                                selectedSubtitle === t.id ? "text-indigo-400 bg-indigo-500/10" : "text-gray-300 hover:bg-white/5"
                              )}>{t.name} {t.lang && `(${t.lang})`}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              <button onClick={toggleFullscreen} className="text-white/80 hover:text-white h-10 w-10 flex items-center justify-center">
                {isFullscreen ? <HiArrowsPointingIn className="h-5 w-5" /> : <HiArrowsPointingOut className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
