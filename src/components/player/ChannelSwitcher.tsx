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
    <div className="absolute right-0 top-0 bottom-0 z-30 w-80 flex flex-col bg-[#0f0f1a]/95 backdrop-blur-md border-l border-[#2a2a45]">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[#2a2a45]">
        <h3 className="text-sm font-semibold text-white">Channels</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-white transition-colors"
        >
          <HiXMark className="h-5 w-5" />
        </button>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-[#2a2a45]">
        <div className="relative">
          <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter channels..."
            className="w-full rounded-lg bg-[#1a1a2e] border border-[#2a2a45] py-2 pl-9 pr-3 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500"
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
                "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors",
                isActive
                  ? "bg-indigo-500/10 border-l-2 border-indigo-500"
                  : "hover:bg-white/5 border-l-2 border-transparent"
              )}
            >
              <span className="text-xs text-gray-500 w-6 text-right font-mono">
                {idx + 1}
              </span>
              <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded bg-[#25253d]">
                {channel.logo ? (
                  <Image
                    src={channel.logo}
                    alt={channel.name}
                    fill
                    className="object-contain p-0.5"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-gray-600">
                    {channel.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={clsx(
                    "text-sm truncate",
                    isActive ? "text-indigo-400 font-medium" : "text-gray-300"
                  )}
                >
                  {channel.name}
                </p>
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="p-4 text-center text-sm text-gray-500">
            No channels found
          </p>
        )}
      </div>
    </div>
  );
}
