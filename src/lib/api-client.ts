import type {
  XtreamCredentials,
  Category,
  Channel,
  Movie,
  Series,
  EpgProgram,
  XtreamAuthResponse,
  ParsedM3UResult,
} from "@/types";

// ==================== Xtream API Client ====================

function buildBaseUrl(creds: XtreamCredentials): string {
  return creds.serverUrl.replace(/\/+$/, "");
}

function buildApiUrl(creds: XtreamCredentials, action?: string): string {
  const base = buildBaseUrl(creds);
  let url = `${base}/player_api.php?username=${encodeURIComponent(creds.username)}&password=${encodeURIComponent(creds.password)}`;
  if (action) url += `&action=${action}`;
  return url;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<T>;
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
  const url = buildApiUrl(creds, "get_live_categories");
  const data = await fetchJson<
    { category_id: string; category_name: string; parent_id: number }[]
  >(url);
  return data.map((c) => ({
    categoryId: c.category_id,
    categoryName: c.category_name,
    parentId: c.parent_id,
  }));
}

export async function fetchLiveStreams(
  creds: XtreamCredentials,
  categoryId?: string
): Promise<Channel[]> {
  let url = buildApiUrl(creds, "get_live_streams");
  if (categoryId) url += `&category_id=${categoryId}`;
  const data = await fetchJson<Record<string, unknown>[]>(url);
  return data.map((s) => ({
    id: String(s.stream_id ?? ""),
    name: String(s.name ?? ""),
    logo: String(s.stream_icon ?? ""),
    group: String(s.category_id ?? ""),
    url: buildStreamUrl(creds, Number(s.stream_id), "live"),
    tvgId: String(s.epg_channel_id ?? ""),
    tvgName: String(s.name ?? ""),
    epgChannelId: String(s.epg_channel_id ?? ""),
    isLive: true,
    streamType: "live" as const,
    categoryId: String(s.category_id ?? ""),
  }));
}

export async function fetchVodCategories(
  creds: XtreamCredentials
): Promise<Category[]> {
  const url = buildApiUrl(creds, "get_vod_categories");
  const data = await fetchJson<
    { category_id: string; category_name: string; parent_id: number }[]
  >(url);
  return data.map((c) => ({
    categoryId: c.category_id,
    categoryName: c.category_name,
    parentId: c.parent_id,
  }));
}

export async function fetchVodStreams(
  creds: XtreamCredentials,
  categoryId?: string
): Promise<Movie[]> {
  let url = buildApiUrl(creds, "get_vod_streams");
  if (categoryId) url += `&category_id=${categoryId}`;
  const data = await fetchJson<Record<string, unknown>[]>(url);
  return data.map((s) => ({
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
}

export async function fetchSeriesCategories(
  creds: XtreamCredentials
): Promise<Category[]> {
  const url = buildApiUrl(creds, "get_series_categories");
  const data = await fetchJson<
    { category_id: string; category_name: string; parent_id: number }[]
  >(url);
  return data.map((c) => ({
    categoryId: c.category_id,
    categoryName: c.category_name,
    parentId: c.parent_id,
  }));
}

export async function fetchSeries(
  creds: XtreamCredentials,
  categoryId?: string
): Promise<Series[]> {
  let url = buildApiUrl(creds, "get_series");
  if (categoryId) url += `&category_id=${categoryId}`;
  const data = await fetchJson<Record<string, unknown>[]>(url);
  return data.map((s) => ({
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

export async function fetchEpg(
  creds: XtreamCredentials,
  streamId: number
): Promise<EpgProgram[]> {
  const url = buildApiUrl(creds, "get_short_epg") + `&stream_id=${streamId}`;
  const data = await fetchJson<{
    epg_listings?: Record<string, unknown>[];
  }>(url);
  if (!data.epg_listings) return [];
  return data.epg_listings.map((e) => ({
    id: String(e.id ?? ""),
    channelId: String(e.channel_id ?? ""),
    title: e.title ? safeAtob(String(e.title)) : "",
    description: e.description ? safeAtob(String(e.description)) : "",
    start: String(e.start ?? ""),
    end: String(e.end ?? ""),
    lang: String(e.lang ?? ""),
    hasArchive: Boolean(e.has_archive),
  }));
}

function safeAtob(str: string): string {
  try {
    return atob(str);
  } catch {
    return str;
  }
}

export function buildStreamUrl(
  creds: XtreamCredentials,
  streamId: number,
  type: "live" | "movie" | "series",
  extension?: string
): string {
  const base = buildBaseUrl(creds);
  const u = encodeURIComponent(creds.username);
  const p = encodeURIComponent(creds.password);
  if (type === "live") {
    return `${base}/live/${u}/${p}/${streamId}.m3u8`;
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

// ==================== M3U Parser ====================

export async function parseM3UFromUrl(
  m3uUrl: string
): Promise<ParsedM3UResult> {
  const res = await fetch(m3uUrl);
  if (!res.ok) throw new Error(`Failed to fetch M3U: ${res.statusText}`);
  const text = await res.text();
  return parseM3UContent(text);
}

function parseM3UContent(content: string): ParsedM3UResult {
  const lines = content.split("\n").map((l) => l.trim());
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
      url: urlLine,
      tvgId: tvgIdMatch?.[1] ?? "",
      tvgName: tvgNameMatch?.[1] ?? name,
      isLive: !isVod && !isSeries,
      streamType: isSeries ? "series" : isVod ? "movie" : "live",
    });
  }

  return { channels, epgUrl };
}
