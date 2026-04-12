import type {
  Category,
  Channel,
  Movie,
  Series,
  Season,
  Episode,
  EpgProgram,
  UserInfo,
  ServerInfo,
} from "@/types";

export interface XtreamAuthResult {
  userInfo: UserInfo;
  serverInfo: ServerInfo;
}

interface XtreamRawStream {
  stream_id: number;
  name: string;
  stream_icon: string;
  epg_channel_id: string;
  category_id: string;
  is_adult: string;
  added: string;
  custom_sid: string;
  tv_archive: number;
  direct_source: string;
  tv_archive_duration: number;
  container_extension?: string;
  rating?: string;
  plot?: string;
  cast?: string;
  director?: string;
  genre?: string;
  releaseDate?: string;
  duration?: string;
  tmdb_id?: string;
  num?: number;
}

interface XtreamRawCategory {
  category_id: string;
  category_name: string;
  parent_id: number;
}

interface XtreamRawSeries {
  series_id: number;
  name: string;
  cover: string;
  plot: string;
  cast: string;
  director: string;
  genre: string;
  releaseDate: string;
  rating: string;
  category_id: string;
  last_modified: string;
  tmdb_id?: string;
}

interface XtreamRawEpisode {
  id: string;
  episode_num: number;
  title: string;
  container_extension: string;
  info: {
    plot?: string;
    duration?: string;
    releasedate?: string;
    rating?: string;
    movie_image?: string;
  };
}

interface XtreamRawSeriesInfo {
  seasons: Array<{
    season_number: number;
    name: string;
    cover?: string;
    air_date?: string;
  }>;
  episodes: Record<string, XtreamRawEpisode[]>;
  info: XtreamRawSeries;
}

interface XtreamRawEpg {
  epg_listings: Array<{
    id: string;
    channel_id: string;
    title: string;
    description: string;
    start: string;
    end: string;
    lang?: string;
    has_archive: number;
  }>;
}

export class XtreamClient {
  private serverUrl: string;
  private username: string;
  private password: string;
  private authenticated = false;

  constructor(serverUrl: string, username: string, password: string) {
    this.serverUrl = serverUrl.replace(/\/+$/, "");
    this.username = username;
    this.password = password;
  }

  private buildApiUrl(action: string, params: Record<string, string> = {}): string {
    const url = new URL(`${this.serverUrl}/player_api.php`);
    url.searchParams.set("username", this.username);
    url.searchParams.set("password", this.password);
    if (action) url.searchParams.set("action", action);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
    return url.toString();
  }

  /**
   * Strip lone Unicode surrogates that break JSON serialization.
   */
  private static stripSurrogates(text: string): string {
    // eslint-disable-next-line no-control-regex
    return text.replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/g, "\uFFFD")
               .replace(/(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, "\uFFFD");
  }

