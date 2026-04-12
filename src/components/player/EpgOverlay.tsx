"use client";

import { useState, useEffect } from "react";
import clsx from "clsx";
import type { EpgProgram } from "@/types";

interface EpgOverlayProps {
  programs: EpgProgram[];
  channelName?: string;
  channelLogo?: string;
  isVisible: boolean;
  channelNumber?: number;
}

export default function EpgOverlay({
  programs,
  channelName,
  channelLogo,
  isVisible,
  channelNumber,
}: EpgOverlayProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  if (!isVisible) return null;
  if (programs.length === 0 && !channelName) return null;

  const now = Date.now();
  const current = programs.find((p) => {
    const start = new Date(p.start).getTime();
    const end = new Date(p.end).getTime();
    return now >= start && now <= end;
  });
  const next = programs.find((p) => {
    const start = new Date(p.start).getTime();
    return start > now;
  });

  const formatTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const getProgress = () => {
    if (!current) return 0;
    const start = new Date(current.start).getTime();
    const end = new Date(current.end).getTime();
    const total = end - start;
    if (total <= 0) return 0;
    return Math.min(100, ((now - start) / total) * 100);
  };

  return (
    <div className={clsx(
      "absolute z-20 pointer-events-none animate-in fade-in slide-in-from-bottom-4 duration-300",
      isFullscreen
        ? "bottom-28 left-8 right-8"
        : "bottom-20 left-4 right-4"
    )}>
      <div className={clsx(
        "bg-black/85 backdrop-blur-xl rounded-xl border border-white/10",
        isFullscreen ? "max-w-2xl p-4" : "max-w-lg p-3"
      )}>
        {/* Channel info bar - TiviMate style */}
        <div className="flex items-center gap-3 mb-2">
          {/* Channel number badge */}
          {channelNumber && channelNumber > 0 && (
            <div className="flex h-8 min-w-[2rem] items-center justify-center rounded-md bg-indigo-500/20 px-2">
              <span className="text-sm font-bold text-indigo-400 tabular-nums">{channelNumber}</span>
            </div>
          )}

          {/* Channel logo */}
          {channelLogo && (
            <div className="h-8 w-12 flex-shrink-0 rounded overflow-hidden bg-white/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={channelLogo} alt="" className="h-full w-full object-contain" />
            </div>
          )}

          {/* Channel name */}
          {channelName && (
            <p className={clsx(
              "text-white font-semibold truncate flex-1",
              isFullscreen ? "text-base" : "text-sm"
            )}>
              {channelName}
            </p>
          )}

          {/* Live badge */}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-bold text-red-400 uppercase">Live</span>
          </div>
        </div>

        {current && (
          <div className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <p className={clsx(
                "font-medium text-white flex-1 truncate",
                isFullscreen ? "text-sm" : "text-xs"
              )}>{current.title}</p>
              <span className={clsx("text-gray-500 flex-shrink-0 ml-2 tabular-nums", isFullscreen ? "text-xs" : "text-[10px]")}>
                {formatTime(current.start)} - {formatTime(current.end)}
              </span>
            </div>
            {current.description && (
              <p className={clsx(
                "text-gray-500 line-clamp-1 mb-1.5",
                isFullscreen ? "text-xs" : "text-[10px]"
              )}>
                {current.description}
              </p>
            )}
            {/* Progress bar */}
            <div className={clsx(
              "rounded-full bg-white/10 overflow-hidden",
              isFullscreen ? "h-1" : "h-0.5"
            )}>
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                style={{ width: `${getProgress()}%` }}
              />
            </div>
          </div>
        )}

        {next && (
          <div className="flex items-center justify-between pt-1 border-t border-white/5">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className={clsx(
                "text-gray-600 font-medium flex-shrink-0",
                isFullscreen ? "text-xs" : "text-[10px]"
              )}>
                Danach
              </span>
              <p className={clsx(
                "text-gray-400 truncate",
                isFullscreen ? "text-xs" : "text-[10px]"
              )}>{next.title}</p>
            </div>
            <span className={clsx("text-gray-600 flex-shrink-0 ml-2 tabular-nums", isFullscreen ? "text-xs" : "text-[10px]")}>
              {formatTime(next.start)}
            </span>
          </div>
        )}

        {programs.length === 0 && (
          <p className={clsx(
            "text-gray-600 italic",
            isFullscreen ? "text-xs" : "text-[10px]"
          )}>
            Keine EPG-Daten
          </p>
        )}
      </div>
    </div>
  );
}
