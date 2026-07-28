import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://btarust.net"),
  title: "BTARust.net | Cargo Nuke Event",
  description: "Survive the BTA Cargo Nuke Event, join the event cycle, and unlock lifetime Rust kits with automatic Steam and Discord linking.",
  openGraph: {
    title: "BTARust.net | Cargo Nuke Event",
    description: "Prepare. Survive. Recover. The BTA Cargo Nuke Event is live in beta.",
    url: "https://btarust.net",
    siteName: "BTARust.net",
    images: [{ url: "/BTA-Cargo-Nuke-Promo.png", width: 1200, height: 630 }],
    type: "website"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
