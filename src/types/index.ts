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
  startTimestamp: number;
  endTimestamp: number;
  lang?: string;
  hasArchive: boolean;
}

// Full movie details from get_vod_info
export interface MovieInfo {
  streamId: number;
  name: string;
  originalName?: string;
  cover: string;
  coverBig?: string;
  backdropPath: string[];
  rating: string;
  plot: string;
  cast: string;
  director: string;
  genre: string;
  releaseDate: string;
  year?: string;
  duration: string;
  durationSecs?: number;
  country?: string;
  youtubeTrailer?: string;
  tmdbId?: string;
  containerExtension: string;
  categoryId: string;
}

// Full series info with seasons/episodes from get_series_info
export interface SeriesInfo {
  name: string;
  cover: string;
  plot: string;
  cast: string;
  director: string;
  genre: string;
  releaseDate: string;
  rating: string;
  categoryId: string;
  backdropPath: string[];
  youtubeTrailer?: string;
  seasons: SeasonInfo[];
  episodes: Record<string, EpisodeInfo[]>;
}

export interface SeasonInfo {
  seasonNumber: number;
  name: string;
  episodeCount: number;
  cover?: string;
  coverBig?: string;
  overview?: string;
  airDate?: string;
}

export interface EpisodeInfo {
  id: string;
  episodeNum: number;
  title: string;
  containerExtension: string;
  season: number;
  info: {
    movieImage?: string;
    plot?: string;
    duration?: string;
    durationSecs?: number;
    releaseDate?: string;
    rating?: string;
  };
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
