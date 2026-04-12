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
} from "react-icons/hi2";

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
 * Build a proxied URL to bypass CORS for IPTV streams.
 */
function proxyUrl(url: string): string {
  return `/api/proxy?url=${encodeURIComponent(url)}`;
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

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [audioTracks, setAudioTracks] = useState<{ id: number; name: string; lang: string }[]>([]);
  const [subtitleTracks, setSubtitleTracks] = useState<{ id: number; name: string; lang: string }[]>([]);
  const [selectedAudio, setSelectedAudio] = useState(0);
  const [selectedSubtitle, setSelectedSubtitle] = useState(-1);
  const [showSettings, setShowSettings] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("Verbinde...");

  const isHLS = src.includes(".m3u8");
  const isLive = !duration || duration === Infinity;

  // Initialize player
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    setError(null);
    setIsBuffering(true);
    setLoadingStatus("Verbinde...");
    initialSeekDoneRef.current = false;
    retryCountRef.current = 0;

    const destroyHls = () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };

    destroyHls();

    // Strategy 1: Try direct video.src first (works for .ts and sometimes .m3u8 without CORS)
    // Strategy 2: Use HLS.js with proxy for .m3u8
    // Strategy 3: Fallback .ts format with proxy

    const tryDirectPlay = () => {
      setLoadingStatus("Lade Stream...");
      video.src = src;
      if (autoPlay) video.play().catch(() => {});
    };

    const tryHlsProxy = () => {
      if (!Hls.isSupported()) {
        // Safari native HLS - try direct first, then proxy
        setLoadingStatus("Lade Stream (Safari)...");
        video.src = src;
        if (autoPlay) video.play().catch(() => {
          // Try proxy
          video.src = proxyUrl(src);
          video.play().catch(() => {});
        });
        return;
      }

      setLoadingStatus("Lade Stream (HLS)...");
      const hls = new Hls({
        maxBufferLength: 10,
        maxMaxBufferLength: 30,
        maxBufferSize: 30 * 1000 * 1000,
        maxBufferHole: 0.5,
        lowLatencyMode: true,
        startFragPrefetch: true,
        enableWorker: true,
        fragLoadingTimeOut: 10000,
        manifestLoadingTimeOut: 8000,
        levelLoadingTimeOut: 8000,
        fragLoadingMaxRetry: 3,
        manifestLoadingMaxRetry: 3,
        levelLoadingMaxRetry: 3,
        // Use proxy for all XHR requests to bypass CORS
        xhrSetup: (xhr, url) => {
          // If URL is already proxied or is a relative/local URL, don't proxy again
          if (url.startsWith("/api/proxy") || url.startsWith("blob:")) {
            xhr.open("GET", url, true);
          } else {
            xhr.open("GET", proxyUrl(url), true);
          }
        },
      });

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsBuffering(false);
        setLoadingStatus("");
        if (autoPlay) video.play().catch(() => {});

        const aTracks = hls.audioTracks.map((t, i) => ({
          id: i,
          name: t.name || `Track ${i + 1}`,
          lang: t.lang || "",
        }));
        setAudioTracks(aTracks);

        const sTracks = hls.subtitleTracks.map((t, i) => ({
          id: i,
          name: t.name || `Subtitle ${i + 1}`,
          lang: t.lang || "",
        }));
        setSubtitleTracks(sTracks);
      });

      hls.on(Hls.Events.FRAG_LOADED, () => {
        setIsBuffering(false);
        setLoadingStatus("");
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              if (retryCountRef.current < 3) {
                retryCountRef.current++;
                setLoadingStatus(`Neuer Versuch (${retryCountRef.current}/3)...`);
                hls.startLoad();
              } else {
                // Try .ts format as fallback
                setLoadingStatus("Versuche alternatives Format...");
                destroyHls();
                tryTsFallback();
              }
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              setLoadingStatus("Versuche alternatives Format...");
              destroyHls();
              tryTsFallback();
              break;
          }
        }
      });

      hlsRef.current = hls;
    };

    const tryTsFallback = () => {
      // Try .ts format instead of .m3u8
      const tsUrl = src.replace(/\.m3u8$/, ".ts");
      setLoadingStatus("Lade Stream (.ts)...");

      // Try direct first
      video.src = tsUrl;
      video.onerror = () => {
        // Try proxied .ts
        video.onerror = () => {
          // Try proxied original URL
          video.onerror = null;
          video.src = proxyUrl(src);
          if (autoPlay) video.play().catch(() => {
            setError("Stream konnte nicht geladen werden. Bitte prüfe die Playlist-Daten.");
            setIsBuffering(false);
          });
        };
        video.src = proxyUrl(tsUrl);
        if (autoPlay) video.play().catch(() => {});
      };
      if (autoPlay) video.play().catch(() => {});
    };

    if (isHLS) {
      tryHlsProxy();
    } else {
      // Non-HLS (MP4, TS, etc.) - try direct, then proxy
      tryDirectPlay();

      // Set up fallback on error
      const origOnError = video.onerror;
      video.onerror = () => {
        video.onerror = origOnError;
        setLoadingStatus("Versuche Proxy...");
        video.src = proxyUrl(src);
        if (autoPlay) video.play().catch(() => {
          setError("Stream konnte nicht geladen werden.");
          setIsBuffering(false);
        });
      };
    }

    return () => {
      destroyHls();
      if (video) {
        video.onerror = null;
      }
    };
  }, [src, autoPlay, isHLS]);

  // Seek to initial position
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !initialPosition || initialSeekDoneRef.current) return;

    const handleCanPlay = () => {
      if (!initialSeekDoneRef.current && initialPosition > 0) {
        video.currentTime = initialPosition;
        initialSeekDoneRef.current = true;
      }
    };

    video.addEventListener("canplay", handleCanPlay);
    if (video.readyState >= 3 && !initialSeekDoneRef.current && initialPosition > 0) {
      video.currentTime = initialPosition;
      initialSeekDoneRef.current = true;
    }

    return () => video.removeEventListener("canplay", handleCanPlay);
  }, [initialPosition, src]);

  // Position save interval
  useEffect(() => {
    if (!onPositionChange) return;
    positionIntervalRef.current = setInterval(() => {
      const video = videoRef.current;
      if (video && !video.paused && isFinite(video.currentTime) && video.currentTime > 0) {
        onPositionChange(video.currentTime, video.duration || 0);
      }
    }, 5000);
    return () => {
      if (positionIntervalRef.current) clearInterval(positionIntervalRef.current);
    };
  }, [onPositionChange]);

  // Save position on unmount
  useEffect(() => {
    return () => {
      const video = videoRef.current;
      if (video && onPositionChange && isFinite(video.currentTime) && video.currentTime > 0) {
        onPositionChange(video.currentTime, video.duration || 0);
      }
    };
  }, [onPositionChange]);

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => { setIsPlaying(true); setIsBuffering(false); setLoadingStatus(""); };
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onDurationChange = () => setDuration(video.duration);
    const onWaiting = () => { setIsBuffering(true); setLoadingStatus("Buffering..."); };
    const onCanPlay = () => { setIsBuffering(false); setLoadingStatus(""); };
    const onPlaying = () => { setIsBuffering(false); setLoadingStatus(""); };
    const onError = () => {
      // Don't show error immediately - let fallback logic handle it
      if (!hlsRef.current) {
        // Only show error if not handled by HLS.js
      }
    };
    const onVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

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
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("durationchange", onDurationChange);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("error", onError);
      video.removeEventListener("volumechange", onVolumeChange);
    };
  }, []);

  // Fullscreen change
  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // Auto-hide controls
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
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
        case " ":
        case "k":
          e.preventDefault();
          video.paused ? video.play() : video.pause();
          resetHideTimer();
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "m":
          e.preventDefault();
          video.muted = !video.muted;
          break;
        case "arrowleft":
          e.preventDefault();
          video.currentTime = Math.max(0, video.currentTime - 10);
          resetHideTimer();
          break;
        case "arrowright":
          e.preventDefault();
          video.currentTime = Math.min(duration, video.currentTime + 10);
          resetHideTimer();
          break;
        case "arrowup":
          e.preventDefault();
          video.volume = Math.min(1, video.volume + 0.1);
          resetHideTimer();
          break;
        case "arrowdown":
          e.preventDefault();
          video.volume = Math.max(0, video.volume - 0.1);
          resetHideTimer();
          break;
        case "escape":
          if (isFullscreen) document.exitFullscreen();
          break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [duration, isFullscreen, resetHideTimer]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    video.paused ? video.play() : video.pause();
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    document.fullscreenElement ? document.exitFullscreen() : container.requestFullscreen();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (video) video.muted = !video.muted;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (video) video.currentTime = Number(e.target.value);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = Number(e.target.value);
    if (video.muted && Number(e.target.value) > 0) video.muted = false;
  };

  const cycleAspectRatio = () => {
    const ratios: AspectRatio[] = ["16:9", "4:3", "fill"];
    setAspectRatio(ratios[(ratios.indexOf(aspectRatio) + 1) % ratios.length]);
  };

  const handleAudioTrack = (id: number) => {
    if (hlsRef.current) { hlsRef.current.audioTrack = id; setSelectedAudio(id); }
    setShowSettings(false);
  };

  const handleSubtitleTrack = (id: number) => {
    if (hlsRef.current) { hlsRef.current.subtitleTrack = id; setSelectedSubtitle(id); }
    setShowSettings(false);
  };

  const retry = () => {
    setError(null);
    retryCountRef.current = 0;
    const video = videoRef.current;
    if (video) {
      // Force re-mount by changing src
      video.src = "";
      setTimeout(() => {
        video.src = src;
        video.load();
        video.play().catch(() => {});
      }, 100);
    }
  };

  const formatTime = (t: number) => {
    if (!isFinite(t) || isNaN(t)) return "0:00";
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = Math.floor(t % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const aspectClass =
    aspectRatio === "fill" ? "object-fill"
    : aspectRatio === "4:3" ? "object-contain max-w-[75%] mx-auto"
    : "object-contain";

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-black select-none group"
      onMouseMove={resetHideTimer}
      onClick={() => { if (!showSettings) togglePlayPause(); }}
    >
      {/* Video element - NO crossOrigin to avoid CORS issues */}
      <video
        ref={videoRef}
        className={clsx("w-full h-full", aspectClass)}
        playsInline
      />

      {/* Buffering indicator */}
      {isBuffering && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 pointer-events-none gap-3">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          {loadingStatus && (
            <p className="text-sm text-white/70 font-medium">{loadingStatus}</p>
          )}
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-4">
          <p className="text-red-400 text-base text-center px-8">{error}</p>
          <button
            onClick={(e) => { e.stopPropagation(); retry(); }}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-base text-white hover:bg-indigo-500 transition-colors"
          >
            <HiArrowPath className="h-5 w-5" />
            Erneut versuchen
          </button>
        </div>
      )}

      {/* Controls overlay */}
      <div
        className={clsx(
          "absolute inset-0 flex flex-col justify-between transition-opacity duration-300 pointer-events-none",
          showControls ? "opacity-100" : "opacity-0"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/70 to-transparent pointer-events-auto">
          {onBack && (
            <button onClick={onBack} className="flex items-center gap-2 text-base text-white/80 hover:text-white min-h-[48px] min-w-[48px] justify-center rounded-xl bg-white/10 px-4">
              Zurück
            </button>
          )}
          {title && (
            <h2 className="text-base font-medium text-white truncate max-w-md mx-auto">{title}</h2>
          )}
          <button onClick={cycleAspectRatio} className="rounded-xl bg-white/10 px-3 py-2 text-sm text-white/80 hover:bg-white/20 min-h-[48px]">
            {aspectRatio}
          </button>
        </div>

        {/* Center controls */}
        <div className="flex items-center justify-center gap-8 pointer-events-auto">
          {onChannelPrev && (
            <button onClick={onChannelPrev} className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors backdrop-blur-sm">
              <HiChevronUp className="h-8 w-8" />
            </button>
          )}
          <button onClick={togglePlayPause} className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 transition-all shadow-2xl">
            {isPlaying ? <HiPause className="h-10 w-10" /> : <HiPlay className="h-10 w-10 ml-1" />}
          </button>
          {onChannelNext && (
            <button onClick={onChannelNext} className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors backdrop-blur-sm">
              <HiChevronDown className="h-8 w-8" />
            </button>
          )}
        </div>

        {/* Bottom bar */}
        <div className="p-4 bg-gradient-to-t from-black/70 to-transparent pointer-events-auto">
          {!isLive && (
            <div className="flex items-center gap-3 mb-3">
              <span className="text-base font-semibold text-white/90 w-16 text-right tabular-nums">{formatTime(currentTime)}</span>
              <div className="relative flex-1 h-[16px] flex items-center group/seek">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-[6px] rounded-full bg-white/20 group-hover/seek:h-[10px] transition-all">
                    <div className="h-full rounded-full bg-indigo-500" style={{ width: `${progressPercent}%` }} />
                  </div>
                </div>
                <input type="range" min={0} max={duration || 0} value={currentTime} onChange={handleSeek}
                  className="absolute inset-0 w-full h-full appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg" />
              </div>
              <span className="text-base font-semibold text-white/90 w-16 tabular-nums">{formatTime(duration)}</span>
            </div>
          )}

          {isLive && (
            <div className="flex items-center gap-2 mb-3">
              <span className="flex items-center gap-1.5 text-base font-medium text-red-400">
                <span className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                LIVE
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={togglePlayPause} className="text-white/80 hover:text-white min-h-[48px] min-w-[48px] flex items-center justify-center">
                {isPlaying ? <HiPause className="h-7 w-7" /> : <HiPlay className="h-7 w-7" />}
              </button>
              <div className="flex items-center gap-2 group/vol">
                <button onClick={toggleMute} className="text-white/80 hover:text-white min-h-[48px] min-w-[48px] flex items-center justify-center">
                  {isMuted || volume === 0 ? <HiSpeakerXMark className="h-7 w-7" /> : <HiSpeakerWave className="h-7 w-7" />}
                </button>
                <input type="range" min={0} max={1} step={0.05} value={isMuted ? 0 : volume} onChange={handleVolumeChange}
                  className="w-0 group-hover/vol:w-24 transition-all duration-200 h-2 appearance-none bg-white/20 rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-[16px] [&::-webkit-slider-thumb]:w-[16px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white" />
              </div>
            </div>

            <div className="flex items-center gap-4">
              {(audioTracks.length > 1 || subtitleTracks.length > 0) && (
                <div className="relative">
                  <button onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }}
                    className="text-white/80 hover:text-white min-h-[48px] min-w-[48px] flex items-center justify-center">
                    <HiCog6Tooth className="h-7 w-7" />
                  </button>
                  {showSettings && (
                    <div className="absolute bottom-12 right-0 w-64 rounded-xl glass-panel overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
                      {audioTracks.length > 1 && (
                        <div className="p-3 border-b border-white/10">
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Audio</p>
                          {audioTracks.map((t) => (
                            <button key={t.id} onClick={() => handleAudioTrack(t.id)}
                              className={clsx("block w-full text-left text-sm py-2 px-3 rounded-lg min-h-[40px]",
                                selectedAudio === t.id ? "text-indigo-400 bg-indigo-500/10" : "text-gray-300 hover:bg-white/5"
                              )}>{t.name} {t.lang && `(${t.lang})`}</button>
                          ))}
                        </div>
                      )}
                      {subtitleTracks.length > 0 && (
                        <div className="p-3">
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Untertitel</p>
                          <button onClick={() => handleSubtitleTrack(-1)}
                            className={clsx("block w-full text-left text-sm py-2 px-3 rounded-lg min-h-[40px]",
                              selectedSubtitle === -1 ? "text-indigo-400 bg-indigo-500/10" : "text-gray-300 hover:bg-white/5"
                            )}>Aus</button>
                          {subtitleTracks.map((t) => (
                            <button key={t.id} onClick={() => handleSubtitleTrack(t.id)}
                              className={clsx("block w-full text-left text-sm py-2 px-3 rounded-lg min-h-[40px]",
                                selectedSubtitle === t.id ? "text-indigo-400 bg-indigo-500/10" : "text-gray-300 hover:bg-white/5"
                              )}>{t.name} {t.lang && `(${t.lang})`}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              <button onClick={toggleFullscreen} className="text-white/80 hover:text-white min-h-[48px] min-w-[48px] flex items-center justify-center">
                {isFullscreen ? <HiArrowsPointingIn className="h-7 w-7" /> : <HiArrowsPointingOut className="h-7 w-7" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
