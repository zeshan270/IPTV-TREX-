"use client";

import { useState, useEffect } from "react";
import clsx from "clsx";
import type { EpgProgram } from "@/types";

interface EpgOverlayProps {
  programs: EpgProgram[];
  channelName?: string;
  isVisible: boolean;
}

export default function EpgOverlay({
  programs,
  channelName,
  isVisible,
}: EpgOverlayProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  if (!isVisible || programs.length === 0) return null;

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
      "absolute z-20 pointer-events-none",
      isFullscreen
        ? "bottom-28 left-8 right-8"
        : "bottom-20 left-4 right-4"
    )}>
      <div className={clsx(
        "glass rounded-xl",
        isFullscreen ? "max-w-2xl p-5" : "max-w-lg p-4"
      )}>
        {channelName && (
          <p className={clsx(
            "text-indigo-400 font-medium mb-2",
            isFullscreen ? "text-sm" : "text-xs"
          )}>
            {channelName}
          </p>
        )}

        {current && (
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-1">
              <span className={clsx(
                "uppercase tracking-wider text-green-400 font-semibold",
                isFullscreen ? "text-xs" : "text-[10px]"
              )}>
                Jetzt
              </span>
              <span className={clsx("text-gray-500", isFullscreen ? "text-sm" : "text-xs")}>
                {formatTime(current.start)} - {formatTime(current.end)}
              </span>
            </div>
            <p className={clsx(
              "font-medium text-white",
              isFullscreen ? "text-base" : "text-sm"
            )}>{current.title}</p>
            {current.description && (
              <p className={clsx(
                "text-gray-400 mt-1 line-clamp-2",
                isFullscreen ? "text-sm" : "text-xs"
              )}>
                {current.description}
              </p>
            )}
            <div className={clsx(
              "mt-2 rounded-full bg-white/10 overflow-hidden",
              isFullscreen ? "h-1.5" : "h-1"
            )}>
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                style={{ width: `${getProgress()}%` }}
              />
            </div>
          </div>
        )}

        {next && (
          <div className="border-t border-white/10 pt-2">
            <div className="flex items-center gap-2 mb-1">
              <span className={clsx(
                "uppercase tracking-wider text-gray-500 font-semibold",
                isFullscreen ? "text-xs" : "text-[10px]"
              )}>
                Danach
              </span>
              <span className={clsx("text-gray-500", isFullscreen ? "text-sm" : "text-xs")}>
                {formatTime(next.start)}
              </span>
            </div>
            <p className={clsx(
              "text-gray-400",
              isFullscreen ? "text-base" : "text-sm"
            )}>{next.title}</p>
          </div>
        )}
      </div>
    </div>
  );
}
