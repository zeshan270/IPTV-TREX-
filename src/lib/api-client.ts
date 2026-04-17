import type {
  XtreamCredentials,
  Category,
  Channel,
  Movie,
  Series,
  EpgProgram,
  XtreamAuthResponse,
  ParsedM3UResult,
  MovieInfo,
  SeriesInfo,
  SeasonInfo,
  EpisodeInfo,
} from "@/types";
import { extractCountryFromGroup, type CountryInfo } from "./countries";

// ==================== Response Cache ====================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

const CACHE_TTL_CATEGORIES = 5 * 60 * 1000; // 5 minutes
const CACHE_TTL_STREAMS = 10 * 60 * 1000; // 10 minutes

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > entry.ttl) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache<T>(key: string, data: T, ttl: number): void {
  cache.set(key, { data, timestamp: Date.now(), ttl });
}

export function clearCache(): void {
  cache.clear();
}

// ==================== Xtream API Client ====================

function buildBaseUrl(creds: XtreamCredentials): string {
  return creds.serverUrl.trim().replace(/\/+$/, "");
}

function buildApiUrl(creds: XtreamCredentials, action?: string): string {
  const base = buildBaseUrl(creds);
  let url = `${base}/player_api.php?username=${encodeURIComponent(creds.username)}&password=${encodeURIComponent(creds.password)}`;
  if (action) url += `&action=${action}`;
  return url;
}

function buildCacheKey(creds: XtreamCredentials, action: string, extra?: string): string {
  return `${creds.serverUrl}:${creds.username}:${action}${extra ? `:${extra}` : ""}`;
}

/**
 * Strip lone Unicode surrogates that break JSON serialization.
 * IPTV servers often return data with invalid Unicode characters.
 */
function stripSurrogates(text: string): string {
  // eslint-disable-next-line no-control-regex
  return text.replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/g, "\uFFFD")
             .replace(/(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, "\uFFFD");
}

/**
 * Check if a URL is external (points to an IPTV server, not our own app).
 */
function isExternalUrl(url: string): boolean {
  if (url.startsWith("/")) return false;
  if (typeof window === "undefined") return true;
  try {
    const parsed = new URL(url);
    return parsed.origin !== window.location.origin;
  } catch {
    return true;
  }
}

/**
 * Fetch JSON from a URL. Always proxies external URLs to bypass CORS
 * (IPTV servers don't send CORS headers) and mixed content blocking.
 * Sanitizes response text to remove lone surrogates before parsing.
 */
async function fetchJson<T>(rawUrl: string): Promise<T> {
  const url = rawUrl.trim();
  // Always proxy external URLs - IPTV servers don't send CORS headers
  const needsProxy = typeof window !== "undefined" && isExternalUrl(url);
  const fetchUrl = needsProxy ? `/api/proxy?url=${encodeURIComponent(url)}` : url;

  const res = await fetch(fetchUrl);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  const text = await res.text();
  const sanitized = stripSurrogates(text);
  return JSON.parse(sanitized) as T;
}

export async function xtreamLogin(
  creds: XtreamCredentials
): Promise<XtreamAuthResponse> {
  const url = buildApiUrl(creds);
  const data = await fetchJson<{
    user_info: Record<string, unknown>;
    server_info: Record<string, unknown>;
  }>(url);

  if (!data.user_info || data.user_info.auth === 0) {
    throw new Error("Authentication failed. Check your credentials.");
  }

  return {
    userInfo: {
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
      allowedOutputFormats: (data.user_info.allowed_output_formats as string[]) ?? [],
    },
    serverInfo: {
      url: String(data.server_info.url ?? ""),
      port: String(data.server_info.port ?? ""),
      httpsPort: String(data.server_info.https_port ?? ""),
      serverProtocol: String(data.server_info.server_protocol ?? ""),
      rtmpPort: String(data.server_info.rtmp_port ?? ""),
      timezone: String(data.server_info.timezone ?? ""),
      timestampNow: Number(data.server_info.timestamp_now ?? 0),
      timeNow: String(data.server_info.time_now ?? ""),
    },
  };
}

