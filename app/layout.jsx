import "./globals.css";

export const metadata = {
  title: "BTARust.net",
  description: "BTARust.net Rust servers, kits, account linking, and community information."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
