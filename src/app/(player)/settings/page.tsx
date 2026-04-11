"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import {
  HiCog6Tooth, HiLockClosed, HiTrash, HiDeviceTablet,
  HiArrowLeftOnRectangle, HiShieldCheck, HiTv, HiEye,
  HiLanguage, HiSignal, HiListBullet,
} from "react-icons/hi2";
import { useAuthStore, useSettingsStore, useRecentStore } from "@/lib/store";
import PinDialog from "@/components/ui/PinDialog";

export default function SettingsPage() {
  const router = useRouter();
  const { macAddress, logout, credentials, playlistName, savedPlaylists, switchPlaylist, removePlaylist } = useAuthStore();
  const {
    parentalPin, bufferSize, preferredFormat, autoplay,
    fontSize, remoteControlMode, showChannelNumbers,
    setPin, setBufferSize, setPreferredFormat, setAutoplay,
    setFontSize, setRemoteControlMode, setShowChannelNumbers,
  } = useSettingsStore();
  const clearRecent = useRecentStore((s) => s.clear);

  const [showSetPin, setShowSetPin] = useState(false);
  const [showVerifyPin, setShowVerifyPin] = useState(false);
  const [pinError, setPinError] = useState("");
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const isLarge = fontSize === "large" || fontSize === "extra-large";
  const textBase = isLarge ? "text-lg" : "text-sm";
  const textSmall = isLarge ? "text-base" : "text-xs";

  const handleSetPin = (pin: string) => { setPin(pin); setShowSetPin(false); };
  const handleVerifyPin = (pin: string) => {
    if (pin === parentalPin) { setShowVerifyPin(false); setPinError(""); setShowSetPin(true); }
    else setPinError("Falscher PIN");
  };

  const openPinSetup = () => {
    if (parentalPin) { setShowVerifyPin(true); } else { setShowSetPin(true); }
  };

  const serverUrl = credentials && "serverUrl" in credentials ? credentials.serverUrl : credentials && "url" in credentials ? credentials.url : "N/A";

  const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
    <button
      onClick={onToggle}
      tabIndex={0}
      className={clsx(
        "relative inline-flex items-center rounded-full transition-colors focus-visible:ring-4 focus-visible:ring-blue-400",
        isLarge ? "h-8 w-14" : "h-6 w-11",
        on ? "bg-indigo-500" : "bg-[#2a2a45]"
      )}
    >
      <span className={clsx(
        "inline-block transform rounded-full bg-white transition-transform",
        isLarge ? "h-6 w-6" : "h-4 w-4",
        on ? (isLarge ? "translate-x-7" : "translate-x-6") : "translate-x-1"
      )} />
    </button>
  );

  const SettingRow = ({ icon: Icon, title, desc, children }: { icon: any; title: string; desc: string; children: React.ReactNode }) => (
    <div className="flex items-center justify-between p-4 gap-4">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Icon className={clsx("flex-shrink-0 text-gray-400", isLarge ? "h-6 w-6" : "h-5 w-5")} />
        <div className="min-w-0">
          <p className={clsx("text-white font-medium", textBase)}>{title}</p>
          <p className={clsx("text-gray-500", textSmall)}>{desc}</p>
        </div>
      </div>
      {children}
    </div>
  );

  return (
    <div className="min-h-full p-4 md:p-6 lg:p-8 max-w-3xl mx-auto">
      <h1 className={clsx("font-bold text-white mb-6", isLarge ? "text-3xl" : "text-xl")}>⚙️ Einstellungen</h1>

      {/* Playlist Management */}
      <section className="mb-6">
        <h2 className={clsx("flex items-center gap-2 font-semibold text-gray-400 uppercase tracking-wider mb-3", textSmall)}>
          <HiListBullet className="h-4 w-4" /> Playlisten
        </h2>
        <div className="rounded-xl glass-card divide-y divide-white/5">
          <div className="p-4">
            <p className={clsx("text-white font-medium mb-1", textBase)}>Aktive Playlist: <span className="text-indigo-400">{playlistName || "Keine"}</span></p>
            <p className={clsx("text-gray-500", textSmall)}>Server: {serverUrl}</p>
          </div>
          {savedPlaylists.length > 1 && (
            <div className="p-4 space-y-2">
              <p className={clsx("text-gray-400 mb-2", textSmall)}>Gespeicherte Playlisten:</p>
              {savedPlaylists.map((pl) => (
                <div key={pl.id} className="flex items-center justify-between gap-2 bg-[#25253d] rounded-lg p-3">
                  <div className="min-w-0">
                    <p className={clsx("text-white font-medium truncate", textBase)}>{pl.name}</p>
                    <p className={clsx("text-gray-500", textSmall)}>{pl.type.toUpperCase()}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => switchPlaylist(pl.id)}
                      tabIndex={0}
                      className="px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 text-sm font-medium hover:bg-indigo-500/30 focus-visible:ring-2 focus-visible:ring-indigo-400"
                    >Wechseln</button>
                    <button
                      onClick={() => removePlaylist(pl.id)}
                      tabIndex={0}
                      className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/30 focus-visible:ring-2 focus-visible:ring-red-400"
                    >✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Display & Accessibility */}
      <section className="mb-6">
        <h2 className={clsx("flex items-center gap-2 font-semibold text-gray-400 uppercase tracking-wider mb-3", textSmall)}>
          <HiEye className="h-4 w-4" /> Anzeige & Bedienung
        </h2>
        <div className="rounded-xl glass-card divide-y divide-white/5">
          <SettingRow icon={HiLanguage} title="Schriftgröße" desc="Für bessere Lesbarkeit vergrößern">
            <div className="flex rounded-lg border border-[#2a2a45] overflow-hidden">
              {(["normal", "large", "extra-large"] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  tabIndex={0}
                  className={clsx(
                    "px-3 py-2 font-medium transition-colors focus-visible:ring-2 focus-visible:ring-blue-400",
                    isLarge ? "text-base" : "text-xs",
                    fontSize === size ? "bg-indigo-500 text-white" : "text-gray-400 hover:text-white"
                  )}
                >
                  {size === "normal" ? "Normal" : size === "large" ? "Groß" : "Sehr Groß"}
                </button>
              ))}
            </div>
          </SettingRow>

          <SettingRow icon={HiTv} title="Fernbedienungs-Modus" desc="Größere Buttons und einfachere Bedienung">
            <Toggle on={remoteControlMode} onToggle={() => setRemoteControlMode(!remoteControlMode)} />
          </SettingRow>

          <SettingRow icon={HiSignal} title="Kanalnummern anzeigen" desc="Nummern auf Favoriten für schnellen Zugriff">
            <Toggle on={showChannelNumbers} onToggle={() => setShowChannelNumbers(!showChannelNumbers)} />
          </SettingRow>
        </div>
      </section>

      {/* Player Settings */}
      <section className="mb-6">
        <h2 className={clsx("flex items-center gap-2 font-semibold text-gray-400 uppercase tracking-wider mb-3", textSmall)}>
          <HiCog6Tooth className="h-4 w-4" /> Player
        </h2>
        <div className="rounded-xl glass-card divide-y divide-white/5">
          <SettingRow icon={HiSignal} title="Buffer-Größe" desc="Höhere Werte = weniger Puffer-Unterbrechungen">
            <select value={bufferSize} onChange={(e) => setBufferSize(Number(e.target.value))}
              className={clsx("rounded-lg border border-[#2a2a45] bg-[#0f0f1a] px-3 py-2 text-white focus-visible:ring-2 focus-visible:ring-blue-400", textBase)}>
              <option value={1}>1s (Niedrig)</option>
              <option value={3}>3s (Normal)</option>
              <option value={5}>5s (Hoch)</option>
              <option value={10}>10s (Maximum)</option>
            </select>
          </SettingRow>

          <SettingRow icon={HiCog6Tooth} title="Format" desc="Stream-Ausgabeformat">
            <div className="flex rounded-lg border border-[#2a2a45] overflow-hidden">
              {(["ts", "m3u8"] as const).map((fmt) => (
                <button key={fmt} onClick={() => setPreferredFormat(fmt)}
                  className={clsx("px-4 py-2 font-medium transition-colors", textBase,
                    preferredFormat === fmt ? "bg-indigo-500 text-white" : "text-gray-400 hover:text-white"
                  )}>{fmt.toUpperCase()}</button>
              ))}
            </div>
          </SettingRow>

          <SettingRow icon={HiCog6Tooth} title="Autoplay" desc="Automatisch abspielen beim Öffnen">
            <Toggle on={autoplay} onToggle={() => setAutoplay(!autoplay)} />
          </SettingRow>
        </div>
      </section>

      {/* Parental Controls */}
      <section className="mb-6">
        <h2 className={clsx("flex items-center gap-2 font-semibold text-gray-400 uppercase tracking-wider mb-3", textSmall)}>
          <HiShieldCheck className="h-4 w-4" /> Kindersicherung
        </h2>
        <div className="rounded-xl glass-card divide-y divide-white/5">
          <SettingRow icon={HiLockClosed} title="PIN-Sperre" desc={parentalPin ? "PIN ist gesetzt. Tippen zum Ändern." : "4-stellige PIN zum Sperren festlegen"}>
            <button onClick={openPinSetup} tabIndex={0}
              className={clsx("flex items-center gap-2 rounded-lg bg-indigo-500/10 px-4 py-2 font-medium text-indigo-400 hover:bg-indigo-500/20 focus-visible:ring-2 focus-visible:ring-blue-400", textSmall)}>
              <HiLockClosed className="h-4 w-4" />
              {parentalPin ? "Ändern" : "Festlegen"}
            </button>
          </SettingRow>
        </div>
      </section>

      {/* Data */}
      <section className="mb-6">
        <h2 className={clsx("flex items-center gap-2 font-semibold text-gray-400 uppercase tracking-wider mb-3", textSmall)}>
          <HiTrash className="h-4 w-4" /> Daten
        </h2>
        <div className="rounded-xl glass-card">
          <SettingRow icon={HiTrash} title="Verlauf löschen" desc="Alle zuletzt gesehenen Einträge entfernen">
            <button onClick={() => setShowConfirmClear(true)} tabIndex={0}
              className={clsx("text-red-400 hover:text-red-300 font-medium focus-visible:ring-2 focus-visible:ring-red-400 rounded px-2 py-1", textBase)}>
              Löschen
            </button>
          </SettingRow>
        </div>
      </section>

      {/* Device Info */}
      <section className="mb-6">
        <h2 className={clsx("flex items-center gap-2 font-semibold text-gray-400 uppercase tracking-wider mb-3", textSmall)}>
          <HiDeviceTablet className="h-4 w-4" /> Gerät
        </h2>
        <div className="rounded-xl glass-card divide-y divide-white/5">
          <div className="flex items-center justify-between p-4">
            <p className={clsx("text-gray-400", textBase)}>MAC-Adresse</p>
            <p className={clsx("text-white font-mono font-bold", textBase)}>{macAddress || "N/A"}</p>
          </div>
          <div className="flex items-center justify-between p-4">
            <p className={clsx("text-gray-400", textBase)}>App-Version</p>
            <p className={clsx("text-white", textBase)}>IPTV TREX v1.0.0</p>
          </div>
        </div>
      </section>

      {/* Logout */}
      <button onClick={() => setShowConfirmLogout(true)} tabIndex={0}
        className={clsx("w-full flex items-center justify-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 py-4 font-medium text-red-400 hover:bg-red-500/20 transition-colors mb-8 focus-visible:ring-4 focus-visible:ring-red-400", textBase)}>
        <HiArrowLeftOnRectangle className="h-5 w-5" /> Abmelden
      </button>

      {/* Dialogs */}
      <PinDialog isOpen={showSetPin} onClose={() => setShowSetPin(false)} onSubmit={handleSetPin} title="Neue PIN festlegen" />
      <PinDialog isOpen={showVerifyPin} onClose={() => { setShowVerifyPin(false); setPinError(""); }} onSubmit={handleVerifyPin} title="Aktuelle PIN eingeben" error={pinError} />

      {showConfirmLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl glass-panel p-6">
            <h3 className={clsx("font-semibold text-white mb-2", isLarge ? "text-xl" : "text-lg")}>Abmelden?</h3>
            <p className={clsx("text-gray-400 mb-6", textBase)}>Du musst dich erneut anmelden.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirmLogout(false)} className="flex-1 rounded-lg bg-[#25253d] py-3 font-medium text-gray-300 hover:bg-[#2a2a45]">Abbrechen</button>
              <button onClick={() => { logout(); router.replace("/login"); }} className="flex-1 rounded-lg bg-red-500 py-3 font-medium text-white hover:bg-red-400">Abmelden</button>
            </div>
          </div>
        </div>
      )}

      {showConfirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl glass-panel p-6">
            <h3 className={clsx("font-semibold text-white mb-2", isLarge ? "text-xl" : "text-lg")}>Verlauf löschen?</h3>
            <p className={clsx("text-gray-400 mb-6", textBase)}>Alle Einträge werden unwiderruflich gelöscht.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirmClear(false)} className="flex-1 rounded-lg bg-[#25253d] py-3 font-medium text-gray-300 hover:bg-[#2a2a45]">Abbrechen</button>
              <button onClick={() => { clearRecent(); setShowConfirmClear(false); }} className="flex-1 rounded-lg bg-red-500 py-3 font-medium text-white hover:bg-red-400">Löschen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
