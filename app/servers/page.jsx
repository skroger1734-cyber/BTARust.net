import SitePage from "../page";

export const metadata = {
  title: "Servers",
  description: "Live BTARust.net US and EU 3x Monthly plus US and EU 2x Weekly server status, maps, and connect links."
};

export default function ServersPage() {
  return <SitePage initialView="servers" />;
}
