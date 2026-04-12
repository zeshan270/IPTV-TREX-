import { NextRequest, NextResponse } from "next/server";

// Allow up to 60s for streaming segments (Vercel Hobby max)
export const maxDuration = 60;

/**
 * Stream proxy to bypass CORS restrictions for IPTV streams.
 * Fetches content from external IPTV servers and returns it with proper CORS headers.
 * Handles m3u8 manifests (rewrites segment URLs) and ts segments.
 */
export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get("url");
  if (!rawUrl) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }
  const url = rawUrl.trim();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "VLC/3.0.20 LibVLC/3.0.20",
        "Accept": "*/*",
      },
    });
    clearTimeout(timeout);

    if (!response.ok) {
      // Provide meaningful error info for IPTV-specific status codes
      let errorDetail = `Upstream error: ${response.status}`;
      if (response.status === 456) {
        errorDetail = "STREAM_BLOCKED_456";
      } else if (response.status === 458) {
        errorDetail = "MAX_CONNECTIONS_458";
      }
      return new NextResponse(errorDetail, {
        status: response.status,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "X-IPTV-Error": errorDetail,
        },
      });
    }

    const contentType = response.headers.get("content-type") || "";
    const isM3U8 = url.includes(".m3u8") || contentType.includes("mpegurl") || contentType.includes("m3u");

    if (isM3U8) {
      // For m3u8 manifests: rewrite relative URLs to absolute, then proxy them too
      const text = await response.text();
      const baseUrl = url.substring(0, url.lastIndexOf("/") + 1);
      const proxyBase = request.nextUrl.origin + "/api/proxy?url=";

      const rewritten = text
        .split("\n")
        .map((line) => {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) {
            // Rewrite URIs in EXT-X tags that reference other playlists
            if (trimmed.includes('URI="')) {
              return trimmed.replace(/URI="([^"]+)"/g, (_match, uri) => {
                const absUri = uri.startsWith("http") ? uri : baseUrl + uri;
                return `URI="${proxyBase}${encodeURIComponent(absUri)}"`;
              });
            }
            return line;
          }
          // Non-comment, non-empty line = segment or playlist URL
          const absUrl = trimmed.startsWith("http") ? trimmed : baseUrl + trimmed;
          return proxyBase + encodeURIComponent(absUrl);
        })
        .join("\n");

      return new NextResponse(rewritten, {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.apple.mpegurl",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Cache-Control": "no-cache",
        },
      });
    }

    // For ts segments and other binary content: stream through
    const headers = new Headers();
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    if (contentType) headers.set("Content-Type", contentType);
    const contentLength = response.headers.get("content-length");
    if (contentLength) headers.set("Content-Length", contentLength);

    return new NextResponse(response.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Proxy error";
    return new NextResponse(message, {
      status: 502,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Range",
      "Access-Control-Max-Age": "86400",
    },
  });
}