export async function fetchLiveCategories(
  creds: XtreamCredentials
): Promise<Category[]> {
  const cacheKey = buildCacheKey(creds, "get_live_categories");
  const cached = getCached<Category[]>(cacheKey);
  if (cached) return cached;

  const url = buildApiUrl(creds, "get_live_categories");
  const data = await fetchJson<
    { category_id: string; category_name: string; parent_id: number }[]
  >(url);
  const result = data.map((c) => ({
    categoryId: c.category_id,
    categoryName: c.category_name,
    parentId: c.parent_id,
  }));

  setCache(cacheKey, result, CACHE_TTL_CATEGORIES);
  return result;
}

export async function fetchLiveStreams(
  creds: XtreamCredentials,
  categoryId?: string
): Promise<Channel[]> {
  const cacheKey = buildCacheKey(creds, "get_live_streams", categoryId);
  const cached = getCached<Channel[]>(cacheKey);
  if (cached) return cached;

  let url = buildApiUrl(creds, "get_live_streams");
  if (categoryId) url += `&category_id=${categoryId}`;
  const data = await fetchJson<Record<string, unknown>[]>(url);
  const result = data.map((s) => ({
    id: String(s.stream_id ?? ""),
    name: String(s.name ?? ""),
    logo: String(s.stream_icon ?? ""),
    group: String(s.category_id ?? ""),
    url: buildStreamUrl(creds, Number(s.stream_id), "live", "m3u8"),
    tvgId: String(s.epg_channel_id ?? ""),
    tvgName: String(s.name ?? ""),
    epgChannelId: String(s.epg_channel_id ?? ""),
    isLive: true,
    streamType: "live" as const,
    categoryId: String(s.category_id ?? ""),
  }));

  setCache(cacheKey, result, CACHE_TTL_STREAMS);
  return result;
}

export async function fetchVodCategories(
  creds: XtreamCredentials
): Promise<Category[]> {
  const cacheKey = buildCacheKey(creds, "get_vod_categories");
  const cached = getCached<Category[]>(cacheKey);
  if (cached) return cached;

  const url = buildApiUrl(creds, "get_vod_categories");
  const data = await fetchJson<
    { category_id: string; category_name: string; parent_id: number }[]
  >(url);
  const result = data.map((c) => ({
    categoryId: c.category_id,
    categoryName: c.category_name,
    parentId: c.parent_id,
  }));

  setCache(cacheKey, result, CACHE_TTL_CATEGORIES);
  return result;
}

export async function fetchVodStreams(
  creds: XtreamCredentials,
  categoryId?: string
): Promise<Movie[]> {
  const cacheKey = buildCacheKey(creds, "get_vod_streams", categoryId);
  const cached = getCached<Movie[]>(cacheKey);
  if (cached) return cached;

  let url = buildApiUrl(creds, "get_vod_streams");
  if (categoryId) url += `&category_id=${categoryId}`;
  const data = await fetchJson<Record<string, unknown>[]>(url);
  const result = data.map((s) => ({
    streamId: Number(s.stream_id ?? 0),
    name: String(s.name ?? ""),
    streamIcon: String(s.stream_icon ?? ""),
    rating: String(s.rating ?? "0"),
    categoryId: String(s.category_id ?? ""),
    containerExtension: String(s.container_extension ?? "mp4"),
    added: String(s.added ?? ""),
    plot: s.plot ? String(s.plot) : undefined,
    cast: s.cast ? String(s.cast) : undefined,
    director: s.director ? String(s.director) : undefined,
    genre: s.genre ? String(s.genre) : undefined,
    releaseDate: s.release_date ? String(s.release_date) : undefined,
    duration: s.duration ? String(s.duration) : undefined,
  }));

  setCache(cacheKey, result, CACHE_TTL_STREAMS);
  return result;
}

export async function fetchSeriesCategories(
  creds: XtreamCredentials
): Promise<Category[]> {
  const cacheKey = buildCacheKey(creds, "get_series_categories");
  const cached = getCached<Category[]>(cacheKey);
  if (cached) return cached;

  const url = buildApiUrl(creds, "get_series_categories");
  const data = await fetchJson<
    { category_id: string; category_name: string; parent_id: number }[]
  >(url);
  const result = data.map((c) => ({
    categoryId: c.category_id,
    categoryName: c.category_name,
    parentId: c.parent_id,
  }));

  setCache(cacheKey, result, CACHE_TTL_CATEGORIES);
  return result;
}

