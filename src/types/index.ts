export interface Channel {
  id: string;
  name: string;
  logo: string;
  group: string;
  url: string;
  tvgId: string;
  tvgName: string;
  epgChannelId?: string;
  isLive: boolean;
  streamType: "live" | "movie" | "series";
  categoryId?: string;
  containerExtension?: string;
}

export interface Movie {
  streamId: number;
  name: string;
  streamIcon: string;
  rating: string;
  categoryId: string;
  containerExtension: string;
  added: string;
  plot?: string;
  cast?: string;
  director?: string;
  genre?: string;
  releaseDate?: string;
  duration?: string;
  tmdbId?: string;
}

export interface Episode {
  id: string;
  episodeNum: number;
  title: string;
  containerExtension: string;
  info: {
    plot?: string;
    duration?: string;
    releaseDate?: string;
    rating?: string;
    movieImage?: string;
  };
}

export interface Season {
  seasonNumber: number;
  name: string;
  episodes: Episode[];
  cover?: string;
  airDate?: string;
}

export interface Series {
  seriesId: number;
  name: string;
  cover: string;
  plot: string;
  cast: string;
  director: string;
  genre: string;
  releaseDate: string;
  rating: string;
  categoryId: string;
  lastModified: string;
  tmdbId?: string;
  seasons?: Season[];
}

export interface EpgProgram {
  id: string;
  channelId: string;
  title: string;
  description: string;
  start: string;
  end: string;
  lang?: string;
  hasArchive: boolean;
}

export interface Category {
  categoryId: string;
  categoryName: string;
  parentId: number;
}

export interface XtreamCredentials {
  serverUrl: string;
  username: string;
  password: string;
}

export interface PlaylistSource {
  id: string;
  name: string;
  type: "m3u" | "xtream";
  m3uUrl?: string;
  xtreamCredentials?: XtreamCredentials;
  isActive: boolean;
}

export interface UserInfo {
  username: string;
  password: string;
  message: string;
  auth: number;
  status: string;
  expDate: string;
  isTrial: string;
  activeCons: string;
  createdAt: string;
  maxConnections: string;
  allowedOutputFormats: string[];
}

export interface ServerInfo {
  url: string;
  port: string;
  httpsPort: string;
  serverProtocol: string;
  rtmpPort: string;
  timezone: string;
  timestampNow: number;
  timeNow: string;
}

export interface DeviceInfo {
  id: string;
  macAddress: string;
  deviceName: string;
  deviceModel: string;
  appVersion: string;
  isActive: boolean;
  activatedAt: string | null;
  lastSeenAt: string | null;
  expiresAt: string | null;
}

export interface ParsedM3UResult {
  channels: Channel[];
  epgUrl: string | null;
}

export interface XtreamAuthResponse {
  userInfo: UserInfo;
  serverInfo: ServerInfo;
}
