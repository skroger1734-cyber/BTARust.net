"use client";

import dynamic from "next/dynamic";

const SitePage = dynamic(() => import("../page"), {
  ssr: false,
  loading: () => (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#09090b",
        color: "#fdba74",
        fontFamily: "Inter, system-ui, sans-serif",
        fontWeight: 800
      }}
    >
      Loading account linking…
    </main>
  )
});

export default function AccountLinkingClient() {
  return <SitePage initialView="account-linking" />;
}
