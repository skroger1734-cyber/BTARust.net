import SitePage from "../page";

export const metadata = {
  title: "Servers | BTARust.net",
  description: "Live BTARust.net US 3x, EU 3x, and US Test server status, maps, and connect links."
};

export default function ServersPage() {
  return <SitePage initialView="servers" />;
}
