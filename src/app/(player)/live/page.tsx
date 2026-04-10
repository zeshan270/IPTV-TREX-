"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import clsx from "clsx";
import {
  HiSquares2X2,
  HiListBullet,
  HiSignal,
} from "react-icons/hi2";
import { useAuthStore, usePlayerStore } from "@/lib/store";
import {
  fetchLiveCategories,
  fetchLiveStreams,
} from "@/lib/api-client";
import type { Category, Channel } from "@/types";
import SearchBar from "@/components/ui/SearchBar";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorDisplay from "@/components/ui/ErrorDisplay";

type ViewMode = "grid" | "list";

export default function LiveTVPage() {
  const router = useRouter();
  const credentials = useAuthStore((s) => s.credentials);
  const setPlaylist = usePlayerStore((s) => s.setPlaylist);

  const [categories, setCategories] = useState<Category[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [loading, setLoading] = useState(true);
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isXtream = credentials && "serverUrl" in credentials;

  // Load categories
  useEffect(() => {
    if (!isXtream || !credentials) return;
    const creds = credentials as { serverUrl: string; username: string; password: string };
    setLoading(true);
    fetchLiveCategories(creds)
      .then((cats) => {
        setCategories(cats);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [credentials, isXtream]);

  // Load channels for selected category
  useEffect(() => {
    if (!isXtream || !credentials) return;
    const creds = credentials as { serverUrl: string; username: string; password: string };
    setLoadingChannels(true);
    fetchLiveStreams(creds, selectedCategory ?? undefined)
      .then((streams) => {
        setChannels(streams);
        setPlaylist(streams);
        setLoadingChannels(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoadingChannels(false);
      });
  }, [credentials, isXtream, selectedCategory, setPlaylist]);

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
  }, []);

  const filteredChannels = searchQuery
    ? channels.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : channels;

  const handleChannelClick = (channel: Channel) => {
    router.push(`/player/${channel.id}?type=live&url=${encodeURIComponent(channel.url)}`);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner size="lg" text="Loading Live TV..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <ErrorDisplay message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Category sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-[#2a2a45] bg-[#0f0f1a]/50">
        <div className="p-4 border-b border-[#2a2a45]">
          <h2 className="text-sm font-semibold text-white">Categories</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          <button
            onClick={() => setSelectedCategory(null)}
            className={clsx(
              "w-full text-left px-4 py-2.5 text-sm transition-colors",
              selectedCategory === null
                ? "bg-indigo-500/10 text-indigo-400 border-l-2 border-indigo-500"
                : "text-gray-400 hover:bg-white/5 border-l-2 border-transparent"
            )}
          >
            All Channels
          </button>
          {categories.map((cat) => (
            <button
              key={cat.categoryId}
              onClick={() => setSelectedCategory(cat.categoryId)}
              className={clsx(
                "w-full text-left px-4 py-2.5 text-sm transition-colors truncate",
                selectedCategory === cat.categoryId
                  ? "bg-indigo-500/10 text-indigo-400 border-l-2 border-indigo-500"
                  : "text-gray-400 hover:bg-white/5 border-l-2 border-transparent"
              )}
            >
              {cat.categoryName}
            </button>
          ))}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center gap-3 p-4 border-b border-[#2a2a45]">
          <SearchBar
            placeholder="Search channels..."
            onSearch={handleSearch}
            className="flex-1 max-w-md"
          />

          {/* Mobile category select */}
          <select
            value={selectedCategory ?? ""}
            onChange={(e) =>
              setSelectedCategory(e.target.value || null)
            }
            className="lg:hidden rounded-lg border border-[#2a2a45] bg-[#1a1a2e] px-3 py-2.5 text-sm text-white outline-none"
          >
            <option value="">All</option>
            {categories.map((cat) => (
              <option key={cat.categoryId} value={cat.categoryId}>
                {cat.categoryName}
              </option>
            ))}
          </select>

          {/* View toggle */}
          <div className="flex rounded-lg border border-[#2a2a45] overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={clsx(
                "p-2 transition-colors",
                viewMode === "grid"
                  ? "bg-indigo-500/20 text-indigo-400"
                  : "text-gray-500 hover:text-white"
              )}
            >
              <HiSquares2X2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={clsx(
                "p-2 transition-colors",
                viewMode === "list"
                  ? "bg-indigo-500/20 text-indigo-400"
                  : "text-gray-500 hover:text-white"
              )}
            >
              <HiListBullet className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Channels */}
        <div className="flex-1 overflow-y-auto p-4">
          {loadingChannels ? (
            <div className="flex items-center justify-center py-16">
              <LoadingSpinner text="Loading channels..." />
            </div>
          ) : filteredChannels.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <HiSignal className="h-12 w-12 text-gray-600 mb-3" />
              <p className="text-sm text-gray-500">No channels found</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {filteredChannels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => handleChannelClick(channel)}
                  className="group rounded-xl bg-[#1a1a2e] border border-[#2a2a45] p-3 text-left transition-all hover:border-indigo-500/30 hover:bg-[#1a1a2e]/80 card-hover"
                >
                  <div className="relative aspect-video w-full mb-2 rounded-lg overflow-hidden bg-[#25253d]">
                    {channel.logo ? (
                      <Image
                        src={channel.logo}
                        alt={channel.name}
                        fill
                        className="object-contain p-2"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <HiSignal className="h-6 w-6 text-gray-600" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-medium text-gray-300 truncate group-hover:text-white">
                    {channel.name}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredChannels.map((channel, idx) => (
                <button
                  key={channel.id}
                  onClick={() => handleChannelClick(channel)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/5"
                >
                  <span className="w-8 text-right text-xs text-gray-600 font-mono">
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
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-600">
                        TV
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-gray-300 truncate flex-1">
                    {channel.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