  private async fetchApi<T>(action: string, params: Record<string, string> = {}): Promise<T> {
    const url = this.buildApiUrl(action, params);
    const response = await fetch(url, {
      headers: { "User-Agent": "IPTV-TREX/1.0" },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      throw new Error(`Xtream API error: ${response.status} ${response.statusText}`);
    }
    const text = await response.text();
    const sanitized = XtreamClient.stripSurrogates(text);
    return JSON.parse(sanitized) as T;
  }

  async authenticate(): Promise<XtreamAuthResult> {
    const data = await this.fetchApi<{
      user_info: Record<string, string>;
      server_info: Record<string, string | number>;
    }>("");

    if (!data.user_info || data.user_info.auth === "0") {
      throw new Error("Authentication failed: Invalid credentials");
    }

    this.authenticated = true;

    const userInfo: UserInfo = {
      username: String(data.user_info.username ?? ""),
      password: String(data.user_info.password ?? ""),
      message: String(data.user_info.message ?? ""),
      auth: Number(data.user_info.auth ?? 0),
      status: String(data.user_info.status ?? ""),
      expDate: String(data.user_info.exp_date ?? ""),
      isTrial: String(data.user_info.is_trial ?? ""),
      activeCons: String(data.user_info.active_cons ?? ""),
      createdAt: String(data.user_info.created_at ?? ""),
      maxConnections: String(data.user_info.max_connections ?? ""),
      allowedOutputFormats: Array.isArray(data.user_info.allowed_output_formats)
        ? data.user_info.allowed_output_formats
        : [],
    };

    const serverInfo: ServerInfo = {
      url: String(data.server_info.url ?? ""),
      port: String(data.server_info.port ?? ""),
      httpsPort: String(data.server_info.https_port ?? ""),
      serverProtocol: String(data.server_info.server_protocol ?? ""),
      rtmpPort: String(data.server_info.rtmp_port ?? ""),
      timezone: String(data.server_info.timezone ?? ""),
      timestampNow: Number(data.server_info.timestamp_now ?? 0),
      timeNow: String(data.server_info.time_now ?? ""),
    };

    return { userInfo, serverInfo };
  }

  private mapCategory(raw: XtreamRawCategory): Category {
    return {
      categoryId: raw.category_id,
      categoryName: raw.category_name,
      parentId: raw.parent_id,
    };
  }

  async getLiveCategories(): Promise<Category[]> {
    const data = await this.fetchApi<XtreamRawCategory[]>("get_live_categories");
    return Array.isArray(data) ? data.map((c) => this.mapCategory(c)) : [];
  }

  async getLiveStreams(categoryId?: string): Promise<Channel[]> {
    const params: Record<string, string> = {};
    if (categoryId) params.category_id = categoryId;
    const data = await this.fetchApi<XtreamRawStream[]>("get_live_streams", params);
    if (!Array.isArray(data)) return [];
    return data.map((s) => ({
      id: String(s.stream_id),
      name: s.name,
      logo: s.stream_icon || "",
      group: s.category_id || "",
      url: this.buildStreamUrl("live", s.stream_id),
      tvgId: s.epg_channel_id || "",
      tvgName: s.name,
      epgChannelId: s.epg_channel_id || undefined,
      isLive: true,
      streamType: "live" as const,
      categoryId: s.category_id || undefined,
    }));
  }

  async getVodCategories(): Promise<Category[]> {
    const data = await this.fetchApi<XtreamRawCategory[]>("get_vod_categories");
    return Array.isArray(data) ? data.map((c) => this.mapCategory(c)) : [];
  }

  async getVodStreams(categoryId?: string): Promise<Movie[]> {
    const params: Record<string, string> = {};
    if (categoryId) params.category_id = categoryId;
    const data = await this.fetchApi<XtreamRawStream[]>("get_vod_streams", params);
    if (!Array.isArray(data)) return [];
    return data.map((s) => ({
      streamId: s.stream_id,
      name: s.name,
      streamIcon: s.stream_icon || "",
      rating: s.rating || "",
      categoryId: s.category_id || "",
      containerExtension: s.container_extension || "mp4",
      added: s.added || "",
      plot: s.plot,
      cast: s.cast,
      director: s.director,
      genre: s.genre,
      releaseDate: s.releaseDate,
      duration: s.duration,
      tmdbId: s.tmdb_id,
    }));
  }

  async getSeriesCategories(): Promise<Category[]> {
    const data = await this.fetchApi<XtreamRawCategory[]>("get_series_categories");
    return Array.isArray(data) ? data.map((c) => this.mapCategory(c)) : [];
  }

  async getSeries(categoryId?: string): Promise<Series[]> {
    const params: Record<string, string> = {};
    if (categoryId) params.category_id = categoryId;
    const data = await this.fetchApi<XtreamRawSeries[]>("get_series", params);
    if (!Array.isArray(data)) return [];
    return data.map((s) => ({
      seriesId: s.series_id,
      name: s.name,
      cover: s.cover || "",
      plot: s.plot || "",
      cast: s.cast || "",
      director: s.director || "",
      genre: s.genre || "",
      releaseDate: s.releaseDate || "",
      rating: s.rating || "",
      categoryId: s.category_id || "",
      lastModified: s.last_modified || "",
      tmdbId: s.tmdb_id,
    }));
  }

  async getSeriesInfo(seriesId: number): Promise<Series> {
    const data = await this.fetchApi<XtreamRawSeriesInfo>("get_series_info", {
      series_id: String(seriesId),
    });

    const info = data.info;
    const seasons: Season[] = (data.seasons || []).map((s) => {
      const seasonEpisodes = data.episodes[String(s.season_number)] || [];
      const episodes: Episode[] = seasonEpisodes.map((e) => ({
        id: e.id,
        episodeNum: e.episode_num,
        title: e.title,
        containerExtension: e.container_extension || "mp4",
        info: {
          plot: e.info?.plot,
          duration: e.info?.duration,
          releaseDate: e.info?.releasedate,
          rating: e.info?.rating,
          movieImage: e.info?.movie_image,
        },
      }));
      return {
        seasonNumber: s.season_number,
        name: s.name,
        episodes,
        cover: s.cover,
        airDate: s.air_date,
      };
    });

    return {
      seriesId: info.series_id,
      name: info.name,
      cover: info.cover || "",
      plot: info.plot || "",
      cast: info.cast || "",
      director: info.director || "",
      genre: info.genre || "",
      releaseDate: info.releaseDate || "",
      rating: info.rating || "",
      categoryId: info.category_id || "",
      lastModified: info.last_modified || "",
      tmdbId: info.tmdb_id,
      seasons,
    };
  }

  async getEpg(streamId: number): Promise<EpgProgram[]> {
    const data = await this.fetchApi<XtreamRawEpg>("get_short_epg", {
      stream_id: String(streamId),
    });
    if (!data.epg_listings || !Array.isArray(data.epg_listings)) return [];
    return data.epg_listings.map((e) => ({
      id: e.id,
      channelId: e.channel_id,
      title: e.title ? Buffer.from(e.title, "base64").toString("utf-8") : "",
      description: e.description
        ? Buffer.from(e.description, "base64").toString("utf-8")
        : "",
      start: e.start,
      end: e.end,
      lang: e.lang,
      hasArchive: e.has_archive === 1,
    }));
  }

  async getFullEpg(streamId: number): Promise<EpgProgram[]> {
    const data = await this.fetchApi<XtreamRawEpg>("get_simple_data_table", {
      stream_id: String(streamId),
    });
    if (!data.epg_listings || !Array.isArray(data.epg_listings)) return [];
    return data.epg_listings.map((e) => ({
      id: e.id,
      channelId: e.channel_id,
      title: e.title ? Buffer.from(e.title, "base64").toString("utf-8") : "",
      description: e.description
        ? Buffer.from(e.description, "base64").toString("utf-8")
        : "",
      start: e.start,
      end: e.end,
      lang: e.lang,
      hasArchive: e.has_archive === 1,
    }));
  }

  buildStreamUrl(
    type: "live" | "movie" | "series",
    streamId: number,
    extension = "ts"
  ): string {
    return `${this.serverUrl}/${type}/${this.username}/${this.password}/${streamId}.${extension}`;
  }
}
