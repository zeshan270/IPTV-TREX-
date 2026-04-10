import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  XtreamCredentials,
  Channel,
  Category,
} from "@/types";

// ==================== Auth Store ====================

interface AuthState {
  credentials: XtreamCredentials | { url: string } | null;
  macAddress: string;
  isLoggedIn: boolean;
  login: (creds: XtreamCredentials | { url: string }) => void;
  logout: () => void;
  setMac: (mac: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      credentials: null,
      macAddress: "",
      isLoggedIn: false,
      login: (creds) => set({ credentials: creds, isLoggedIn: true }),
      logout: () => set({ credentials: null, isLoggedIn: false }),
      setMac: (mac) => set({ macAddress: mac }),
    }),
    { name: "iptv-trex-auth" }
  )
);

// ==================== Player Store ====================

interface PlayerState {
  currentChannel: Channel | null;
  playlist: Channel[];
  playingIndex: number;
  setChannel: (channel: Channel) => void;
  setPlaylist: (channels: Channel[]) => void;
  next: () => void;
  prev: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentChannel: null,
  playlist: [],
  playingIndex: -1,
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
}));

// ==================== Favorites Store ====================

interface FavoriteItem {
  id: string;
  name: string;
  streamType: "live" | "movie" | "series";
  logo?: string;
  categoryId?: string;
  addedAt: number;
}

interface FavoritesState {
  favorites: FavoriteItem[];
  toggle: (item: Omit<FavoriteItem, "addedAt">) => void;
  isFavorite: (id: string) => boolean;
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
          set({
            favorites: [...existing, { ...item, addedAt: Date.now() }],
          });
        }
      },
      isFavorite: (id) => get().favorites.some((f) => f.id === id),
      load: () => {
        // Hydration handled by persist middleware
      },
    }),
    { name: "iptv-trex-favorites" }
  )
);

// ==================== Settings Store ====================

interface SettingsState {
  parentalPin: string;
  lockedCategories: string[];
  bufferSize: number;
  preferredFormat: "ts" | "m3u8";
  autoplay: boolean;
  setPin: (pin: string) => void;
  toggleLockedCategory: (categoryId: string) => void;
  setBufferSize: (size: number) => void;
  setPreferredFormat: (format: "ts" | "m3u8") => void;
  setAutoplay: (auto: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      parentalPin: "",
      lockedCategories: [],
      bufferSize: 3,
      preferredFormat: "ts",
      autoplay: true,
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