export async function fetchSeries(
  creds: XtreamCredentials,
  categoryId?: string
): Promise<Series[]> {
  const cacheKey = buildCacheKey(creds, "get_series", categoryId);
  const cached = getCached<Series[]>(cacheKey);
  if (cached) return cached;

  let url = buildApiUrl(creds, "get_series");
  if (categoryId) url += `&category_id=${categoryId}`;
  const data = await fetchJson<Record<string, unknown>[]>(url);
  const result = data.map((s) => ({
    seriesId: Number(s.series_id ?? 0),
    name: String(s.name ?? ""),
    cover: String(s.cover ?? ""),
    plot: String(s.plot ?? ""),
    cast: String(s.cast ?? ""),
    director: String(s.director ?? ""),
    genre: String(s.genre ?? ""),
    releaseDate: String(s.release_date ?? ""),
    rating: String(s.rating ?? "0"),
    categoryId: String(s.category_id ?? ""),
    lastModified: String(s.last_modified ?? ""),
  }));

  setCache(cacheKey, result, CACHE_TTL_STREAMS);
  return result;
}

export async function fetchSeriesInfo(
  creds: XtreamCredentials,
  seriesId: number
): Promise<{
  info: Series;
  episodes: Record<
    string,
    {
      id: string;
      episode_num: number;
      title: string;
      container_extension: string;
      info: Record<string, unknown>;
      season: number;
    }[]
  >;
}> {
  const url = buildApiUrl(creds, "get_series_info") + `&series_id=${seriesId}`;
  return fetchJson(url);
}

const CACHE_TTL_EPG = 60 * 1000; // 60 seconds — EPG doesn't change often

function parseEpgDate(dateStr: string): number {
  if (!dateStr) return 0;
  // Xtream EPG dates: "2024-01-15 20:00:00" (server timezone)
  const d = new Date(dateStr.replace(" ", "T") + "Z");
  return isNaN(d.getTime()) ? 0 : d.getTime();
}

function mapEpgListings(listings: Record<string, unknown>[]): EpgProgram[] {
  return listings.map((e) => ({
    id: String(e.id ?? ""),
    channelId: String(e.channel_id ?? ""),
    title: e.title ? safeAtob(String(e.title)) : "",
    description: e.description ? safeAtob(String(e.description)) : "",
    start: String(e.start ?? ""),
    end: String(e.end ?? ""),
    startTimestamp: parseEpgDate(String(e.start ?? "")),
    endTimestamp: parseEpgDate(String(e.end ?? "")),
    lang: String(e.lang ?? ""),
    hasArchive: Boolean(e.has_archive),
  }));
}

export async function fetchEpg(
  creds: XtreamCredentials,
  streamId: number
): Promise<EpgProgram[]> {
  const cacheKey = buildCacheKey(creds, "epg", String(streamId));
  const cached = getCached<EpgProgram[]>(cacheKey);
  if (cached) return cached;

  const url = buildApiUrl(creds, "get_short_epg") + `&stream_id=${streamId}`;
  const data = await fetchJson<{
    epg_listings?: Record<string, unknown>[];
  }>(url);
  if (!data.epg_listings) return [];
  const result = mapEpgListings(data.epg_listings);
  setCache(cacheKey, result, CACHE_TTL_EPG);
  return result;
}

/**
 * Fetch extended EPG for a channel (more programs for grid view).
 * Uses higher limit for TV guide display.
 */
export async function fetchFullEpg(
  creds: XtreamCredentials,
  streamId: number,
  limit: number = 30
): Promise<EpgProgram[]> {
  const cacheKey = buildCacheKey(creds, "full_epg", `${streamId}_${limit}`);
  const cached = getCached<EpgProgram[]>(cacheKey);
  if (cached) return cached;

  const url = buildApiUrl(creds, "get_short_epg") + `&stream_id=${streamId}&limit=${limit}`;
  const data = await fetchJson<{
    epg_listings?: Record<string, unknown>[];
  }>(url);
  if (!data.epg_listings) return [];
  const result = mapEpgListings(data.epg_listings);
  setCache(cacheKey, result, 5 * 60 * 1000); // 5min cache for grid
  return result;
}

/**
 * Fetch full movie details (plot, cast, trailer, etc.)
 */
