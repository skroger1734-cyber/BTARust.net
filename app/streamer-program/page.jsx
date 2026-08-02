import SitePage from "../page";

export const metadata = {
  title: "Streamer Program",
  description: "Apply for the BTARust.net PC Rust Streamer Program with verified creator access, private support, in-game perks, and 110 audience giveaway codes.",
  openGraph: {
    title: "PC Rust Streamers Wanted | BTARust.net",
    description: "Join the BTA Streamer Program and bring your community into the Cargo Nuke Event.",
    images: [{ url: "/BTA-Streamer-Program.png", width: 1024, height: 1536 }]
  }
};

export default function StreamerProgramPage() {
  return <SitePage initialView="streamer-program" />;
}
