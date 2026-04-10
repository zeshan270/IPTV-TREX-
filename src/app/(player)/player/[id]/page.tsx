"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { useAuthStore, usePlayerStore, useRecentStore } from "@/lib/store";
import { fetchEpg, buildStreamUrl } from "@/lib/api-client";
import VideoPlayer from "@/components/player/VideoPlayer";
import ChannelSwitcher from "@/components/player/ChannelSwitcher";
import EpgOverlay from "@/components/player/EpgOverlay";
import type { EpgProgram } from "@/types";
import { HiListBullet } from "react-icons/hi2";

export default function PlayerPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const id = params.id as string;
  const type = searchParams.get("type") || "live";
  const urlParam = searchParams.get("url");

  const credentials = useAuthStore((s) => s.credentials);
  const { currentChannel, playlist, setChannel, next, prev } = usePlayerStore();
  const addRecent = useRecentStore((s) => s.add);

  const [streamUrl, setStreamUrl] = useState("");
  const [epgPrograms, setEpgPrograms] = useState<EpgProgram[]>([]);
  const [showChannelList, setShowChannelList] = useState(false);
  const [showEpg, setShowEpg] = useState(true);

  const isXtream = credentials && "serverUrl" in credentials;
  const creds = credentials as { serverUrl: string; username: string; password: string } | null;

  // Build stream URL
  useEffect(() => {
    if (urlParam) {
      setStreamUrl(decodeURIComponent(urlParam));
    } else if (isXtream && creds) {
      const streamType = type === "live" ? "live" : type === "movie" ? "movie" : "series";
      const url = buildStreamUrl(creds, Number(id), streamType);
      setStreamUrl(url);
    }
  }, [id, urlParam, type, isXtream, creds]);

  // Track recently watched
  useEffect(() => {
    if (currentChannel) {
      addRecent({
        id: currentChannel.id,
        name: currentChannel.name,
        logo: currentChannel.logo,
        streamType: currentChannel.streamType,
      });
    } else if (id) {
      addRecent({
        id,
        name: `Stream ${id}`,
        streamType: type as "live" | "movie" | "series",
      });
    }
  }, [id, currentChannel, addRecent, type]);

  // Fetch EPG for live channels
  useEffect(() => {
    if (type !== "live" || !isXtream || !creds) return;
    fetchEpg(creds, Number(id))
      .then(setEpgPrograms)
      .catch(() => setEpgPrograms([]));
  }, [id, type, isXtream, creds]);

  // Auto-hide EPG after a few seconds
  useEffect(() => {
    if (epgPrograms.length > 0) {
      setShowEpg(true);
      const timer = setTimeout(() => setShowEpg(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [epgPrograms]);

  const handleNext = useCallback(() => {
    next();
    const store = usePlayerStore.getState();
    if (store.currentChannel) {
      router.replace(
        `/player/${store.currentChannel.id}?type=live&url=${encodeURIComponent(store.currentChannel.url)}`
      );
    }
  }, [next, router]);

  const handlePrev = useCallback(() => {
    prev();
    const store = usePlayerStore.getState();
    if (store.currentChannel) {
      router.replace(
        `/player/${store.currentChannel.id}?type=live&url=${encodeURIComponent(store.currentChannel.url)}`
      );
    }
  }, [prev, router]);

  const handleBack = () => {
    router.back();
  };

  const handleChannelSelect = (channel: typeof playlist[0]) => {
    setChannel(channel);
    setShowChannelList(false);
    router.replace(
      `/player/${channel.id}?type=live&url=${encodeURIComponent(channel.url)}`
    );
  };

  if (!streamUrl) {
    return (
      <div className="flex h-full items-center justify-center bg-black">
        <p className="text-gray-500 text-sm">No stream URL provided</p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-black">
      <VideoPlayer
        src={streamUrl}
        title={currentChannel?.name || `Stream ${id}`}
        onChannelNext={type === "live" ? handleNext : undefined}
        onChannelPrev={type === "live" ? handlePrev : undefined}
        onBack={handleBack}
      />

      {/* EPG overlay */}
      {type === "live" && (
        <EpgOverlay
          programs={epgPrograms}
          channelName={currentChannel?.name}
          isVisible={showEpg}
        />
      )}

      {/* Channel list toggle */}
      {type === "live" && playlist.length > 0 && (
        <button
          onClick={() => setShowChannelList(!showChannelList)}
          className="absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70 transition-colors"
        >
          <HiListBullet className="h-5 w-5" />
        </button>
      )}

      {/* Channel switcher */}
      <ChannelSwitcher
        channels={playlist}
        currentId={currentChannel?.id || id}
        isOpen={showChannelList}
        onClose={() => setShowChannelList(false)}
        onSelect={handleChannelSelect}
      />
    </div>
  );
}