const CACHE_TTL_VOD_INFO = 30 * 60 * 1000; // 30 minutes

export async function fetchVodInfo(
  creds: XtreamCredentials,
  vodId: number
): Promise<MovieInfo> {
  const cacheKey = buildCacheKey(creds, "vod_info", String(vodId));
  const cached = getCached<MovieInfo>(cacheKey);
  if (cached) return cached;

  const url = buildApiUrl(creds, "get_vod_info") + `&vod_id=${vodId}`;
  const data = await fetchJson<{
    info?: Record<string, unknown>;
    movie_data?: Record<string, unknown>;
  }>(url);

  const info = data.info || {};
  const movieData = data.movie_data || {};
  const backdropRaw = info.backdrop_path;
  const backdropPath: string[] = Array.isArray(backdropRaw)
    ? (backdropRaw as string[]).filter(Boolean)
    : typeof backdropRaw === "string" && backdropRaw
      ? [backdropRaw]
      : [];

  const result: MovieInfo = {
    streamId: Number(movieData.stream_id ?? vodId),
    name: String(info.name ?? movieData.name ?? ""),
    originalName: info.o_name ? String(info.o_name) : undefined,
    cover: String(info.movie_image ?? info.cover ?? ""),
    coverBig: info.cover_big ? String(info.cover_big) : undefined,
    backdropPath,
    rating: String(info.rating ?? "0"),
    plot: String(info.plot ?? info.description ?? ""),
    cast: String(info.cast ?? ""),
    director: String(info.director ?? ""),
    genre: String(info.genre ?? ""),
    releaseDate: String(info.release_date ?? info.releasedate ?? ""),
    year: info.year ? String(info.year) : undefined,
    duration: String(info.duration ?? ""),
    durationSecs: info.duration_secs ? Number(info.duration_secs) : undefined,
    country: info.country ? String(info.country) : undefined,
    youtubeTrailer: info.youtube_trailer ? String(info.youtube_trailer) : undefined,
    tmdbId: info.tmdb_id ? String(info.tmdb_id) : undefined,
    containerExtension: String(movieData.container_extension ?? "mp4"),
    categoryId: String(movieData.category_id ?? info.category_id ?? ""),
  };

  setCache(cacheKey, result, CACHE_TTL_VOD_INFO);
  return result;
}

/**
 * Fetch full series info with seasons and episodes.
 */
const CACHE_TTL_SERIES_INFO = 30 * 60 * 1000;

export async function fetchFullSeriesInfo(
  creds: XtreamCredentials,
  seriesId: number
): Promise<SeriesInfo> {
  const cacheKey = buildCacheKey(creds, "series_info", String(seriesId));
  const cached = getCached<SeriesInfo>(cacheKey);
  if (cached) return cached;

  const url = buildApiUrl(creds, "get_series_info") + `&series_id=${seriesId}`;
  const data = await fetchJson<{
    info?: Record<string, unknown>;
    seasons?: Record<string, unknown>[];
    episodes?: Record<string, Record<string, unknown>[]>;
  }>(url);

  const info = data.info || {};
  const backdropRaw = info.backdrop_path;
  const backdropPath: string[] = Array.isArray(backdropRaw)
    ? (backdropRaw as string[]).filter(Boolean)
    : typeof backdropRaw === "string" && backdropRaw
      ? [backdropRaw]
      : [];

  const seasons: SeasonInfo[] = (data.seasons || []).map((s) => ({
    seasonNumber: Number(s.season_number ?? 0),
    name: String(s.name ?? `Staffel ${s.season_number}`),
    episodeCount: Number(s.episode_count ?? 0),
    cover: s.cover ? String(s.cover) : undefined,
    coverBig: s.cover_big ? String(s.cover_big) : undefined,
    overview: s.overview ? String(s.overview) : undefined,
    airDate: s.air_date ? String(s.air_date) : undefined,
  }));

  const episodes: Record<string, EpisodeInfo[]> = {};
  if (data.episodes) {
    for (const [seasonNum, eps] of Object.entries(data.episodes)) {
      episodes[seasonNum] = (eps as Record<string, unknown>[]).map((e) => {
        const epInfo = (e.info || {}) as Record<string, unknown>;
        return {
          id: String(e.id ?? ""),
          episodeNum: Number(e.episode_num ?? 0),
          title: String(e.title ?? `Episode ${e.episode_num}`),
          containerExtension: String(e.container_extension ?? "mp4"),
          season: Number(e.season ?? seasonNum),
          info: {
            movieImage: epInfo.movie_image ? String(epInfo.movie_image) : undefined,
            plot: epInfo.plot ? String(epInfo.plot) : undefined,
            duration: epInfo.duration ? String(epInfo.duration) : undefined,
            durationSecs: epInfo.duration_secs ? Number(epInfo.duration_secs) : undefined,
            releaseDate: epInfo.release_date ? String(epInfo.release_date) : undefined,
            rating: epInfo.rating ? String(epInfo.rating) : undefined,
          },
        };
      });
    }
  }

  const result: SeriesInfo = {
    name: String(info.name ?? ""),
    cover: String(info.cover ?? ""),
    plot: String(info.plot ?? ""),
    cast: String(info.cast ?? ""),
    director: String(info.director ?? ""),
    genre: String(info.genre ?? ""),
    releaseDate: String(info.release_date ?? ""),
    rating: String(info.rating ?? "0"),
    categoryId: String(info.category_id ?? ""),
    backdropPath,
    youtubeTrailer: info.youtube_trailer ? String(info.youtube_trailer) : undefined,
    seasons,
    episodes,
  };

  setCache(cacheKey, result, CACHE_TTL_SERIES_INFO);
  return result;
}

