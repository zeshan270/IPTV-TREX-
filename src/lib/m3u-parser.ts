import type { Channel, ParsedM3UResult } from "@/types";

interface ExtInfAttributes {
  tvgId: string;
  tvgName: string;
  tvgLogo: string;
  groupTitle: string;
}

function parseAttributes(line: string): ExtInfAttributes {
  const tvgId = extractAttr(line, "tvg-id") || "";
  const tvgName = extractAttr(line, "tvg-name") || "";
  const tvgLogo = extractAttr(line, "tvg-logo") || "";
  const groupTitle = extractAttr(line, "group-title") || "Uncategorized";
  return { tvgId, tvgName, tvgLogo, groupTitle };
}

function extractAttr(line: string, attr: string): string | null {
  const regex = new RegExp(`${attr}="([^"]*)"`, "i");
  const match = line.match(regex);
  return match ? match[1] : null;
}

function extractChannelName(line: string): string {
  const commaIndex = line.lastIndexOf(",");
  if (commaIndex === -1) return "Unknown Channel";
  return line.substring(commaIndex + 1).trim();
}

function extractEpgUrl(header: string): string | null {
  const match = header.match(/url-tvg="([^"]*)"/i);
  return match ? match[1] : null;
}

function detectStreamType(url: string): "live" | "movie" | "series" {
  const lower = url.toLowerCase();
  if (lower.includes("/movie/") || lower.includes("/movies/")) return "movie";
  if (lower.includes("/series/")) return "series";
  return "live";
}

/**
 * Strip lone Unicode surrogates that break JSON serialization.
 */
function stripSurrogates(text: string): string {
  // eslint-disable-next-line no-control-regex
  return text.replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/g, "\uFFFD")
             .replace(/(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, "\uFFFD");
}

export function parseM3U(content: string): ParsedM3UResult {
  const lines = stripSurrogates(content).split(/\r?\n/).filter((l) => l.trim() !== "");

  if (lines.length === 0) {
    return { channels: [], epgUrl: null };
  }

  let epgUrl: string | null = null;
  const channels: Channel[] = [];
  let channelIndex = 0;

  // Check for #EXTM3U header
  const firstLine = lines[0].trim();
  if (firstLine.startsWith("#EXTM3U")) {
    epgUrl = extractEpgUrl(firstLine);
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line.startsWith("#EXTINF:")) continue;

    // Look for the URL on the next non-comment, non-empty line
    let url = "";
    for (let j = i + 1; j < lines.length; j++) {
      const nextLine = lines[j].trim();
      if (nextLine === "" || nextLine.startsWith("#EXTVLCOPT") || nextLine.startsWith("#EXTGRP")) {
        continue;
      }
      if (nextLine.startsWith("#")) break;
      url = nextLine;
      break;
    }

    if (!url) continue;

    const attrs = parseAttributes(line);
    const name = extractChannelName(line) || attrs.tvgName || "Unknown";
    const streamType = detectStreamType(url);

    channels.push({
      id: String(channelIndex++),
      name,
      logo: attrs.tvgLogo,
      group: attrs.groupTitle,
      url,
      tvgId: attrs.tvgId,
      tvgName: attrs.tvgName || name,
      isLive: streamType === "live",
      streamType,
    });
  }

  return { channels, epgUrl };
}

export function groupByCategory(channels: Channel[]): Record<string, Channel[]> {
  const groups: Record<string, Channel[]> = {};
  for (const ch of channels) {
    const group = ch.group || "Uncategorized";
    if (!groups[group]) groups[group] = [];
    groups[group].push(ch);
  }
  return groups;
}
