"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuthStore, usePlayerStore, useRecentStore, useFavoritesStore } from "@/lib/store";
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
  const nameParam = searchParams.get("name");

  const credentials = useAuthStore((s) => s.credentials);
  const { currentChannel, playlist, setChannel, next, prev, savePosition, getPosition } =
    usePlayerStore();
  const addRecent = useRecentStore((s) => s.add);
  const favorites = useFavoritesStore((s) => s.favorites);

  const [streamUrl, setStreamUrl] = useState("");
  const [epgPrograms, setEpgPrograms] = useState<EpgProgram[]>([]);
  const [showChannelList, setShowChannelList] = useState(false);
  const [showEpg, setShowEpg] = useState(true);
  const [initialPosition, setInitialPosition] = useState<number | undefined>(undefined);

  // Channel number switching state
  const [channelNumberInput, setChannelNumberInput] = useState("");
  const channelNumberTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Channel name for EPG display
  const [currentChannelName, setCurrentChannelName] = useState("");

  const isXtream = credentials && "serverUrl" in credentials;
  const creds = credentials as { serverUrl: string; username: string; password: string } | null;

  // Build stream URL and restore position
  useEffect(() => {
    if (urlParam) {
      setStreamUrl(decodeURIComponent(urlParam).trim());
    } else if (isXtream && creds) {
      const streamType = type === "live" ? "live" : type === "movie" ? "movie" : "series";
      const url = buildStreamUrl(creds, Number(id), streamType);
      setStreamUrl(url);
    }

    // Restore saved position
    const saved = getPosition(id);
    if (saved && saved.duration > 0) {
      const progress = saved.position / saved.duration;
      if (progress < 0.95 && saved.position > 5) {
        setInitialPosition(saved.position);
      }
    }
  }, [id, urlParam, type, isXtream, creds, getPosition]);

  // Derive display name from channel store or URL param
  const displayName = currentChannel?.name || nameParam || id;

  // Track recently watched
  const recentName = currentChannel?.name || nameParam || id;
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
        name: recentName,
        streamType: type as "live" | "movie" | "series",
      });
    }
  }, [id, currentChannel, addRecent, type, recentName]);

  // Fetch EPG for live channels
  useEffect(() => {
    if (type !== "live" || !isXtream || !creds) return;
    fetchEpg(creds, Number(id))
      .then(setEpgPrograms)
      .catch(() => setEpgPrograms([]));
  }, [id, type, isXtream, creds]);

  // Always show EPG on channel switch, auto-hide after 8s
  useEffect(() => {
    const name = currentChannel?.name || nameParam || "";
    setCurrentChannelName(name);
    setShowEpg(true);
    const timer = setTimeout(() => setShowEpg(false), 8000);
    return () => clearTimeout(timer);
  }, [streamUrl, currentChannel?.name, nameParam]);

  // Number key channel switching
  useEffect(() => {
    const handleNumberKey = (e: KeyboardEvent) => {
      const key = e.key;
      if (key >= "0" && key <= "9") {
        e.preventDefault();

        setChannelNumberInput((prev) => {
          const newInput = prev + key;

          // Clear existing timer
          if (channelNumberTimerRef.current) {
            clearTimeout(channelNumberTimerRef.current);
          }

          // If 3 digits, switch immediately
          if (newInput.length >= 3) {
            switchToChannelNumber(Number(newInput));
            return "";
          }

          // Otherwise set 1.5s timeout
          channelNumberTimerRef.current = setTimeout(() => {
            if (newInput.length > 0) {
              switchToChannelNumber(Number(newInput));
              setChannelNumberInput("");
            }
          }, 1500);

          return newInput;
        });
      }

    };

    window.addEventListener("keydown", handleNumberKey);
    return () => {
      window.removeEventListener("keydown", handleNumberKey);
      if (channelNumberTimerRef.current) {
        clearTimeout(channelNumberTimerRef.current);
      }
    };
  }, [favorites, playlist]);

  const switchToChannelNumber = useCallback(
    (num: number) => {
      const fav = favorites.find((f) => f.channelNumber === num);
      if (fav) {
        const channel = playlist.find((c) => c.id === fav.id);
        if (channel) {
          setChannel(channel);
          setStreamUrl(channel.url.trim());
          window.history.replaceState(null, "",
            `/player/${channel.id}?type=live&url=${encodeURIComponent(channel.url)}&name=${encodeURIComponent(channel.name)}`
          );
          if (isXtream && creds) {
            fetchEpg(creds, Number(channel.id)).then(setEpgPrograms).catch(() => setEpgPrograms([]));
          }
          addRecent({ id: channel.id, name: channel.name, logo: channel.logo, streamType: channel.streamType });
          return;
        }
        router.replace(`/player/${fav.id}?type=live`);
      }
    },
    [favorites, playlist, setChannel, router, isXtream, creds, addRecent]
  );

  // Save position callback
  const handlePositionChange = useCallback(
    (position: number, duration: number) => {
      savePosition(id, position, duration);
    },
    [id, savePosition]
  );

  // Save position on page hide/unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Position is saved by VideoPlayer onPositionChange via the unmount effect
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Switch channel WITHOUT navigation to preserve fullscreen
  const switchChannelInPlace = useCallback((direction: "next" | "prev") => {
    if (direction === "next") next(); else prev();
    const store = usePlayerStore.getState();
    const ch = store.currentChannel;
    if (ch) {
      // Update stream URL directly - no router navigation = no fullscreen loss
      setStreamUrl(ch.url.trim());
      // Update URL bar silently without navigation
      window.history.replaceState(
        null, "",
        `/player/${ch.id}?type=live&url=${encodeURIComponent(ch.url)}`
      );
      // Refresh EPG for new channel
      if (isXtream && creds) {
        fetchEpg(creds, Number(ch.id))
          .then(setEpgPrograms)
          .catch(() => setEpgPrograms([]));
      }
      // Track in recents
      addRecent({ id: ch.id, name: ch.name, logo: ch.logo, streamType: ch.streamType });
    }
  }, [next, prev, isXtream, creds, addRecent]);

  const handleNext = useCallback(() => switchChannelInPlace("next"), [switchChannelInPlace]);
  const handlePrev = useCallback(() => switchChannelInPlace("prev"), [switchChannelInPlace]);

  // Smart back navigation using refs to avoid stale closures and duplicate history entries
  const backTargetRef = useRef<string>("/");
  const showChannelListRef = useRef(false);

  // Keep refs in sync
  useEffect(() => {
    if (type === "live") backTargetRef.current = "/live";
    else if (type === "movie") backTargetRef.current = "/movies";
    else if (type === "series") backTargetRef.current = "/series";
    else backTargetRef.current = "/";
  }, [type]);

  useEffect(() => {
    showChannelListRef.current = showChannelList;
  }, [showChannelList]);

  // Push TWO dummy history entries for robust back-trapping
  useEffect(() => {
    window.history.pushState({ trex: "player-guard" }, "");
    window.history.pushState({ trex: "player" }, "");

    const handlePopState = () => {
      if (showChannelListRef.current) {
        setShowChannelList(false);
        window.history.pushState({ trex: "player" }, "");
        return;
      }
      if (document.fullscreenElement) {
        document.exitFullscreen();
        window.history.pushState({ trex: "player" }, "");
        return;
      }
      router.push(backTargetRef.current);
      setTimeout(() => window.history.pushState({ trex: "guard" }, ""), 100);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBack = () => {
    router.push(backTargetRef.current);
  };

  // Channel select - IN-PLACE update to preserve fullscreen (TiviMate-style)
  const handleChannelSelect = (channel: typeof playlist[0]) => {
    setChannel(channel);
    setShowChannelList(false);
    setStreamUrl(channel.url.trim());
    window.history.replaceState(null, "",
      `/player/${channel.id}?type=live&url=${encodeURIComponent(channel.url)}&name=${encodeURIComponent(channel.name)}`
    );
    if (isXtream && creds) {
      fetchEpg(creds, Number(channel.id)).then(setEpgPrograms).catch(() => setEpgPrograms([]));
    }
    addRecent({ id: channel.id, name: channel.name, logo: channel.logo, streamType: channel.streamType });
  };

  if (!streamUrl) {
    return (
      <div className="flex h-full items-center justify-center bg-black">
        <p className="text-gray-500 text-sm">Kein Stream gefunden</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <VideoPlayer
        src={streamUrl}
        title={displayName}
        contentType={type as "live" | "movie" | "series"}
        initialPosition={initialPosition}
        onChannelNext={type === "live" ? handleNext : undefined}
        onChannelPrev={type === "live" ? handlePrev : undefined}
        onBack={handleBack}
        onPositionChange={handlePositionChange}
      />

      {/* Channel number overlay */}
      {channelNumberInput && (
        <div className="absolute top-6 right-6 z-30 bg-black/80 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/20">
          <p className="text-3xl font-bold text-white tabular-nums">
            {channelNumberInput}
          </p>
          <p className="text-xs text-gray-400 mt-1">Channel</p>
        </div>
      )}

      {/* EPG overlay - always shows on channel switch */}
      {type === "live" && (
        <EpgOverlay
          programs={epgPrograms}
          channelName={currentChannelName}
          channelLogo={currentChannel?.logo}
          isVisible={showEpg}
          channelNumber={playlist.indexOf(currentChannel!) + 1}
        />
      )}

      {/* Channel list toggle */}
      {type === "live" && playlist.length > 0 && (
        <button
          onClick={() => setShowChannelList(!showChannelList)}
          className="absolute top-4 right-4 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70 transition-colors"
        >
          <HiListBullet className="h-6 w-6" />
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
