export const servers = [
  {
    id: "us-3x-monthly",
    name: "BTARust.net | US | 3x Monthly | 50% Upkeep | QoL/Loot+ | No Team Limit",
    shortName: "US 3x Monthly",
    region: "US",
    rate: "3x Monthly",
    wipe: "Full Wipe",
    description: "US monthly Rust with 3x gather and loot, 50% upkeep, QoL systems, no team limit, active moderation, and full monthly wipes.",
    ip: "158.69.127.150",
    port: 28015,
    queryPort: 28017,
    battleMetricsId: null,
    map: "Procedural Map",
    mapUrl: "https://rustmaps.com/map/a6424e50bb6947d88a552cb781aacbc7"
  },
  {
    id: "eu-3x-monthly",
    name: "BTARust.net | EU | 3x Monthly | 50% Upkeep | QoL/Loot+ | No Team Limit",
    shortName: "EU 3x Monthly",
    region: "EU",
    rate: "3x Monthly",
    wipe: "Full Wipe",
    description: "European monthly Rust with 3x gather and loot, 50% upkeep, QoL systems, no team limit, active moderation, and full monthly wipes.",
    ip: "169.58.90.65",
    port: 28015,
    queryPort: 28017,
    battleMetricsId: null,
    map: "Procedural Map",
    mapUrl: "https://rustmaps.com/map/1518af88259c40389fe493ec1d4f5830"
  },
  {
    id: "us-test",
    name: "BTARust.net | US | Test Server",
    shortName: "US Test Server",
    region: "US",
    rate: "Test",
    wipe: "Development & Beta",
    description: "BTA development and beta server for testing upcoming plugins, events, integrations, and balance changes before main-server rollout.",
    ip: "144.225.37.13",
    port: 28015,
    queryPort: 28017,
    battleMetricsId: null,
    map: "Procedural Map",
    mapUrl: "https://rustmaps.com/map/4ef6fa86fe11497792c07bb4d3d045dc"
  }
].map((server) => ({
  ...server,
  client: `${server.ip}:${server.port}`,
  connect: `steam://run/252490//+connect%20${server.ip}%3A${server.port}/`,
  battleMetricsUrl: server.battleMetricsId
    ? `https://www.battlemetrics.com/servers/rust/${server.battleMetricsId}`
    : null
}));