function safeAtob(str: string): string {
  try {
    // atob() decodes Base64 to Latin-1 bytes. For UTF-8 content (ä, ö, ü etc.)
    // we must re-decode the byte string as UTF-8.
    const bytes = atob(str);
    const uint8 = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) uint8[i] = bytes.charCodeAt(i);
    return new TextDecoder("utf-8").decode(uint8);
  } catch {
    return str;
  }
}

/**
 * Auto-upgrade HTTP URLs to HTTPS when the page is on HTTPS.
 * This enables direct browser-to-server streaming (bypassing the proxy),
 * which uses the user's real IP instead of the datacenter IP.
 * Most Xtream servers support HTTPS on port 443 alongside HTTP.
 */
function upgradeHttps(url: string): string {
  if (typeof window !== "undefined" && window.location.protocol === "https:") {
    return url.replace(/^http:\/\//i, "https://");
  }
  return url;
}

export function buildStreamUrl(
  creds: XtreamCredentials,
  streamId: number,
  type: "live" | "movie" | "series",
  extension?: string
): string {
  const base = upgradeHttps(buildBaseUrl(creds));
  const u = creds.username.trim();
  const p = creds.password.trim();
  if (type === "live") {
    const ext = extension || "m3u8";
    return `${base}/live/${u}/${p}/${streamId}.${ext}`;
  }
  if (type === "movie") {
    return `${base}/movie/${u}/${p}/${streamId}.${extension || "mp4"}`;
  }
  return `${base}/series/${u}/${p}/${streamId}.${extension || "mp4"}`;
}

export function buildVodUrl(
  creds: XtreamCredentials,
  streamId: number,
  extension: string = "mp4"
): string {
  return buildStreamUrl(creds, streamId, "movie", extension);
}

export function buildSeriesUrl(
  creds: XtreamCredentials,
  episodeId: number,
  extension: string = "mp4"
): string {
  return buildStreamUrl(creds, episodeId, "series", extension);
}

// ==================== Country Detection & Grouping ====================

/**
 * Extract country from a group/category title string.
 * Delegates to the countries utility for pattern matching.
 */
export function extractCountry(groupTitle: string): string {
  const info = extractCountryFromGroup(groupTitle);
  return info ? `${info.flag} ${info.name}` : "Other";
}

/**
 * Group an array of items by detected country from a specified field.
 * Creates a record of country label -> items array.
 *
 * @param items - Array of items (channels, movies, series, categories, etc.)
 * @param groupField - The field name containing the group/category title to parse
 * @returns Record with country labels as keys and arrays of items as values
 */
export function groupByCountry<T extends Record<string, unknown>>(
  items: T[],
  groupField: string
): Record<string, T[]> {
  const groups: Record<string, T[]> = {};

  for (const item of items) {
    const fieldValue = String(item[groupField] ?? "");
    const country = extractCountry(fieldValue);
    if (!groups[country]) {
      groups[country] = [];
    }
    groups[country].push(item);
  }

  return groups;
}

/**
 * Group categories by detected country from their category names.
 * Returns a map of country label -> categories.
 */
export function groupCategoriesByCountry(
  categories: Category[]
): Record<string, Category[]> {
  const groups: Record<string, Category[]> = {};

  for (const cat of categories) {
    const country = extractCountry(cat.categoryName);
    if (!groups[country]) {
      groups[country] = [];
    }
    groups[country].push(cat);
  }

  return groups;
}

// ==================== Parallel Content Fetching ====================

export interface AllContent {
  liveCategories: Category[];
  liveStreams: Channel[];
  vodCategories: Category[];
  vodStreams: Movie[];
  seriesCategories: Category[];
  seriesList: Series[];
}

/**
 * Fetch all content (categories + streams) in parallel for faster loading.
 * Each individual fetch is cached independently.
 */
export async function fetchAllContent(
  creds: XtreamCredentials
): Promise<AllContent> {
  const [
    liveCategories,
    liveStreams,
    vodCategories,
    vodStreams,
    seriesCategories,
    seriesList,
  ] = await Promise.all([
    fetchLiveCategories(creds),
    fetchLiveStreams(creds),
    fetchVodCategories(creds),
    fetchVodStreams(creds),
    fetchSeriesCategories(creds),
    fetchSeries(creds),
  ]);

  return {
    liveCategories,
    liveStreams,
    vodCategories,
    vodStreams,
    seriesCategories,
    seriesList,
  };
}

// ==================== M3U Parser ====================

export async function parseM3UFromUrl(
  m3uUrl: string
): Promise<ParsedM3UResult> {
  // Always proxy external M3U URLs to bypass CORS
  const url = m3uUrl.trim();
  const needsProxy = typeof window !== "undefined" && isExternalUrl(url);
  const fetchUrl = needsProxy ? `/api/proxy?url=${encodeURIComponent(url)}` : url;

  const res = await fetch(fetchUrl);
  if (!res.ok) throw new Error(`Failed to fetch M3U: ${res.statusText}`);
  const text = await res.text();
  return parseM3UContent(stripSurrogates(text));
}

function parseM3UContent(content: string): ParsedM3UResult {
  const lines = stripSurrogates(content).split("\n").map((l) => l.trim());
  const channels: Channel[] = [];
  let epgUrl: string | null = null;

  if (lines[0]?.startsWith("#EXTM3U")) {
    const epgMatch = lines[0].match(/url-tvg="([^"]+)"/);
    if (epgMatch) epgUrl = epgMatch[1];
  }

  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].startsWith("#EXTINF:")) continue;

    const infoLine = lines[i];
    let urlLine = "";
    for (let j = i + 1; j < lines.length; j++) {
      if (lines[j] && !lines[j].startsWith("#")) {
        urlLine = lines[j];
        break;
      }
    }
    if (!urlLine) continue;

    const nameMatch = infoLine.match(/,(.+)$/);
    const logoMatch = infoLine.match(/tvg-logo="([^"]*)"/);
    const groupMatch = infoLine.match(/group-title="([^"]*)"/);
    const tvgIdMatch = infoLine.match(/tvg-id="([^"]*)"/);
    const tvgNameMatch = infoLine.match(/tvg-name="([^"]*)"/);

    const name = nameMatch ? nameMatch[1].trim() : "Unknown";
    const isVod =
      urlLine.endsWith(".mp4") ||
      urlLine.endsWith(".mkv") ||
      urlLine.endsWith(".avi");
    const isSeries = /\/series\//.test(urlLine);

    channels.push({
      id: String(channels.length + 1),
      name,
      logo: logoMatch?.[1] ?? "",
      group: groupMatch?.[1] ?? "Uncategorized",
      url: upgradeHttps(urlLine),
      tvgId: tvgIdMatch?.[1] ?? "",
      tvgName: tvgNameMatch?.[1] ?? name,
      isLive: !isVod && !isSeries,
      streamType: isSeries ? "series" : isVod ? "movie" : "live",
    });
  }

  return { channels, epgUrl };
}
