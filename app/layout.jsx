import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

export const metadata = {
  title: "BTARust.net",
  description: "BTARust.net Rust servers, kits, account linking, and community information."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
