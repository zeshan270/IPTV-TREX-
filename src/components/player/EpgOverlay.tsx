"use client";

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
    <div className="absolute bottom-20 left-4 right-4 z-20 pointer-events-none">
      <div className="max-w-lg glass rounded-xl p-4">
        {channelName && (
          <p className="text-xs text-indigo-400 font-medium mb-2">
            {channelName}
          </p>
        )}

        {current && (
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase tracking-wider text-green-400 font-semibold">
                Now
              </span>
              <span className="text-xs text-gray-500">
                {formatTime(current.start)} - {formatTime(current.end)}
              </span>
            </div>
            <p className="text-sm font-medium text-white">{current.title}</p>
            {current.description && (
              <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                {current.description}
              </p>
            )}
            {/* Progress bar */}
            <div className="mt-2 h-1 rounded-full bg-white/10 overflow-hidden">
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
              <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
                Next
              </span>
              <span className="text-xs text-gray-500">
                {formatTime(next.start)}
              </span>
            </div>
            <p className="text-sm text-gray-400">{next.title}</p>
          </div>
        )}
      </div>
    </div>
  );
}
