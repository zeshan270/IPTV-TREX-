import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  XtreamCredentials,
  Channel,
  Category,
} from "@/types";

// ==================== Auth Store ====================

interface SavedPlaylist {
  id: string;
  name: string;
  type: "xtream" | "m3u";
  credentials: XtreamCredentials | { url: string };
  addedAt: number;
}

interface AuthState {
  credentials: XtreamCredentials | { url: string } | null;
  macAddress: string;
  isLoggedIn: boolean;
  playlistName: string;
  savedPlaylists: SavedPlaylist[];
  login: (creds: XtreamCredentials | { url: string }, name?: string) => void;
  logout: () => void;
  setMac: (mac: string) => void;
  setPlaylistName: (name: string) => void;
  savePlaylist: (playlist: SavedPlaylist) => void;
  removePlaylist: (id: string) => void;
  switchPlaylist: (id: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      credentials: null,
      macAddress: "",
      isLoggedIn: false,
      playlistName: "",
      savedPlaylists: [],
      login: (creds, name) =>
        set({
          credentials: creds,
          isLoggedIn: true,
          playlistName: name || get().playlistName || "My IPTV",
        }),
      logout: () => set({ credentials: null, isLoggedIn: false, playlistName: "" }),
      setMac: (mac) => set({ macAddress: mac }),
      setPlaylistName: (name) => set({ playlistName: name }),
      savePlaylist: (playlist) => {
        const existing = get().savedPlaylists.filter((p) => p.id !== playlist.id);
        set({ savedPlaylists: [...existing, playlist] });
      },
      removePlaylist: (id) => {
        set({ savedPlaylists: get().savedPlaylists.filter((p) => p.id !== id) });
      },
      switchPlaylist: (id) => {
        const playlist = get().savedPlaylists.find((p) => p.id === id);
        if (playlist) {
          set({
            credentials: playlist.credentials,
            isLoggedIn: true,
            playlistName: playlist.name,
          });
        }
      },
    }),
    { name: "iptv-trex-auth" }
  )
);

// ==================== Player Store ====================

interface SavedPosition {
  position: number;
  duration: number;
  updatedAt: number;
}

interface PlayerState {
  currentChannel: Channel | null;
  playlist: Channel[];
  playingIndex: number;
  positions: Record<string, SavedPosition>;
  setChannel: (channel: Channel) => void;
  setPlaylist: (channels: Channel[]) => void;
  next: () => void;
  prev: () => void;
  savePosition: (streamId: string, position: number, duration: number) => void;
  getPosition: (streamId: string) => SavedPosition | null;
  getAllPositions: () => Record<string, SavedPosition>;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentChannel: null,
      playlist: [],
      playingIndex: -1,
      positions: {},
      setChannel: (channel) => {
        const idx = get().playlist.findIndex((c) => c.id === channel.id);
        set({ currentChannel: channel, playingIndex: idx >= 0 ? idx : 0 });
      },
      setPlaylist: (channels) => set({ playlist: channels }),
      next: () => {
        const { playlist, playingIndex } = get();
        if (playlist.length === 0) return;
        const nextIdx = (playingIndex + 1) % playlist.length;
        set({ playingIndex: nextIdx, currentChannel: playlist[nextIdx] });
      },
      prev: () => {
        const { playlist, playingIndex } = get();
        if (playlist.length === 0) return;
        const prevIdx = playingIndex <= 0 ? playlist.length - 1 : playingIndex - 1;
        set({ playingIndex: prevIdx, currentChannel: playlist[prevIdx] });
      },
      savePosition: (streamId, position, duration) => {
        set((state) => ({
          positions: {
            ...state.positions,
            [streamId]: { position, duration, updatedAt: Date.now() },
          },
        }));
      },
      getPosition: (streamId) => {
        return get().positions[streamId] || null;
      },
      getAllPositions: () => {
        return get().positions;
      },
    }),
    {
      name: "iptv-trex-player",
      partialize: (state) => ({ positions: state.positions }),
    }
  )
);

// ==================== Favorites Store ====================

interface FavoriteItem {
  id: string;
  name: string;
  streamType: "live" | "movie" | "series";
  logo?: string;
  categoryId?: string;
  addedAt: number;
  channelNumber?: number;
}

