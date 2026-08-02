export const metadata = { title: "Privacy Policy", description: "How BTARust.net handles website, Steam, Discord, and server data." };

export default function PrivacyPage() {
  return <main className="container section">
    <p className="eyebrow">BTARust.net</p><h1 className="h1">Privacy Policy</h1>
    <div className="card"><div className="pad muted" style={{display:"grid", gap:16}}>
      <p>Last updated: August 2, 2026.</p>
      <p>BTARust.net processes the information needed to operate its website, Rust servers, Discord community, linked rewards, moderation, and support. This can include Steam and Discord account identifiers, display names, IP and server connection logs, gameplay and moderation records, purchase or entitlement references, support messages, and security logs.</p>
      <p>Account-linking sessions use necessary cookies and tokens so Steam and Discord identities can be connected safely. Payment details are handled by Tebex and its payment providers; BTARust.net does not intentionally store full payment-card numbers.</p>
      <p>Information is used to deliver purchases and rewards, prevent abuse, enforce rules, troubleshoot outages, secure accounts, and improve services. It may be shared with infrastructure and platform providers only as needed to operate those services or comply with law.</p>
      <p>Records are kept only as long as reasonably needed for operations, security, disputes, moderation, or legal requirements. To request access, correction, or deletion where applicable, open a support ticket in the official BTARust.net Discord. Some records may need to be retained for anti-fraud, ban-evasion, or legal reasons.</p>
      <p><a href="/">Return to BTARust.net</a> · <a href="/terms">Terms of Service</a></p>
    </div></div>
  </main>;
}
