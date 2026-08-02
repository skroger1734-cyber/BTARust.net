export default function sitemap() {
  const routes = [
    "", "servers", "account-linking", "lifetime-kits", "streamer-program",
    "events", "rules", "info", "demos", "minigames", "privacy", "terms"
  ];
  return routes.map((route) => ({
    url: `https://btarust.net/${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" || route === "servers" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7
  }));
}
