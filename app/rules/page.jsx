import SitePage from "../page";

export const metadata = {
  title: "Rules",
  description: "BTARust.net network rules covering fair play, moderation, teams, and wipe protection."
};

export default function RulesPage() {
  return <SitePage initialView="rules" />;
}
