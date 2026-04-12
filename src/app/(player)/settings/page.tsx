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
  const { macAddress, logout, credentials, playlistName, savedPlaylists, switchPlaylist, removePlaylist, updatePlaylist, setPlaylistName, savePlaylist, login } = useAuthStore();
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
  const [editingPlaylist, setEditingPlaylist] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editUser, setEditUser] = useState("");
  const [editPass, setEditPass] = useState("");
  const [showAddPlaylist, setShowAddPlaylist] = useState(false);
  const [addName, setAddName] = useState("");
  const [addUrl, setAddUrl] = useState("");
  const [addUser, setAddUser] = useState("");
  const [addPass, setAddPass] = useState("");
  const [addType, setAddType] = useState<"xtream" | "m3u">("xtream");

  const isLarge = fontSize === "large" || fontSize === "extra-large";
  const textBase = isLarge ? "text-lg" : "text-sm";
  const textSmall = isLarge ? "text-base" : "text-xs";

  const handleSetPin = (pin: string) => { setPin(pin); setShowSetPin(false); };
  const handleVerifyPin = (pin: string) => {
    if (pin === parentalPin) { setShowVerifyPin(false); setPinError(""); setShowSetPin(true); }
    else setPinError("Falscher PIN");
  };

  const startEditPlaylist = (pl: typeof savedPlaylists[0]) => {
    setEditingPlaylist(pl.id);
    setEditName(pl.name);
    if ("serverUrl" in pl.credentials) {
      setEditUrl(pl.credentials.serverUrl);
      setEditUser(pl.credentials.username);
      setEditPass(pl.credentials.password);
    } else {
      setEditUrl(pl.credentials.url);
      setEditUser("");
      setEditPass("");
    }
  };

  const saveEditPlaylist = () => {
    if (!editingPlaylist || !editName.trim()) return;
    const pl = savedPlaylists.find((p) => p.id === editingPlaylist);
    if (!pl) return;

    const newCreds = pl.type === "xtream"
      ? { serverUrl: editUrl, username: editUser, password: editPass }
      : { url: editUrl };

    updatePlaylist(editingPlaylist, { name: editName.trim(), credentials: newCreds });

    // If editing the active playlist, update current name too
    if (credentials && JSON.stringify(credentials) === JSON.stringify(pl.credentials)) {
      setPlaylistName(editName.trim());
    }

    setEditingPlaylist(null);
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
        <div className="flex items-center justify-between mb-3">
          <h2 className={clsx("flex items-center gap-2 font-semibold text-gray-400 uppercase tracking-wider", textSmall)}>
            <HiListBullet className="h-4 w-4" /> Playlisten
          </h2>
          <button
            onClick={() => { setShowAddPlaylist(true); setAddName(""); setAddUrl(""); setAddUser(""); setAddPass(""); setAddType("xtream"); }}
            tabIndex={0}
            className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 text-sm font-semibold hover:bg-green-500/30 focus-visible:ring-2 focus-visible:ring-green-400"
          >+ Neue Playlist</button>
        </div>
        <div className="rounded-xl glass-card divide-y divide-white/5">
          {/* Active playlist */}
          <div className="p-4 flex items-center justify-between gap-3">
            <div className="min-w-0 flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-green-500 flex-shrink-0" title="Aktiv" />
              <div className="min-w-0">
                <p className={clsx("text-white font-medium mb-0.5", textBase)}>{playlistName || "Keine Playlist"}</p>
                <p className={clsx("text-gray-500 truncate", textSmall)}>{serverUrl}</p>
              </div>
            </div>
            {credentials && (
              <button
                onClick={() => {
                  const activePl = savedPlaylists.find((p) => JSON.stringify(p.credentials) === JSON.stringify(credentials));
                  if (activePl) {
                    startEditPlaylist(activePl);
                  } else {
                    setEditingPlaylist("__active__");
                    setEditName(playlistName || "My IPTV");
                    if ("serverUrl" in credentials) {
                      setEditUrl(credentials.serverUrl);
                      setEditUser(credentials.username);
                      setEditPass(credentials.password);
                    } else if ("url" in credentials) {
                      setEditUrl(credentials.url);
                      setEditUser("");
                      setEditPass("");
                    }
                  }
                }}
                tabIndex={0}
                className="px-4 py-2 rounded-lg bg-indigo-500/20 text-indigo-400 text-sm font-medium hover:bg-indigo-500/30 focus-visible:ring-2 focus-visible:ring-indigo-400 flex-shrink-0"
              >Bearbeiten</button>
            )}
          </div>

          {/* Saved playlists */}
          {savedPlaylists.length > 0 && (
            <div className="p-4 space-y-2">
              <p className={clsx("text-gray-400 mb-2", textSmall)}>Gespeicherte Playlisten ({savedPlaylists.length}):</p>
              {savedPlaylists.map((pl) => {
                const isActive = credentials && JSON.stringify(credentials) === JSON.stringify(pl.credentials);
                return (
                  <div key={pl.id} className={clsx("flex items-center justify-between gap-2 rounded-lg p-3", isActive ? "bg-indigo-500/10 border border-indigo-500/30" : "bg-[#25253d]")}>
                    <div className="min-w-0 flex items-center gap-3">
                      {isActive && <span className="h-2.5 w-2.5 rounded-full bg-green-500 flex-shrink-0" />}
                      <div className="min-w-0">
                        <p className={clsx("text-white font-medium truncate", textBase)}>{pl.name}</p>
                        <p className={clsx("text-gray-500", textSmall)}>
                          {"serverUrl" in pl.credentials ? pl.credentials.serverUrl : pl.credentials.url}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => startEditPlaylist(pl)} tabIndex={0}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 text-sm font-medium hover:bg-amber-500/30 focus-visible:ring-2 focus-visible:ring-amber-400">
                        Bearbeiten
                      </button>
                      {!isActive && (
                        <button onClick={() => { switchPlaylist(pl.id); window.location.reload(); }} tabIndex={0}
                          className="px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 text-sm font-medium hover:bg-indigo-500/30 focus-visible:ring-2 focus-visible:ring-indigo-400">
                          Aktivieren
                        </button>
                      )}
                      <button onClick={() => removePlaylist(pl.id)} tabIndex={0}
                        className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/30 focus-visible:ring-2 focus-visible:ring-red-400">
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
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

      {/* Edit Playlist Dialog */}
      {editingPlaylist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl glass-panel p-6">
            <h3 className={clsx("font-semibold text-white mb-4", isLarge ? "text-xl" : "text-lg")}>Playlist bearbeiten</h3>
            <div className="space-y-4">
              <div>
                <label className={clsx("block text-gray-400 mb-1", textSmall)}>Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className={clsx("w-full rounded-lg bg-[#0f0f1a] border border-[#2a2a45] px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none", textBase)}
                  placeholder="Playlist-Name"
                />
              </div>
              <div>
                <label className={clsx("block text-gray-400 mb-1", textSmall)}>Server URL</label>
                <input
                  type="url"
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  className={clsx("w-full rounded-lg bg-[#0f0f1a] border border-[#2a2a45] px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono", textSmall)}
                  placeholder="http://server.com:port"
                />
              </div>
              {(editUser || editPass || (credentials && "serverUrl" in (credentials || {}))) && (
                <>
                  <div>
                    <label className={clsx("block text-gray-400 mb-1", textSmall)}>Benutzername</label>
                    <input
                      type="text"
                      value={editUser}
                      onChange={(e) => setEditUser(e.target.value)}
                      className={clsx("w-full rounded-lg bg-[#0f0f1a] border border-[#2a2a45] px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none", textBase)}
                      placeholder="Username"
                    />
                  </div>
                  <div>
                    <label className={clsx("block text-gray-400 mb-1", textSmall)}>Passwort</label>
                    <input
                      type="text"
                      value={editPass}
                      onChange={(e) => setEditPass(e.target.value)}
                      className={clsx("w-full rounded-lg bg-[#0f0f1a] border border-[#2a2a45] px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none", textBase)}
                      placeholder="Password"
                    />
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingPlaylist(null)}
                className="flex-1 rounded-xl bg-[#25253d] py-3 font-medium text-gray-300 hover:bg-[#2a2a45] transition-colors"
              >Abbrechen</button>
              <button
                onClick={() => {
                  if (editingPlaylist === "__active__") {
                    // Update the active playlist directly
                    const isXtream = editUser && editPass;
                    if (isXtream) {
                      login({ serverUrl: editUrl, username: editUser, password: editPass }, editName);
                    } else {
                      login({ url: editUrl }, editName);
                    }
                    setEditingPlaylist(null);
                  } else {
                    saveEditPlaylist();
                  }
                }}
                className="flex-1 rounded-xl bg-indigo-600 py-3 font-medium text-white hover:bg-indigo-500 transition-colors"
              >Speichern</button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Playlist Dialog */}
      {showAddPlaylist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl glass-panel p-6">
            <h3 className={clsx("font-semibold text-white mb-4", isLarge ? "text-xl" : "text-lg")}>Neue Playlist hinzufügen</h3>

            {/* Type selector */}
            <div className="flex rounded-lg border border-[#2a2a45] overflow-hidden mb-4">
              <button onClick={() => setAddType("xtream")}
                className={clsx("flex-1 px-4 py-2.5 font-medium transition-colors", textBase,
                  addType === "xtream" ? "bg-indigo-500 text-white" : "text-gray-400 hover:text-white")}>
                Xtream Codes
              </button>
              <button onClick={() => setAddType("m3u")}
                className={clsx("flex-1 px-4 py-2.5 font-medium transition-colors", textBase,
                  addType === "m3u" ? "bg-indigo-500 text-white" : "text-gray-400 hover:text-white")}>
                M3U URL
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={clsx("block text-gray-400 mb-1", textSmall)}>Name</label>
                <input type="text" value={addName} onChange={(e) => setAddName(e.target.value)}
                  className={clsx("w-full rounded-lg bg-[#0f0f1a] border border-[#2a2a45] px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none", textBase)}
                  placeholder="z.B. Mein IPTV" />
              </div>
              <div>
                <label className={clsx("block text-gray-400 mb-1", textSmall)}>
                  {addType === "xtream" ? "Server URL" : "M3U URL"}
                </label>
                <input type="url" value={addUrl} onChange={(e) => setAddUrl(e.target.value)}
                  className={clsx("w-full rounded-lg bg-[#0f0f1a] border border-[#2a2a45] px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono", textSmall)}
                  placeholder={addType === "xtream" ? "http://server.com:port" : "http://example.com/playlist.m3u"} />
              </div>
              {addType === "xtream" && (
                <>
                  <div>
                    <label className={clsx("block text-gray-400 mb-1", textSmall)}>Benutzername</label>
                    <input type="text" value={addUser} onChange={(e) => setAddUser(e.target.value)}
                      className={clsx("w-full rounded-lg bg-[#0f0f1a] border border-[#2a2a45] px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none", textBase)}
                      placeholder="Username" />
                  </div>
                  <div>
                    <label className={clsx("block text-gray-400 mb-1", textSmall)}>Passwort</label>
                    <input type="text" value={addPass} onChange={(e) => setAddPass(e.target.value)}
                      className={clsx("w-full rounded-lg bg-[#0f0f1a] border border-[#2a2a45] px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none", textBase)}
                      placeholder="Password" />
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddPlaylist(false)}
                className="flex-1 rounded-xl bg-[#25253d] py-3 font-medium text-gray-300 hover:bg-[#2a2a45] transition-colors">
                Abbrechen
              </button>
              <button
                onClick={() => {
                  if (!addName.trim() || !addUrl.trim()) return;
                  const id = Date.now().toString(36);
                  const newCreds = addType === "xtream"
                    ? { serverUrl: addUrl.trim(), username: addUser.trim(), password: addPass.trim() }
                    : { url: addUrl.trim() };
                  savePlaylist({
                    id,
                    name: addName.trim(),
                    type: addType,
                    credentials: newCreds,
                    addedAt: Date.now(),
                  });
                  // Switch to the new playlist immediately
                  login(newCreds, addName.trim());
                  setShowAddPlaylist(false);
                  window.location.reload();
                }}
                className="flex-1 rounded-xl bg-green-600 py-3 font-medium text-white hover:bg-green-500 transition-colors">
                Hinzufügen & Aktivieren
              </button>
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
