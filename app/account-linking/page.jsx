import SitePage from "../page";

export const metadata = {
  title: "Account Linking | BTARust.net",
  description: "Link Steam and Discord to synchronize BTARust.net purchases, kits, roles, and rewards."
};

export default function AccountLinkingPage() {
  return <SitePage initialView="account-linking" />;
}
