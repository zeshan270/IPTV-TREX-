"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import {
  HiCog6Tooth,
  HiLockClosed,
  HiTrash,
  HiDeviceTablet,
  HiArrowLeftOnRectangle,
  HiCheck,
  HiShieldCheck,
} from "react-icons/hi2";
import { useAuthStore, useSettingsStore, useRecentStore, useFavoritesStore } from "@/lib/store";
import PinDialog from "@/components/ui/PinDialog";

export default function SettingsPage() {
  const router = useRouter();
  const { macAddress, logout, credentials } = useAuthStore();
  const {
    parentalPin,
    bufferSize,
    preferredFormat,
    autoplay,
    setPin,
    setBufferSize,
    setPreferredFormat,
    setAutoplay,
  } = useSettingsStore();
  const clearRecent = useRecentStore((s) => s.clear);

  const [showSetPin, setShowSetPin] = useState(false);
  const [showVerifyPin, setShowVerifyPin] = useState(false);
  const [pinError, setPinError] = useState("");
  const [pinAction, setPinAction] = useState<"set" | "change">("set");
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const handleSetPin = (pin: string) => {
    setPin(pin);
    setShowSetPin(false);
    setPinError("");
  };

  const handleVerifyPin = (pin: string) => {
    if (pin === parentalPin) {
      setShowVerifyPin(false);
      setPinError("");
      setShowSetPin(true);
    } else {
      setPinError("Incorrect PIN");
    }
  };

  const openPinSetup = () => {
    if (parentalPin) {
      setPinAction("change");
      setShowVerifyPin(true);
    } else {
      setPinAction("set");
      setShowSetPin(true);
    }
  };

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const handleClearCache = () => {
    clearRecent();
    setShowConfirmClear(false);
  };

  const serverUrl =
    credentials && "serverUrl" in credentials
      ? credentials.serverUrl
      : credentials && "url" in credentials
        ? credentials.url
        : "N/A";

  return (
    <div className="min-h-full p-4 md:p-6 lg:p-8 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold text-white mb-6">Settings</h1>

      {/* Player Settings */}
      <section className="mb-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          <HiCog6Tooth className="h-4 w-4" />
          Player
        </h2>
        <div className="rounded-xl bg-[#1a1a2e] border border-[#2a2a45] divide-y divide-[#2a2a45]">
          {/* Buffer size */}
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-white">Buffer Size</p>
              <p className="text-xs text-gray-500">
                Higher values reduce buffering but increase delay
              </p>
            </div>
            <select
              value={bufferSize}
              onChange={(e) => setBufferSize(Number(e.target.value))}
              className="rounded-lg border border-[#2a2a45] bg-[#0f0f1a] px-3 py-1.5 text-sm text-white outline-none"
            >
              <option value={1}>1s (Low)</option>
              <option value={3}>3s (Normal)</option>
              <option value={5}>5s (High)</option>
              <option value={10}>10s (Max)</option>
            </select>
          </div>

          {/* Format */}
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-white">Preferred Format</p>
              <p className="text-xs text-gray-500">
                Stream output format
              </p>
            </div>
            <div className="flex rounded-lg border border-[#2a2a45] overflow-hidden">
              <button
                onClick={() => setPreferredFormat("ts")}
                className={clsx(
                  "px-4 py-1.5 text-xs font-medium transition-colors",
                  preferredFormat === "ts"
                    ? "bg-indigo-500 text-white"
                    : "text-gray-400 hover:text-white"
                )}
              >
                TS
              </button>
              <button
                onClick={() => setPreferredFormat("m3u8")}
                className={clsx(
                  "px-4 py-1.5 text-xs font-medium transition-colors",
                  preferredFormat === "m3u8"
                    ? "bg-indigo-500 text-white"
                    : "text-gray-400 hover:text-white"
                )}
              >
                M3U8
              </button>
            </div>
          </div>

          {/* Autoplay */}
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-white">Autoplay</p>
              <p className="text-xs text-gray-500">
                Auto-play when opening a stream
              </p>
            </div>
            <button
              onClick={() => setAutoplay(!autoplay)}
              className={clsx(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                autoplay ? "bg-indigo-500" : "bg-[#2a2a45]"
              )}
            >
              <span
                className={clsx(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  autoplay ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Parental Controls */}
      <section className="mb-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          <HiShieldCheck className="h-4 w-4" />
          Parental Controls
        </h2>
        <div className="rounded-xl bg-[#1a1a2e] border border-[#2a2a45] divide-y divide-[#2a2a45]">
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-white">PIN Lock</p>
              <p className="text-xs text-gray-500">
                {parentalPin
                  ? "PIN is set. Tap to change."
                  : "Set a 4-digit PIN to lock categories"}
              </p>
            </div>
            <button
              onClick={openPinSetup}
              className="flex items-center gap-2 rounded-lg bg-indigo-500/10 px-4 py-2 text-xs font-medium text-indigo-400 hover:bg-indigo-500/20 transition-colors"
            >
              <HiLockClosed className="h-4 w-4" />
              {parentalPin ? "Change PIN" : "Set PIN"}
            </button>
          </div>
          {parentalPin && (
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-white">Remove PIN</p>
                <p className="text-xs text-gray-500">
                  Disable parental controls
                </p>
              </div>
              <button
                onClick={() => {
                  setShowVerifyPin(true);
                  setPinAction("set");
                }}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Data */}
      <section className="mb-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          <HiTrash className="h-4 w-4" />
          Data
        </h2>
        <div className="rounded-xl bg-[#1a1a2e] border border-[#2a2a45] divide-y divide-[#2a2a45]">
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-white">Clear Watch History</p>
              <p className="text-xs text-gray-500">
                Remove all recently watched items
              </p>
            </div>
            <button
              onClick={() => setShowConfirmClear(true)}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Clear
            </button>
          </div>
        </div>
      </section>

      {/* Device Info */}
      <section className="mb-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          <HiDeviceTablet className="h-4 w-4" />
          Device Info
        </h2>
        <div className="rounded-xl bg-[#1a1a2e] border border-[#2a2a45] divide-y divide-[#2a2a45]">
          <div className="flex items-center justify-between p-4">
            <p className="text-sm text-gray-400">MAC Address</p>
            <p className="text-sm text-white font-mono">
              {macAddress || "N/A"}
            </p>
          </div>
          <div className="flex items-center justify-between p-4">
            <p className="text-sm text-gray-400">Server</p>
            <p className="text-sm text-white font-mono text-right truncate max-w-[200px]">
              {serverUrl}
            </p>
          </div>
          <div className="flex items-center justify-between p-4">
            <p className="text-sm text-gray-400">App Version</p>
            <p className="text-sm text-white">1.0.0</p>
          </div>
        </div>
      </section>

      {/* Logout */}
      <section className="mb-8">
        <button
          onClick={() => setShowConfirmLogout(true)}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 py-3 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors"
        >
          <HiArrowLeftOnRectangle className="h-5 w-5" />
          Logout
        </button>
      </section>

      {/* PIN Dialogs */}
      <PinDialog
        isOpen={showSetPin}
        onClose={() => setShowSetPin(false)}
        onSubmit={handleSetPin}
        title="Set New PIN"
      />
      <PinDialog
        isOpen={showVerifyPin}
        onClose={() => {
          setShowVerifyPin(false);
          setPinError("");
        }}
        onSubmit={handleVerifyPin}
        title="Enter Current PIN"
        error={pinError}
      />

      {/* Confirm logout */}
      {showConfirmLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-[#1a1a2e] border border-[#2a2a45] p-6">
            <h3 className="text-lg font-semibold text-white mb-2">
              Confirm Logout
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              Are you sure you want to logout? You will need to re-enter your
              credentials.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmLogout(false)}
                className="flex-1 rounded-lg bg-[#25253d] py-2.5 text-sm font-medium text-gray-300 hover:bg-[#2a2a45]"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 rounded-lg bg-red-500 py-2.5 text-sm font-medium text-white hover:bg-red-400"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm clear */}
      {showConfirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-[#1a1a2e] border border-[#2a2a45] p-6">
            <h3 className="text-lg font-semibold text-white mb-2">
              Clear History
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              This will remove all your watch history. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmClear(false)}
                className="flex-1 rounded-lg bg-[#25253d] py-2.5 text-sm font-medium text-gray-300 hover:bg-[#2a2a45]"
              >
                Cancel
              </button>
              <button
                onClick={handleClearCache}
                className="flex-1 rounded-lg bg-red-500 py-2.5 text-sm font-medium text-white hover:bg-red-400"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
