import "./globals.css";

export const metadata = {
  title: "BTARust.net",
  description: "BTARust.net Rust servers, account linking, kits, rules, and community store.",
  icons: { icon: "/favicon.jpg" }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
