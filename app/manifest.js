export default function manifest() {
  return {
    name: "BTARust.net",
    short_name: "BTA Rust",
    description: "US and EU modded Rust servers, community, events, and rewards.",
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#f97316",
    icons: [{ src: "/BTARusticon.png", sizes: "512x512", type: "image/png" }]
  };
}
