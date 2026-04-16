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
  HiClock,
  HiBackward,
  HiForward,
} from "react-icons/hi2";
import { TbPictureInPicture, TbPictureInPictureOff } from "react-icons/tb";

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

function formatTime(t: number): string {
  if (!isFinite(t) || isNaN(t)) return "0:00";
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = Math.floor(t % 60);
  return h > 0 ? `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}` : `${m}:${s.toString().padStart(2, "0")}`;
}

type AspectRatio = "16:9" | "4:3" | "fill";

interface VideoPlayerProps {
  src: string;
  title?: string;
  contentType?: "live" | "movie" | "series";
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
  contentType = "live",
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
  const [swipeIndicator, setSwipeIndicator] = useState<{ type: "volume" | "brightness" | "seek"; value: number; label?: string } | null>(null);

  // Double-tap seek state
  const [doubleTapSide, setDoubleTapSide] = useState<"left" | "right" | null>(null);
  const doubleTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTapRef = useRef<{ time: number; x: number }>({ time: 0, x: 0 });

  // Playback speed
  const [playbackSpeed, setPlaybackSpeed] = useState(() => loadPref("playbackSpeed", 1));

  // PiP state
  const [isPiP, setIsPiP] = useState(false);

  // Sleep timer
  const [sleepTimer, setSleepTimer] = useState<number>(0); // minutes remaining
  const [showSleepMenu, setShowSleepMenu] = useState(false);
  const sleepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Touch gesture tracking - use refs for smooth performance (no re-renders during swipe)
  const touchRef = useRef<{
    startX: number; startY: number;
    startVol: number; startBright: number;
    startTime: number; // video currentTime at swipe start
    side: "left" | "right" | null;
    direction: "vertical" | "horizontal" | null;
    swiping: boolean;
    lastUpdate: number;
  }>({ startX: 0, startY: 0, startVol: 1, startBright: 1, startTime: 0, side: null, direction: null, swiping: false, lastUpdate: 0 });

  const isHLS = src.includes(".m3u8") || src.includes("m3u8");
  // Use contentType prop as source of truth - URL regex is unreliable for Xtream URLs
  const isVodContent = contentType === "movie" || contentType === "series" || /\.(mp4|mkv|avi|mov|wmv|flv|webm|ts)(\?|$)/i.test(src);
  // isLive is definitively false for movies/series - never hide seek bar for VOD
  const isLive = isVodContent ? false : (contentType === "live" || !duration || duration === Infinity);

  // Track pending play() promise to prevent AbortError
  const playPromiseRef = useRef<Promise<void> | null>(null);

  // Safe play function - waits for any pending play() to settle before calling new one
  const safePlay = useCallback(async (vid: HTMLVideoElement) => {
    // Wait for any pending play promise to settle
    if (playPromiseRef.current) {
      try { await playPromiseRef.current; } catch {}
    }
    const savedVol = userVolumeRef.current;
    vid.volume = savedVol;
    vid.muted = false;
    const promise = vid.play();
    playPromiseRef.current = promise;
    return promise.then(() => {
      vid.volume = savedVol;
      vid.muted = false;
      playPromiseRef.current = null;
    }).catch((err) => {
      playPromiseRef.current = null;
      // If AbortError, just ignore - it means a new play/load was called
      if (err?.name === "AbortError") return;
      // Autoplay blocked - try muted then unmute
      vid.muted = true;
      const p2 = vid.play();
      playPromiseRef.current = p2;
      return p2.then(() => {
        playPromiseRef.current = null;
        setTimeout(() => {
          vid.volume = savedVol;
          vid.muted = false;
        }, 100);
      }).catch(() => { playPromiseRef.current = null; });
    });
  }, []);

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

    // Save the user's volume BEFORE any destruction (in case events fire during cleanup)
    const savedVolume = userVolumeRef.current;

    // CRITICAL: Fully stop previous stream before starting new one
    // Pause first to prevent AbortError from pending play() promises
    video.pause();
    destroyHls();
    video.removeAttribute("src");
    video.load(); // Force browser to release previous connection

    // Restore volume ref in case load() triggered volumechange events
    userVolumeRef.current = savedVolume;

