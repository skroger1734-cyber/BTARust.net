import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://btarust.net"),
  title: {
    default: "BTARust.net | US & EU Modded Rust Servers",
    template: "%s | BTARust.net"
  },
  description: "Join BTARust.net's US and EU modded Rust servers with monthly and weekly wipes, quality-of-life systems, custom events, active moderation, and linked community rewards.",
  applicationName: "BTARust.net",
  icons: { icon: "/favicon.jpg", apple: "/BTARusticon.png" },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "BTARust.net | US & EU Modded Rust Servers",
    description: "Monthly and weekly modded Rust servers with custom events, quality-of-life systems, active moderation, and linked rewards.",
    url: "https://btarust.net",
    siteName: "BTARust.net",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "BTARust.net US and EU modded Rust servers" }],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "BTARust.net | US & EU Modded Rust Servers",
    description: "Monthly and weekly modded Rust servers with custom events, quality-of-life systems, and active moderation.",
    images: ["/og.png"]
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
