export const servers = [
  {
    id: "us-3x-monthly",
    name: "BTARust.net | US | 3x Monthly | 50% Upkeep | QoL/Loot+ | No Team Limit",
    shortName: "US 3x Monthly",
    region: "US",
    rate: "3x Monthly",
    wipe: "Full Wipe",
    description: "US monthly Rust with 3x gather and loot, 50% upkeep, QoL systems, no team limit, active moderation, and full monthly wipes.",
    ip: "172.99.249.21",
    port: 28015,
    queryPort: 28017,
    battleMetricsId: null,
    map: "Procedural Map",
    mapUrl: "https://rustmaps.com/map/3700_2073373186"
  },
  {
    id: "eu-3x-monthly",
    name: "BTARust.net | EU | 3x Monthly | 50% Upkeep | QoL/Loot+ | No Team Limit",
    shortName: "EU 3x Monthly",
    region: "EU",
    rate: "3x Monthly",
    wipe: "Full Wipe",
    description: "European monthly Rust with 3x gather and loot, 50% upkeep, QoL systems, no team limit, active moderation, and full monthly wipes.",
    ip: "145.79.178.6",
    port: 28015,
    queryPort: 28017,
    battleMetricsId: null,
    map: "Procedural Map",
    mapUrl: "https://rustmaps.com/map/6d1e997ed39b4532bb30769ab8299840"
  },
  {
    id: "eu-2x-weekly",
    name: "BTARust.net | EU | 2x Weekly | 50% Upkeep | QoL/Loot+ | No Team Limit",
    shortName: "EU 2x Weekly",
    region: "EU",
    rate: "2x Weekly",
    wipe: "Thursday • 8 PM Amsterdam",
    description: "European weekly Rust with 2x gather, loot, stacks, smelting, and recyclers, 50% upkeep, QoL systems, no team limit, active moderation, and Thursday wipes.",
    ip: "93.113.179.19",
    port: 28015,
    queryPort: 28017,
    battleMetricsId: null,
    map: "Procedural Map",
    mapUrl: "https://rustmaps.com/map/4250_2085781650"
  },
  {
    id: "us-2x-weekly",
    name: "BTARust.net | US | 2x Weekly | 50% Upkeep | QoL/Loot+ | No Team Limit",
    shortName: "US 2x Weekly",
    region: "US",
    rate: "2x Weekly",
    wipe: "Thursday • 2 PM ET",
    description: "US weekly Rust with 2x gather, loot, stacks, smelting, and recyclers, 50% upkeep, QoL systems, no team limit, active moderation, and Thursday wipes.",
    ip: "172.99.249.47",
    port: 28015,
    queryPort: 28017,
    battleMetricsId: null,
    map: "Procedural Map",
    mapUrl: null
  }
].map((server) => ({
  ...server,
  client: `${server.ip}:${server.port}`,
  connect: `steam://run/252490//+connect%20${server.ip}%3A${server.port}/`,
  battleMetricsUrl: server.battleMetricsId
    ? `https://www.battlemetrics.com/servers/rust/${server.battleMetricsId}`
    : null
}));
