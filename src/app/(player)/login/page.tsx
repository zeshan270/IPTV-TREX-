"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { HiGlobeAlt, HiUser, HiLockClosed, HiLink } from "react-icons/hi2";
import { useAuthStore } from "@/lib/store";
import { xtreamLogin, parseM3UFromUrl } from "@/lib/api-client";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

type Tab = "xtream" | "m3u";

function generateMacAddress(): string {
  const hex = () =>
    Math.floor(Math.random() * 256)
      .toString(16)
      .toUpperCase()
      .padStart(2, "0");
  return `00:1A:79:${hex()}:${hex()}:${hex()}`;
}

export default function LoginPage() {
  const router = useRouter();
  const { login, setMac, macAddress, isLoggedIn } = useAuthStore();

  const [tab, setTab] = useState<Tab>("xtream");
  const [serverUrl, setServerUrl] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [m3uUrl, setM3uUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Generate MAC on first visit
  useEffect(() => {
    if (!macAddress) {
      const stored = localStorage.getItem("iptv-trex-mac");
      if (stored) {
        setMac(stored);
      } else {
        const mac = generateMacAddress();
        localStorage.setItem("iptv-trex-mac", mac);
        setMac(mac);
      }
    }
  }, [macAddress, setMac]);

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      router.replace("/");
    }
  }, [isLoggedIn, router]);

  const handleXtreamLogin = async () => {
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
      login(creds);
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
    if (!m3uUrl) {
      setError("Please enter an M3U URL");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await parseM3UFromUrl(m3uUrl);
      login({ url: m3uUrl });
      router.push("/");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load M3U playlist."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f1a] p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-purple-600/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 shadow-lg shadow-indigo-500/20">
            <span className="text-2xl font-bold text-white">T</span>
          </div>
          <h1 className="text-3xl font-bold">
            <span className="gradient-text">IPTV TREX</span>
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Premium Streaming Experience
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-[#1a1a2e]/80 backdrop-blur-sm border border-[#2a2a45] shadow-xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-[#2a2a45]">
            <button
              onClick={() => {
                setTab("xtream");
                setError("");
              }}
              className={clsx(
                "flex-1 py-3.5 text-sm font-medium transition-all",
                tab === "xtream"
                  ? "text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/5"
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
                "flex-1 py-3.5 text-sm font-medium transition-all",
                tab === "m3u"
                  ? "text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/5"
                  : "text-gray-500 hover:text-gray-300"
              )}
            >
              M3U Playlist
            </button>
          </div>

          <div className="p-6">
            {/* Error */}
            {error && (
              <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {tab === "xtream" ? (
              <div className="space-y-4">
                {/* Server URL */}
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">
                    Server URL
                  </label>
                  <div className="relative">
                    <HiGlobeAlt className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                      type="url"
                      value={serverUrl}
                      onChange={(e) => setServerUrl(e.target.value)}
                      placeholder="http://example.com:8080"
                      className="w-full rounded-lg border border-[#2a2a45] bg-[#0f0f1a] py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-600 outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">
                    Username
                  </label>
                  <div className="relative">
                    <HiUser className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter username"
                      className="w-full rounded-lg border border-[#2a2a45] bg-[#0f0f1a] py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-600 outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full rounded-lg border border-[#2a2a45] bg-[#0f0f1a] py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-600 outline-none focus:border-indigo-500 transition-colors"
                      onKeyDown={(e) => e.key === "Enter" && handleXtreamLogin()}
                    />
                  </div>
                </div>

                <button
                  onClick={handleXtreamLogin}
                  disabled={loading}
                  className="w-full rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-sm font-semibold text-white transition-all hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
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
                  <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">
                    M3U / M3U8 URL
                  </label>
                  <div className="relative">
                    <HiLink className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                      type="url"
                      value={m3uUrl}
                      onChange={(e) => setM3uUrl(e.target.value)}
                      placeholder="http://example.com/playlist.m3u"
                      className="w-full rounded-lg border border-[#2a2a45] bg-[#0f0f1a] py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-600 outline-none focus:border-indigo-500 transition-colors"
                      onKeyDown={(e) => e.key === "Enter" && handleM3ULogin()}
                    />
                  </div>
                </div>

                <button
                  onClick={handleM3ULogin}
                  disabled={loading}
                  className="w-full rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-sm font-semibold text-white transition-all hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
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
          <div className="border-t border-[#2a2a45] px-6 py-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Device MAC</span>
              <span className="text-xs text-gray-400 font-mono">
                {macAddress || "Generating..."}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-600 mt-6">
          IPTV TREX v1.0 - Premium Streaming
        </p>
      </div>
    </div>
  );
}
