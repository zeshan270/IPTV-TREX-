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
  HiForward,
  HiBackward,
  HiChevronUp,
  HiChevronDown,
  HiArrowPath,
  HiCog6Tooth,
} from "react-icons/hi2";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

type AspectRatio = "16:9" | "4:3" | "fill";

interface VideoPlayerProps {
  src: string;
  title?: string;
  onChannelNext?: () => void;
  onChannelPrev?: () => void;
  onBack?: () => void;
  autoPlay?: boolean;
}

export default function VideoPlayer({
  src,
  title,
  onChannelNext,
  onChannelPrev,
  onBack,
  autoPlay = true,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const isHLS = src.includes(".m3u8") || src.includes("m3u8");
  const isLive = !duration || duration === Infinity;

  // Initialize player
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    setError(null);
    setIsBuffering(true);

    const destroyHls = () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };

    destroyHls();

    if (isHLS && Hls.isSupported()) {
      const hls = new Hls({
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        startFragPrefetch: true,
        enableWorker: true,
      });

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsBuffering(false);
        if (autoPlay) video.play().catch(() => {});

        // Audio tracks
        const aTracks = hls.audioTracks.map((t, i) => ({
          id: i,
          name: t.name || `Track ${i + 1}`,
          lang: t.lang || "",
        }));
        setAudioTracks(aTracks);

        // Subtitle tracks
        const sTracks = hls.subtitleTracks.map((t, i) => ({
          id: i,
          name: t.name || `Subtitle ${i + 1}`,
          lang: t.lang || "",
        }));
        setSubtitleTracks(sTracks);
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              setError("Playback error. Please try again.");
              destroyHls();
              break;
          }
        }
      });

      hlsRef.current = hls;
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native HLS (Safari)
      video.src = src;
      if (autoPlay) video.play().catch(() => {});
    } else {
      // Direct MP4/TS
      video.src = src;
      if (autoPlay) video.play().catch(() => {});
    }

    return destroyHls;
  }, [src, autoPlay, isHLS]);

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onDurationChange = () => setDuration(video.duration);
    const onWaiting = () => setIsBuffering(true);
    const onCanPlay = () => setIsBuffering(false);
    const onError = () => setError("Failed to load video stream.");
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
    video.addEventListener("error", onError);
    video.addEventListener("volumechange", onVolumeChange);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("durationchange", onDurationChange);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("error", onError);
      video.removeEventListener("volumechange", onVolumeChange);
    };
  }, []);

  // Fullscreen change
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
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
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
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
          if (isFullscreen) {
            document.exitFullscreen();
          }
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
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Number(e.target.value);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = Number(e.target.value);
    if (video.muted && Number(e.target.value) > 0) {
      video.muted = false;
    }
  };

  const cycleAspectRatio = () => {
    const ratios: AspectRatio[] = ["16:9", "4:3", "fill"];
    const idx = ratios.indexOf(aspectRatio);
    setAspectRatio(ratios[(idx + 1) % ratios.length]);
  };

  const handleAudioTrack = (id: number) => {
    if (hlsRef.current) {
      hlsRef.current.audioTrack = id;
      setSelectedAudio(id);
    }
    setShowSettings(false);
  };

  const handleSubtitleTrack = (id: number) => {
    if (hlsRef.current) {
      hlsRef.current.subtitleTrack = id;
      setSelectedSubtitle(id);
    }
    setShowSettings(false);
  };

  const retry = () => {
    setError(null);
    const video = videoRef.current;
    if (video) {
      video.load();
      video.play().catch(() => {});
    }
  };

  const formatTime = (t: number) => {
    if (!isFinite(t) || isNaN(t)) return "0:00";
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = Math.floor(t % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const aspectClass =
    aspectRatio === "fill"
      ? "object-fill"
      : aspectRatio === "4:3"
        ? "object-contain max-w-[75%] mx-auto"
        : "object-contain";

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-black select-none group"
      onMouseMove={resetHideTimer}
      onClick={() => {
        if (!showSettings) togglePlayPause();
      }}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        className={clsx("w-full h-full", aspectClass)}
        playsInline
        crossOrigin="anonymous"
      />

      {/* Buffering indicator */}
      {isBuffering && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
          <LoadingSpinner size="lg" text="Buffering..." />
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-4">
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              retry();
            }}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500"
          >
            <HiArrowPath className="h-4 w-4" />
            Retry
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
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm text-white/80 hover:text-white"
            >
              <HiBackward className="h-5 w-5" />
              Back
            </button>
          )}
          {title && (
            <h2 className="text-sm font-medium text-white truncate max-w-md mx-auto">
              {title}
            </h2>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={cycleAspectRatio}
              className="rounded-lg bg-white/10 px-2 py-1 text-xs text-white/80 hover:bg-white/20"
            >
              {aspectRatio}
            </button>
          </div>
        </div>

        {/* Center controls */}
        <div className="flex items-center justify-center gap-8 pointer-events-auto">
          {onChannelPrev && (
            <button
              onClick={onChannelPrev}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <HiChevronUp className="h-6 w-6" />
            </button>
          )}
          <button
            onClick={togglePlayPause}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 transition-all"
          >
            {isPlaying ? (
              <HiPause className="h-8 w-8" />
            ) : (
              <HiPlay className="h-8 w-8 ml-1" />
            )}
          </button>
          {onChannelNext && (
            <button
              onClick={onChannelNext}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <HiChevronDown className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* Bottom bar */}
        <div className="p-4 bg-gradient-to-t from-black/70 to-transparent pointer-events-auto">
          {/* Seek bar */}
          {!isLive && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-white/70 w-12 text-right">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min={0}
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 h-1 appearance-none bg-white/20 rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500"
              />
              <span className="text-xs text-white/70 w-12">
                {formatTime(duration)}
              </span>
            </div>
          )}

          {isLive && (
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center gap-1.5 text-xs font-medium text-red-400">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                LIVE
              </span>
            </div>
          )}

          {/* Controls row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlayPause}
                className="text-white/80 hover:text-white"
              >
                {isPlaying ? (
                  <HiPause className="h-5 w-5" />
                ) : (
                  <HiPlay className="h-5 w-5" />
                )}
              </button>

              {/* Volume */}
              <div className="flex items-center gap-1 group/vol">
                <button
                  onClick={toggleMute}
                  className="text-white/80 hover:text-white"
                >
                  {isMuted || volume === 0 ? (
                    <HiSpeakerXMark className="h-5 w-5" />
                  ) : (
                    <HiSpeakerWave className="h-5 w-5" />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-0 group-hover/vol:w-20 transition-all duration-200 h-1 appearance-none bg-white/20 rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Settings */}
              {(audioTracks.length > 1 || subtitleTracks.length > 0) && (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSettings(!showSettings);
                    }}
                    className="text-white/80 hover:text-white"
                  >
                    <HiCog6Tooth className="h-5 w-5" />
                  </button>
                  {showSettings && (
                    <div
                      className="absolute bottom-8 right-0 w-56 rounded-lg bg-[#1a1a2e] border border-[#2a2a45] shadow-xl overflow-hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {audioTracks.length > 1 && (
                        <div className="p-3 border-b border-[#2a2a45]">
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                            Audio
                          </p>
                          {audioTracks.map((t) => (
                            <button
                              key={t.id}
                              onClick={() => handleAudioTrack(t.id)}
                              className={clsx(
                                "block w-full text-left text-sm py-1 px-2 rounded",
                                selectedAudio === t.id
                                  ? "text-indigo-400 bg-indigo-500/10"
                                  : "text-gray-300 hover:bg-white/5"
                              )}
                            >
                              {t.name} {t.lang && `(${t.lang})`}
                            </button>
                          ))}
                        </div>
                      )}
                      {subtitleTracks.length > 0 && (
                        <div className="p-3">
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                            Subtitles
                          </p>
                          <button
                            onClick={() => handleSubtitleTrack(-1)}
                            className={clsx(
                              "block w-full text-left text-sm py-1 px-2 rounded",
                              selectedSubtitle === -1
                                ? "text-indigo-400 bg-indigo-500/10"
                                : "text-gray-300 hover:bg-white/5"
                            )}
                          >
                            Off
                          </button>
                          {subtitleTracks.map((t) => (
                            <button
                              key={t.id}
                              onClick={() => handleSubtitleTrack(t.id)}
                              className={clsx(
                                "block w-full text-left text-sm py-1 px-2 rounded",
                                selectedSubtitle === t.id
                                  ? "text-indigo-400 bg-indigo-500/10"
                                  : "text-gray-300 hover:bg-white/5"
                              )}
                            >
                              {t.name} {t.lang && `(${t.lang})`}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="text-white/80 hover:text-white"
              >
                {isFullscreen ? (
                  <HiArrowsPointingIn className="h-5 w-5" />
                ) : (
                  <HiArrowsPointingOut className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
