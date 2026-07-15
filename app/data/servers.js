export const servers = [
  {
    id: "us-3x-monthly",
    name: "BTARust.net | US | 3x Monthly | QoL/Loot+ | No Team Limit | Full Wipe",
    shortName: "US 3x Monthly",
    region: "US",
    rate: "3x Monthly",
    wipe: "Full Wipe",
    description: "Fast-paced monthly Rust with 3x gather and loot, QoL systems, no team limit, active moderation, and full monthly wipes.",
    ip: "144.48.106.226",
    port: 28015,
    queryPort: 28017,
    battleMetricsId: "39147285",
    map: "Procedural Map",
    mapUrl: "https://rustmaps.com/map/a6424e50bb6947d88a552cb781aacbc7"
  },
  {
    id: "eu-3x-monthly",
    name: "BTARust.net | EU | 3x Monthly | QoL/Loot+ | No Team Limit | Full Wipe",
    shortName: "EU 3x Monthly",
    region: "EU",
    rate: "3x Monthly",
    wipe: "Full Wipe",
    description: "European monthly Rust with 3x gather and loot, QoL systems, no team limit, active moderation, and full monthly wipes.",
    ip: "104.234.252.154",
    port: 28045,
    queryPort: 28047,
    battleMetricsId: "31941157",
    map: "Procedural Map",
    mapUrl: "https://rustmaps.com/map/1518af88259c40389fe493ec1d4f5830"
  },
  {
    id: "us-creative",
    name: "BTARust.net | US | Creative",
    shortName: "US Creative",
    region: "US",
    rate: "Creative",
    wipe: "Creative Sandbox",
    description: "Build-focused creative server for testing bases, practicing designs, experimenting with electrical systems, and planning raids.",
    ip: "216.245.176.150",
    port: 28025,
    queryPort: 28027,
    battleMetricsId: "39319098",
    map: "Procedural Map",
    mapUrl: "https://rustmaps.com/map/4ef6fa86fe11497792c07bb4d3d045dc"
  }
].map((server) => ({
  ...server,
  client: `${server.ip}:${server.port}`,
  connect: `steam://connect/${server.ip}:${server.port}`,
  battleMetricsUrl: `https://www.battlemetrics.com/servers/rust/${server.battleMetricsId}`
}));
