"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { HiGlobeAlt, HiUser, HiLockClosed, HiLink, HiTrash, HiTag } from "react-icons/hi2";
import { useAuthStore } from "@/lib/store";
import { xtreamLogin, parseM3UFromUrl } from "@/lib/api-client";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

type Tab = "xtream" | "m3u";

const MAC_STORAGE_KEY = "iptv-trex-device-mac";

function generateMacAddress(): string {
  const hex = () =>
    Math.floor(Math.random() * 256)
      .toString(16)
      .toUpperCase()
      .padStart(2, "0");
  return `00:1A:79:${hex()}:${hex()}:${hex()}`;
}

function getOrCreateMac(): string {
  if (typeof window === "undefined") return "";
  const stored = localStorage.getItem(MAC_STORAGE_KEY);
  if (stored) return stored;
  const mac = generateMacAddress();
  localStorage.setItem(MAC_STORAGE_KEY, mac);
  return mac;
}

export default function LoginPage() {
  const router = useRouter();
  const {
    login,
    setMac,
    macAddress,
    isLoggedIn,
    savedPlaylists,
    savePlaylist,
    removePlaylist,
    switchPlaylist,
  } = useAuthStore();

  const [tab, setTab] = useState<Tab>("xtream");
  const [playlistName, setPlaylistName] = useState("");
  const [serverUrl, setServerUrl] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [m3uUrl, setM3uUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Generate MAC on first visit - single key, generate ONCE
  useEffect(() => {
    const mac = getOrCreateMac();
    if (mac && mac !== macAddress) {
      setMac(mac);
    }
  }, [macAddress, setMac]);

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      router.replace("/");
    }
  }, [isLoggedIn, router]);

  const handleXtreamLogin = async () => {
    if (!playlistName.trim()) {
      setError("Please enter a name for this playlist");
      return;
    }
    if (!serverUrl || !username || !password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const creds = {
        serverUrl: serverUrl.replace(/\/+$/, ""),
        username,
        password,
      };
      await xtreamLogin(creds);

      // Save playlist
      const playlistId = `xtream-${Date.now()}`;
      savePlaylist({
        id: playlistId,
        name: playlistName.trim(),
        type: "xtream",
        credentials: creds,
        addedAt: Date.now(),
      });

      login(creds, playlistName.trim());
      router.push("/");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Login failed. Check credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleM3ULogin = async () => {
    if (!playlistName.trim()) {
      setError("Please enter a name for this playlist");
      return;
    }
    if (!m3uUrl) {
      setError("Please enter an M3U URL");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await parseM3UFromUrl(m3uUrl);

      const creds = { url: m3uUrl };
      const playlistId = `m3u-${Date.now()}`;
      savePlaylist({
        id: playlistId,
        name: playlistName.trim(),
        type: "m3u",
        credentials: creds,
        addedAt: Date.now(),
      });

      login(creds, playlistName.trim());
      router.push("/");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load M3U playlist."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchPlaylist = (id: string) => {
    switchPlaylist(id);
    router.push("/");
  };

  const inputClass =
    "w-full rounded-xl border border-[#2a2a38] bg-[#0d0d14] py-3.5 pl-12 pr-4 text-base text-white placeholder-gray-600 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0d14] p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-amber-600/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-orange-600/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 mb-4 shadow-lg shadow-amber-500/20">
            <span className="text-3xl font-bold text-white">T</span>
          </div>
          <h1 className="text-3xl font-bold">
            <span className="gradient-text">IPTV TREX</span>
          </h1>
          <p className="text-base text-gray-500 mt-2">
            Premium Streaming Experience
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-[#181820]/80 backdrop-blur-sm border border-[#2a2a38] shadow-xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-[#2a2a38]">
            <button
              onClick={() => {
                setTab("xtream");
                setError("");
              }}
              className={clsx(
                "flex-1 py-4 text-base font-medium transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/50",
                tab === "xtream"
                  ? "text-amber-400 border-b-2 border-amber-500 bg-amber-500/5"
                  : "text-gray-500 hover:text-gray-300"
              )}
            >
              Xtream Codes
            </button>
            <button
              onClick={() => {
                setTab("m3u");
                setError("");
              }}
              className={clsx(
                "flex-1 py-4 text-base font-medium transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/50",
                tab === "m3u"
                  ? "text-amber-400 border-b-2 border-amber-500 bg-amber-500/5"
                  : "text-gray-500 hover:text-gray-300"
              )}
            >
              M3U Playlist
            </button>
          </div>

          <div className="p-6">
            {/* Error */}
            {error && (
              <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-base text-red-400">
                {error}
              </div>
            )}

            {/* Playlist Name (always visible) */}
            <div className="mb-4">
              <label className="block text-sm text-gray-500 uppercase tracking-wider mb-1.5">
                Playlist Name *
              </label>
              <div className="relative">
                <HiTag className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="text"
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                  placeholder='e.g., "My IPTV", "Family List"'
                  className={inputClass}
                />
              </div>
            </div>

            {tab === "xtream" ? (
              <div className="space-y-4">
                {/* Server URL */}
                <div>
                  <label className="block text-sm text-gray-500 uppercase tracking-wider mb-1.5">
                    Server URL
                  </label>
                  <div className="relative">
                    <HiGlobeAlt className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <input
                      type="url"
                      value={serverUrl}
                      onChange={(e) => setServerUrl(e.target.value)}
                      placeholder="http://example.com:8080"
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm text-gray-500 uppercase tracking-wider mb-1.5">
                    Username
                  </label>
                  <div className="relative">
                    <HiUser className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter username"
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm text-gray-500 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className={inputClass}
                      onKeyDown={(e) => e.key === "Enter" && handleXtreamLogin()}
                    />
                  </div>
                </div>

                <button
                  onClick={handleXtreamLogin}
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 py-4 text-base font-semibold text-white transition-all hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20 focus:outline-none focus:ring-2 focus:ring-amber-500/50 min-h-[56px]"
                >
                  {loading ? (
                    <LoadingSpinner size="sm" className="inline-flex" />
                  ) : (
                    "Login"
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* M3U URL */}
                <div>
                  <label className="block text-sm text-gray-500 uppercase tracking-wider mb-1.5">
                    M3U / M3U8 URL
                  </label>
                  <div className="relative">
                    <HiLink className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <input
                      type="url"
                      value={m3uUrl}
                      onChange={(e) => setM3uUrl(e.target.value)}
                      placeholder="http://example.com/playlist.m3u"
                      className={inputClass}
                      onKeyDown={(e) => e.key === "Enter" && handleM3ULogin()}
                    />
                  </div>
                </div>

                <button
                  onClick={handleM3ULogin}
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 py-4 text-base font-semibold text-white transition-all hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20 focus:outline-none focus:ring-2 focus:ring-amber-500/50 min-h-[56px]"
                >
                  {loading ? (
                    <LoadingSpinner size="sm" className="inline-flex" />
                  ) : (
                    "Load Playlist"
                  )}
                </button>
              </div>
            )}
          </div>

          {/* MAC Address */}
          <div className="border-t border-[#2a2a38] px-6 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Device MAC</span>
              <span className="text-sm text-gray-400 font-mono">
                {macAddress || "Generating..."}
              </span>
            </div>
          </div>
        </div>

        {/* Saved Playlists */}
        {savedPlaylists.length > 0 && (
          <div className="mt-6">
            <h3 className="text-base font-semibold text-white mb-3">
              Saved Playlists
            </h3>
            <div className="space-y-3">
              {savedPlaylists.map((pl) => {
                const displayUrl =
                  pl.type === "xtream" && "serverUrl" in pl.credentials
                    ? (pl.credentials as { serverUrl: string }).serverUrl
                    : "url" in pl.credentials
                      ? (pl.credentials as { url: string }).url
                      : "";

                return (
                  <div
                    key={pl.id}
                    className="rounded-xl bg-[#181820]/80 border border-[#2a2a38] p-4 flex items-center gap-4"
                  >
                    <button
                      onClick={() => handleSwitchPlaylist(pl.id)}
                      className="flex-1 text-left focus:outline-none focus:ring-2 focus:ring-amber-500/50 rounded-lg p-1 -m-1"
                    >
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="text-base font-medium text-white">
                            {pl.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={clsx(
                                "text-xs px-2 py-0.5 rounded-full font-medium",
                                pl.type === "xtream"
                                  ? "bg-amber-500/20 text-amber-400"
                                  : "bg-orange-500/20 text-orange-400"
                              )}
                            >
                              {pl.type === "xtream" ? "Xtream" : "M3U"}
                            </span>
                            <span className="text-xs text-gray-500 truncate max-w-[180px]">
                              {displayUrl}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => removePlaylist(pl.id)}
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50"
                    >
                      <HiTrash className="h-5 w-5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          IPTV TREX v1.0 - Premium Streaming
        </p>
      </div>
    </div>
  );
}
