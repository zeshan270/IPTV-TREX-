"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import clsx from "clsx";
import { HiXMark, HiMagnifyingGlass } from "react-icons/hi2";
import type { Channel } from "@/types";

interface ChannelSwitcherProps {
  channels: Channel[];
  currentId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (channel: Channel) => void;
}

export default function ChannelSwitcher({
  channels,
  currentId,
  isOpen,
  onClose,
  onSelect,
}: ChannelSwitcherProps) {
  const [filter, setFilter] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  const filtered = filter
    ? channels.filter((c) =>
        c.name.toLowerCase().includes(filter.toLowerCase())
      )
    : channels;

  // Scroll to current channel
  useEffect(() => {
    if (isOpen && activeRef.current) {
      activeRef.current.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-0 bottom-0 z-30 w-80 flex flex-col bg-[#0d0d14]/95 backdrop-blur-md border-l border-[#2a2a38]">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[#2a2a38]">
        <h3 className="text-sm font-semibold text-white">Kanäle ({channels.length})</h3>
        <button
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
        >
          <HiXMark className="h-5 w-5" />
        </button>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-[#2a2a38]">
        <div className="relative">
          <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Kanal suchen..."
            className="w-full rounded-lg bg-[#181820] border border-[#2a2a38] py-2.5 pl-9 pr-3 text-sm text-white placeholder-gray-500 outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Channel list */}
      <div ref={listRef} className="flex-1 overflow-y-auto">
        {filtered.map((channel, idx) => {
          const isActive = channel.id === currentId;
          return (
            <button
              key={channel.id}
              ref={isActive ? activeRef : undefined}
              onClick={() => onSelect(channel)}
              className={clsx(
                "flex w-full items-center gap-3 px-3 py-3 text-left transition-colors min-h-[48px]",
                isActive
                  ? "bg-amber-500/10 border-l-3 border-amber-500"
                  : "hover:bg-white/5 border-l-3 border-transparent"
              )}
            >
              <span className="text-xs text-gray-500 w-7 text-right font-mono tabular-nums">
                {idx + 1}
              </span>
              <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded bg-[#22222e]">
                {channel.logo ? (
                  <Image
                    src={channel.logo}
                    alt={channel.name}
                    fill
                    className="object-contain p-0.5"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-gray-600 font-semibold">
                    {channel.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={clsx(
                    "text-sm truncate",
                    isActive ? "text-amber-400 font-semibold" : "text-gray-300"
                  )}
                >
                  {channel.name}
                </p>
              </div>
              {isActive && (
                <span className="h-2 w-2 rounded-full bg-amber-500 flex-shrink-0 animate-pulse" />
              )}
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="p-4 text-center text-sm text-gray-500">
            Keine Kanäle gefunden
          </p>
        )}
      </div>
    </div>
  );
}