interface FavoritesState {
  favorites: FavoriteItem[];
  toggle: (item: Omit<FavoriteItem, "addedAt">) => void;
  isFavorite: (id: string) => boolean;
  setChannelNumber: (id: string, num: number) => void;
  reorder: (fromIndex: number, toIndex: number) => void;
  load: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      toggle: (item) => {
        const existing = get().favorites;
        const found = existing.find((f) => f.id === item.id);
        if (found) {
          set({ favorites: existing.filter((f) => f.id !== item.id) });
        } else {
          // Auto-assign next channel number for live items
          let channelNumber: number | undefined;
          if (item.streamType === "live") {
            const usedNumbers = existing
              .filter((f) => f.streamType === "live" && f.channelNumber)
              .map((f) => f.channelNumber!);
            channelNumber = 1;
            while (usedNumbers.includes(channelNumber) && channelNumber < 1000) {
              channelNumber++;
            }
          }
          set({
            favorites: [
              ...existing,
              { ...item, addedAt: Date.now(), channelNumber },
            ],
          });
        }
      },
      isFavorite: (id) => get().favorites.some((f) => f.id === id),
      setChannelNumber: (id, num) => {
        const existing = get().favorites;
        set({
          favorites: existing.map((f) =>
            f.id === id ? { ...f, channelNumber: num } : f
          ),
        });
      },
      reorder: (fromIndex, toIndex) => {
        const items = [...get().favorites];
        const [moved] = items.splice(fromIndex, 1);
        items.splice(toIndex, 0, moved);
        set({ favorites: items });
      },
      load: () => {
        // Hydration handled by persist middleware
      },
    }),
    { name: "iptv-trex-favorites" }
  )
);

// ==================== Settings Store ====================

type FontSize = "normal" | "large" | "extra-large";

interface SettingsState {
  parentalPin: string;
  lockedCategories: string[];
  bufferSize: number;
  preferredFormat: "ts" | "m3u8";
  autoplay: boolean;
  fontSize: FontSize;
  remoteControlMode: boolean;
  showChannelNumbers: boolean;
  setPin: (pin: string) => void;
  toggleLockedCategory: (categoryId: string) => void;
  setBufferSize: (size: number) => void;
  setPreferredFormat: (format: "ts" | "m3u8") => void;
  setAutoplay: (auto: boolean) => void;
  setFontSize: (size: FontSize) => void;
  setRemoteControlMode: (on: boolean) => void;
  setShowChannelNumbers: (on: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      parentalPin: "",
      lockedCategories: [],
      bufferSize: 3,
      preferredFormat: "ts",
      autoplay: true,
      fontSize: "normal" as FontSize,
      remoteControlMode: false,
      showChannelNumbers: true,
      setPin: (pin) => set({ parentalPin: pin }),
      toggleLockedCategory: (categoryId) => {
        const locked = get().lockedCategories;
        if (locked.includes(categoryId)) {
          set({ lockedCategories: locked.filter((c) => c !== categoryId) });
        } else {
          set({ lockedCategories: [...locked, categoryId] });
        }
      },
      setBufferSize: (size) => set({ bufferSize: size }),
      setPreferredFormat: (format) => set({ preferredFormat: format }),
      setAutoplay: (auto) => set({ autoplay: auto }),
      setFontSize: (size) => set({ fontSize: size }),
      setRemoteControlMode: (on) => set({ remoteControlMode: on }),
      setShowChannelNumbers: (on) => set({ showChannelNumbers: on }),
    }),
    { name: "iptv-trex-settings" }
  )
);

// ==================== Recently Watched Store ====================

interface RecentItem {
  id: string;
  name: string;
  logo?: string;
  streamType: "live" | "movie" | "series";
  watchedAt: number;
}

interface RecentState {
  items: RecentItem[];
  add: (item: Omit<RecentItem, "watchedAt">) => void;
  clear: () => void;
}

export const useRecentStore = create<RecentState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) => {
        const existing = get().items.filter((i) => i.id !== item.id);
        set({
          items: [{ ...item, watchedAt: Date.now() }, ...existing].slice(0, 50),
        });
      },
      clear: () => set({ items: [] }),
    }),
    { name: "iptv-trex-recent" }
  )
);
