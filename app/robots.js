export default function robots() {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
    sitemap: "https://btarust.net/sitemap.xml",
    host: "https://btarust.net"
  };
}
