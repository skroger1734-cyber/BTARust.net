import { NextResponse } from "next/server";
import { servers } from "../../../data/servers";

export const dynamic = "force-dynamic";

function normalizeServer(server, payload) {
  const attributes = payload?.data?.attributes;
  const details = attributes?.details || {};
  const mapDetails = details.rust_maps || {};

  if (!attributes) {
    return {
      id: server.id,
      battleMetricsId: server.battleMetricsId,
      status: "unknown",
      players: null,
      maxPlayers: null,
      map: server.map,
      mapUrl: server.mapUrl
    };
  }

  return {
    id: server.id,
    battleMetricsId: server.battleMetricsId,
    status: attributes.status || "unknown",
    players: Number.isFinite(attributes.players) ? attributes.players : null,
    maxPlayers: Number.isFinite(attributes.maxPlayers) ? attributes.maxPlayers : null,
    map: details.map || server.map,
    mapUrl: mapDetails.url || server.mapUrl,
    mapThumbnail: mapDetails.thumbnailUrl || null,
    lastWipe: details.rust_last_wipe || null,
    nextWipe: details.rust_next_wipe || null,
    checkedAt: new Date().toISOString()
  };
}

export async function GET() {
  const results = await Promise.all(
    servers.map(async (server) => {
      try {
        const response = await fetch(
          `https://api.battlemetrics.com/servers/${server.battleMetricsId}`,
          {
            headers: {
              Accept: "application/vnd.api+json",
              "User-Agent": "BTARust.net/1.0 (+https://www.btarust.net)"
            },
            next: { revalidate: 60 }
          }
        );

        if (!response.ok) throw new Error(`BattleMetrics returned ${response.status}`);
        return normalizeServer(server, await response.json());
      } catch (error) {
        console.error(`[battlemetrics] ${server.id}:`, error);
        return normalizeServer(server, null);
      }
    })
  );

  return NextResponse.json(
    { servers: results },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
  );
}