    // Delay to ensure previous connection is fully released by server
    // Xtream servers need time to drop the previous stream slot (456 error otherwise)
    const startTimer = setTimeout(() => {
      if (isHLS || isVodContent) {
        // ALWAYS use HLS.js for both live HLS and VOD content
        // Xtream servers often serve HLS even for .mp4 URLs (redirect to m3u8)
        // HLS.js handles this correctly, plus handles CORS via proxy
        tryHlsProxy(video);
      } else {
        setLoadingStatus("Lade Stream...");
        video.src = proxyUrl(src);
        video.onerror = () => {
          video.onerror = () => { video.onerror = null; setError("Stream konnte nicht geladen werden."); setIsBuffering(false); };
          video.src = src;
          if (autoPlay) safePlay(video);
        };
        if (autoPlay) safePlay(video);
      }
    }, 200);

    function tryHlsProxy(vid: HTMLVideoElement) {
      if (!Hls.isSupported()) {
        setLoadingStatus("Lade Stream (Safari)...");
        vid.src = proxyUrl(src);
        if (autoPlay) safePlay(vid);
        return;
      }

      setLoadingStatus("Lade Stream (HLS)...");
      const proxiedSrc = proxyUrl(src);

      const hls = new Hls({
        maxBufferLength: isVodContent ? 30 : 10,
        maxMaxBufferLength: isVodContent ? 120 : 30,
        maxBufferSize: isVodContent ? 100 * 1000 * 1000 : 30 * 1000 * 1000,
        maxBufferHole: 0.5,
        lowLatencyMode: !isVodContent,
        startFragPrefetch: !isVodContent, // Don't prefetch VOD to avoid 456
        enableWorker: true,
        fragLoadingTimeOut: isVodContent ? 30000 : 15000,
        manifestLoadingTimeOut: isVodContent ? 20000 : 10000,
        levelLoadingTimeOut: isVodContent ? 20000 : 10000,
        fragLoadingMaxRetry: isVodContent ? 6 : 4,
        manifestLoadingMaxRetry: 4,
        levelLoadingMaxRetry: 4,
        // Limit concurrent requests for VOD to avoid 456 max-connection errors
        maxLoadingDelay: isVodContent ? 4 : 1,
      });

      hls.loadSource(proxiedSrc);
      hls.attachMedia(vid);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsBuffering(false);
        setLoadingStatus("");
        const savedVol = userVolumeRef.current;
        vid.volume = savedVol;
        vid.muted = false;

        if (autoPlay) {
          safePlay(vid).then(() => {
            vid.volume = userVolumeRef.current;
            vid.muted = false;
          });
        }

        setAudioTracks(hls.audioTracks.map((t, i) => ({ id: i, name: t.name || `Track ${i + 1}`, lang: t.lang || "" })));
        setSubtitleTracks(hls.subtitleTracks.map((t, i) => ({ id: i, name: t.name || `Subtitle ${i + 1}`, lang: t.lang || "" })));
      });

      hls.on(Hls.Events.FRAG_LOADED, () => { setIsBuffering(false); setLoadingStatus(""); });

      let mediaRecoveryAttempts = 0;

      hls.on(Hls.Events.ERROR, (_event, data) => {
        const httpStatus = data.response?.code;
        const responseText = typeof data.response?.data === "string" ? data.response.data : "";
        const is456 = httpStatus === 456 || responseText.includes("STREAM_BLOCKED_456");
        const is458 = httpStatus === 458 || responseText.includes("MAX_CONNECTIONS_458");

        if (is456 || is458) {
          destroyHls();
          if (retryCountRef.current < 6) {
            retryCountRef.current++;
            const waitTime = Math.min(retryCountRef.current * 1500, 8000);
            setLoadingStatus(`Verbindung wird freigegeben (${retryCountRef.current}/6)...`);
            setTimeout(() => tryHlsProxy(vid), waitTime);
          } else {
            setError(is456
              ? "Stream blockiert (Fehler 456). Bitte prüfe dein Abo oder warte kurz."
              : "Maximale Verbindungen erreicht. Bitte warte kurz und versuche es erneut."
            );
            setIsBuffering(false);
          }
          return;
        }

        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              if (retryCountRef.current < 4) {
                retryCountRef.current++;
                setLoadingStatus(`Neuer Versuch (${retryCountRef.current}/4)...`);
                hls.startLoad();
              } else {
                setLoadingStatus("Versuche alternatives Format...");
                destroyHls();
                if (isVodContent) {
                  vid.src = src;
                  vid.onerror = () => {
                    vid.onerror = () => { vid.onerror = null; setError("Stream konnte nicht geladen werden."); setIsBuffering(false); };
                    vid.src = proxyUrl(src);
                    if (autoPlay) safePlay(vid);
                  };
                } else {
                  vid.src = proxyUrl(src);
                  vid.onerror = () => { vid.onerror = null; setError("Stream konnte nicht geladen werden."); setIsBuffering(false); };
                }
                if (autoPlay) safePlay(vid);
              }
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              mediaRecoveryAttempts++;
              if (mediaRecoveryAttempts <= 2) {
                setLoadingStatus("Medien-Fehler wird behoben...");
                hls.recoverMediaError();
              } else {
                setLoadingStatus("Versuche alternatives Codec...");
                hls.swapAudioCodec();
                hls.recoverMediaError();
                mediaRecoveryAttempts = 0;
              }
              break;
            default:
              destroyHls();
              if (isVodContent) {
                vid.src = src;
                vid.onerror = () => {
                  vid.onerror = () => { vid.onerror = null; setError("Stream konnte nicht geladen werden."); setIsBuffering(false); };
                  vid.src = proxyUrl(src);
                  if (autoPlay) safePlay(vid);
                };
              } else {
                vid.src = proxyUrl(src);
              }
              if (autoPlay) safePlay(vid);
              break;
          }
        } else if (!data.fatal && data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          setLoadingStatus("Verbindung wird wiederhergestellt...");
        }
      });

      hlsRef.current = hls;
    }

    return () => {
      clearTimeout(startTimer);
      destroyHls();
      if (video) video.onerror = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, autoPlay, isHLS, isVodContent, destroyHls, safePlay]);

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

  const programmaticVolumeRef = useRef(false);

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => {
      setIsPlaying(true); setIsBuffering(false); setLoadingStatus("");
      programmaticVolumeRef.current = true;
      video.volume = userVolumeRef.current;
      video.muted = false;
      programmaticVolumeRef.current = false;
    };
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => { setCurrentTime(video.currentTime); };
    const onDurationChange = () => setDuration(video.duration);
    const onWaiting = () => { setIsBuffering(true); setLoadingStatus("Buffering..."); };
    const onCanPlay = () => {
      setIsBuffering(false); setLoadingStatus("");
      programmaticVolumeRef.current = true;
      video.volume = userVolumeRef.current;
      video.muted = false;
      programmaticVolumeRef.current = false;
    };
    const onPlaying = () => { setIsBuffering(false); setLoadingStatus(""); };
    const onError = () => {};
    const onVolumeChange = () => {
      const vol = video.volume;
      const muted = video.muted;
      setVolume(vol);
      setIsMuted(muted);
      if (!programmaticVolumeRef.current) {
        userVolumeRef.current = vol;
        savePref("volume", vol);
      }
    };

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
    document.addEventListener("webkitfullscreenchange", onFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener("webkitfullscreenchange", onFsChange);
    };
  }, []);

  // Auto-fullscreen on mobile (Smarters/TiviMate-style)
  useEffect(() => {
    const isMobile = typeof window !== "undefined" && (
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      (window.innerWidth <= 768 && "ontouchstart" in window)
    );
    if (isMobile && containerRef.current && !document.fullscreenElement) {
      const timer = setTimeout(() => {
        containerRef.current?.requestFullscreen?.().catch(() => {});
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [src]);

  // Auto-hide controls - toggle on single tap (TiviMate-style)
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    setShowSettings(false);
    setShowSleepMenu(false);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => { if (isPlaying) setShowControls(false); }, 4000);
  }, [isPlaying]);

  const toggleControls = useCallback(() => {
    if (showControls) {
      setShowControls(false);
      setShowSettings(false);
      setShowSleepMenu(false);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    } else {
      resetHideTimer();
    }
  }, [showControls, resetHideTimer]);

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
        case " ": case "k": e.preventDefault(); video.paused ? safePlay(video) : video.pause(); resetHideTimer(); break;
        case "f": e.preventDefault(); toggleFullscreen(); break;
        case "m": e.preventDefault(); video.muted = !video.muted; break;
        case "arrowleft": e.preventDefault(); video.currentTime = Math.max(0, video.currentTime - 10); resetHideTimer(); break;
        case "arrowright": e.preventDefault(); video.currentTime = Math.min(duration, video.currentTime + 10); resetHideTimer(); break;
        case "arrowup": { e.preventDefault(); const nv = Math.min(1, video.volume + 0.1); video.volume = nv; userVolumeRef.current = nv; savePref("volume", nv); resetHideTimer(); break; }
        case "arrowdown": { e.preventDefault(); const nv = Math.max(0, video.volume - 0.1); video.volume = nv; userVolumeRef.current = nv; savePref("volume", nv); resetHideTimer(); break; }
        case "p": e.preventDefault(); togglePiP(); break;
        case "escape": if (isFullscreen) document.exitFullscreen(); break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [duration, isFullscreen, resetHideTimer]);

  const togglePlayPause = () => { const v = videoRef.current; if (v) v.paused ? safePlay(v) : v.pause(); };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    const doc = document as Document & { webkitFullscreenElement?: Element; webkitExitFullscreen?: () => void };
    const el = container as HTMLElement & { webkitRequestFullscreen?: () => void };
    if (document.fullscreenElement || doc.webkitFullscreenElement) {
      (document.exitFullscreen || doc.webkitExitFullscreen)?.call(document);
    } else {
      (container.requestFullscreen || el.webkitRequestFullscreen)?.call(container);
    }
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

  // Playback speed
  const cyclePlaybackSpeed = useCallback(() => {
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const idx = speeds.indexOf(playbackSpeed);
    const next = speeds[(idx + 1) % speeds.length];
    setPlaybackSpeed(next);
    savePref("playbackSpeed", next);
    const v = videoRef.current;
    if (v) v.playbackRate = next;
  }, [playbackSpeed]);

  // Apply playback speed when video loads
  useEffect(() => {
    const v = videoRef.current;
    if (v && !isLive && playbackSpeed !== 1) {
      v.playbackRate = playbackSpeed;
    } else if (v && isLive) {
      v.playbackRate = 1;
    }
  }, [src, isLive, playbackSpeed]);

  // PiP toggle
  const togglePiP = useCallback(async () => {
    const v = videoRef.current;
    if (!v) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await v.requestPictureInPicture();
      }
    } catch {}
  }, []);

  // PiP event listeners
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onEnterPiP = () => setIsPiP(true);
    const onLeavePiP = () => setIsPiP(false);
    v.addEventListener("enterpictureinpicture", onEnterPiP);
    v.addEventListener("leavepictureinpicture", onLeavePiP);
    return () => {
      v.removeEventListener("enterpictureinpicture", onEnterPiP);
      v.removeEventListener("leavepictureinpicture", onLeavePiP);
    };
  }, []);

  const retry = () => {
    setError(null);
    retryCountRef.current = 0;
    destroyHls();
    const video = videoRef.current;
    if (video) {
      video.removeAttribute("src");
      video.load();
      setTimeout(() => { video.src = proxyUrl(src); video.load(); safePlay(video); }, 300);
    }
  };


  // Double-tap to seek ±10s (like YouTube/premium players)
  const handleDoubleTap = useCallback((clientX: number) => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;
    const rect = container.getBoundingClientRect();
    const relX = clientX - rect.left;
    const side = relX < rect.width / 2 ? "left" : "right";

    if (side === "right") {
      video.currentTime = Math.min(video.duration || 0, video.currentTime + 10);
    } else {
      video.currentTime = Math.max(0, video.currentTime - 10);
    }
    setDoubleTapSide(side);
    if (doubleTapTimer.current) clearTimeout(doubleTapTimer.current);
    doubleTapTimer.current = setTimeout(() => setDoubleTapSide(null), 500);
  }, []);

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
      startTime: video ? video.currentTime : 0,
      side: relX < rect.width / 2 ? "left" : "right",
      direction: null,
      swiping: false, lastUpdate: 0,
    };
  }, [brightness]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const t = touchRef.current;
    const container = containerRef.current;
    if (!container) return;

    const deltaY = t.startY - touch.clientY;
    const deltaX = touch.clientX - t.startX;
    const absDeltaY = Math.abs(deltaY);
    const absDeltaX = Math.abs(deltaX);

    // Determine direction on first significant move
    if (!t.direction) {
      if (absDeltaX < 10 && absDeltaY < 10) return;
      t.direction = absDeltaX > absDeltaY ? "horizontal" : "vertical";
    }

    t.swiping = true;
    e.preventDefault();

    // Throttle to ~60fps for smoothness
    const now = performance.now();
    if (now - t.lastUpdate < 16) return;
    t.lastUpdate = now;

    const rect = container.getBoundingClientRect();

    if (t.direction === "horizontal" && !isLive) {
      // Horizontal swipe = seek (VOD only)
      const seekSensitivity = deltaX / rect.width;
      const video = videoRef.current;
      if (video && video.duration && isFinite(video.duration)) {
        const seekAmount = seekSensitivity * video.duration * 0.3; // 30% of duration per full swipe
        const newTime = Math.max(0, Math.min(video.duration, t.startTime + seekAmount));
        video.currentTime = newTime;
        const diff = newTime - t.startTime;
        const sign = diff >= 0 ? "+" : "";
        setSwipeIndicator({ type: "seek", value: newTime / video.duration, label: `${sign}${formatTime(Math.abs(diff))}` });
      }
    } else if (t.direction === "vertical") {
      // Vertical swipe = volume (right) or brightness (left)
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
    }
  }, [isLive]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const wasSwiping = touchRef.current.swiping;
    touchRef.current.swiping = false;
    touchRef.current.side = null;
    touchRef.current.direction = null;
    if (swipeIndicatorTimer.current) clearTimeout(swipeIndicatorTimer.current);
    swipeIndicatorTimer.current = setTimeout(() => setSwipeIndicator(null), 600);

    if (!wasSwiping && e.changedTouches.length > 0) {
      const touch = e.changedTouches[0];
      const now = Date.now();
      const last = lastTapRef.current;
      if (now - last.time < 300 && Math.abs(touch.clientX - last.x) < 50) {
        handleDoubleTap(touch.clientX);
        lastTapRef.current = { time: 0, x: 0 };
      } else {
        lastTapRef.current = { time: now, x: touch.clientX };
        toggleControls();
      }
    } else if (!wasSwiping) {
      toggleControls();
    }
  }, [toggleControls, handleDoubleTap]);

  // Sleep timer logic
  const startSleepTimer = useCallback((minutes: number) => {
    if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
    if (minutes <= 0) { setSleepTimer(0); setShowSleepMenu(false); return; }
    setSleepTimer(minutes);
    setShowSleepMenu(false);
    sleepTimerRef.current = setInterval(() => {
      setSleepTimer((prev) => {
        if (prev <= 1) {
          if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
          // Pause playback when timer expires
          const v = videoRef.current;
          if (v) v.pause();
          return 0;
        }
        return prev - 1;
      });
    }, 60000); // every minute
  }, []);

  useEffect(() => {
    return () => { if (sleepTimerRef.current) clearInterval(sleepTimerRef.current); };
  }, []);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const aspectClass = aspectRatio === "fill" ? "object-fill" : aspectRatio === "4:3" ? "object-contain max-w-[75%] mx-auto" : "object-contain";

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-black select-none group"
      onMouseMove={resetHideTimer}
      onClick={(e) => {
        if (e.target === e.currentTarget || (e.target as HTMLElement).tagName === "VIDEO") {
          toggleControls();
        }
      }}
      onDoubleClick={(e) => { handleDoubleTap(e.clientX); }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <video ref={videoRef} className={clsx("w-full h-full", aspectClass)} style={{ filter: `brightness(${brightness})` }} playsInline />

      {/* Double-tap seek ripple animation */}
      {doubleTapSide && (
        <div className={clsx(
          "absolute top-0 h-full w-1/2 z-20 pointer-events-none flex items-center",
          doubleTapSide === "right" ? "right-0 justify-center" : "left-0 justify-center"
        )}>
          <div className="flex flex-col items-center animate-ping-once">
            {doubleTapSide === "right" ? <HiForward className="h-10 w-10 text-white/80" /> : <HiBackward className="h-10 w-10 text-white/80" />}
            <span className="text-sm font-bold text-white/80 mt-1">10s</span>
          </div>
        </div>
      )}

      {/* Swipe gesture indicator - no transition for instant response */}
      {swipeIndicator && (
        <div className={clsx(
          "absolute z-30 flex flex-col items-center gap-2 bg-black/70 rounded-2xl backdrop-blur-sm",
          swipeIndicator.type === "seek"
            ? "top-1/3 left-1/2 -translate-x-1/2 px-5 py-3"
            : "top-1/2 -translate-y-1/2 px-3 py-4",
          swipeIndicator.type === "volume" && "right-6",
          swipeIndicator.type === "brightness" && "left-6"
        )}>
          {swipeIndicator.type === "seek" ? (
            <>
              <HiForward className="h-5 w-5 text-amber-400" />
              <span className="text-lg font-bold text-white tabular-nums">{swipeIndicator.label}</span>
            </>
          ) : (
            <>
              {swipeIndicator.type === "volume" ? <HiSpeakerWave className="h-5 w-5 text-white" /> : <HiSun className="h-5 w-5 text-yellow-400" />}
              <div className="w-1 h-24 bg-white/20 rounded-full relative overflow-hidden">
                <div className={clsx("absolute bottom-0 w-full rounded-full", swipeIndicator.type === "volume" ? "bg-amber-500" : "bg-yellow-400")}
                  style={{ height: `${swipeIndicator.value * 100}%` }} />
              </div>
              <span className="text-[10px] text-white font-medium">{Math.round(swipeIndicator.value * 100)}%</span>
            </>
          )}
        </div>
      )}

      {/* Buffering */}
      {isBuffering && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 pointer-events-none gap-3">
          <div className="w-10 h-10 border-3 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          {loadingStatus && <p className="text-xs text-white/70 font-medium">{loadingStatus}</p>}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-4">
          <p className="text-red-400 text-sm text-center px-8">{error}</p>
          <button onClick={(e) => { e.stopPropagation(); retry(); }}
            className="flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-sm text-white hover:bg-amber-500">
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
          {title && <h2 className="text-sm font-medium text-white truncate max-w-[40%] mx-auto">{title}</h2>}
          <div className="flex items-center gap-2">
            {/* Sleep timer */}
            <div className="relative">
              <button onClick={(e) => { e.stopPropagation(); setShowSleepMenu(!showSleepMenu); }}
                className={clsx("flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs hover:bg-white/20 h-10",
                  sleepTimer > 0 ? "bg-amber-500/30 text-amber-300" : "bg-white/10 text-white/80"
                )}>
                <HiClock className="h-4 w-4" />
                {sleepTimer > 0 && <span>{sleepTimer}m</span>}
              </button>
              {showSleepMenu && (
                <div className="absolute top-12 right-0 w-36 rounded-xl glass-panel overflow-hidden shadow-2xl z-40" onClick={(e) => e.stopPropagation()}>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider p-2.5 pb-1">Sleep Timer</p>
                  {[
                    { label: "Aus", min: 0 },
                    { label: "15 Min", min: 15 },
                    { label: "30 Min", min: 30 },
                    { label: "45 Min", min: 45 },
                    { label: "1 Std", min: 60 },
                    { label: "2 Std", min: 120 },
                  ].map((opt) => (
                    <button key={opt.min} onClick={() => startSleepTimer(opt.min)}
                      className={clsx("block w-full text-left text-sm py-2 px-3",
                        sleepTimer === opt.min ? "text-amber-400 bg-amber-500/10" : "text-gray-300 hover:bg-white/5"
                      )}>{opt.label}</button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={cycleAspectRatio} className="rounded-lg bg-white/10 px-2.5 py-1.5 text-xs text-white/80 hover:bg-white/20 h-10">
              {aspectRatio}
            </button>
          </div>
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
                    <div className="h-full rounded-full bg-amber-500" style={{ width: `${progressPercent}%` }} />
                  </div>
                </div>
                {/* Use duration as max, minimum 1 to ensure slider is always draggable */}
                <input type="range" min={0} max={duration > 0 ? duration : 1} step={0.1} value={currentTime} onChange={handleSeek}
                  className="absolute inset-0 w-full h-full appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-[14px] [&::-webkit-slider-thumb]:w-[14px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white" />
              </div>
              <span className="text-xs font-semibold text-white/90 w-12 tabular-nums">{duration > 0 ? formatTime(duration) : "--:--"}</span>
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
              {/* Skip backward for VOD */}
              {!isLive && (
                <button onClick={() => { const v = videoRef.current; if (v) v.currentTime = Math.max(0, v.currentTime - 10); }}
                  className="text-white/80 hover:text-white h-10 flex items-center justify-center gap-0.5 px-1" title="-10s">
                  <HiBackward className="h-5 w-5" />
                  <span className="text-[10px] font-semibold">10</span>
                </button>
              )}
              <button onClick={togglePlayPause} className="text-white/80 hover:text-white h-10 w-10 flex items-center justify-center">
                {isPlaying ? <HiPause className="h-5 w-5" /> : <HiPlay className="h-5 w-5" />}
              </button>
              {/* Skip forward for VOD */}
              {!isLive && (
                <button onClick={() => { const v = videoRef.current; if (v) v.currentTime = Math.min(v.duration || 0, v.currentTime + 10); }}
                  className="text-white/80 hover:text-white h-10 flex items-center justify-center gap-0.5 px-1" title="+10s">
                  <span className="text-[10px] font-semibold">10</span>
                  <HiForward className="h-5 w-5" />
                </button>
              )}
              <div className="flex items-center gap-1.5 group/vol">
                <button onClick={toggleMute} className="text-white/80 hover:text-white h-10 w-10 flex items-center justify-center">
                  {isMuted || volume === 0 ? <HiSpeakerXMark className="h-5 w-5" /> : <HiSpeakerWave className="h-5 w-5" />}
                </button>
                <input type="range" min={0} max={1} step={0.05} value={volume} onChange={handleVolumeChange}
                  className="w-0 group-hover/vol:w-20 transition-all duration-200 h-1.5 appearance-none bg-white/20 rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-[12px] [&::-webkit-slider-thumb]:w-[12px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Playback speed for VOD */}
              {!isLive && (
                <button onClick={cyclePlaybackSpeed}
                  className={clsx("rounded-lg px-2 py-1 text-xs font-bold h-8 min-w-[40px]",
                    playbackSpeed !== 1 ? "bg-amber-500/30 text-amber-300" : "bg-white/10 text-white/70 hover:bg-white/20"
                  )}>
                  {playbackSpeed}x
                </button>
              )}
              {/* PiP */}
              {typeof document !== "undefined" && document.pictureInPictureEnabled && (
                <button onClick={togglePiP} className="text-white/80 hover:text-white h-10 w-10 flex items-center justify-center" title="Bild-in-Bild">
                  {isPiP ? <TbPictureInPictureOff className="h-5 w-5" /> : <TbPictureInPicture className="h-5 w-5" />}
                </button>
              )}
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
                                selectedAudio === t.id ? "text-amber-400 bg-amber-500/10" : "text-gray-300 hover:bg-white/5"
                              )}>{t.name} {t.lang && `(${t.lang})`}</button>
                          ))}
                        </div>
                      )}
                      {subtitleTracks.length > 0 && (
                        <div className="p-2.5">
                          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Untertitel</p>
                          <button onClick={() => handleSubtitleTrack(-1)}
                            className={clsx("block w-full text-left text-sm py-1.5 px-2.5 rounded-lg",
                              selectedSubtitle === -1 ? "text-amber-400 bg-amber-500/10" : "text-gray-300 hover:bg-white/5"
                            )}>Aus</button>
                          {subtitleTracks.map((t) => (
                            <button key={t.id} onClick={() => handleSubtitleTrack(t.id)}
                              className={clsx("block w-full text-left text-sm py-1.5 px-2.5 rounded-lg",
                                selectedSubtitle === t.id ? "text-amber-400 bg-amber-500/10" : "text-gray-300 hover:bg-white/5"
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
