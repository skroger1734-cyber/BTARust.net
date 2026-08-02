import SitePage from "../page";

export const metadata = {
  title: "Servers",
  description: "Live BTARust.net US 3x Monthly, EU 3x Monthly, and US 2x Weekly server status, maps, and connect links."
};

export default function ServersPage() {
  return <SitePage initialView="servers" />;
}
