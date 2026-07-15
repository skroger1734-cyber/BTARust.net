import SitePage from "../page";

export const metadata = {
  title: "QoL, Perks & Commands | BTARust.net",
  description: "BTARust.net quality-of-life perks, events, premium permissions, vehicles, limits, economy, and in-game commands."
};

export default function InfoPage() {
  return <SitePage initialView="info" />;
}
