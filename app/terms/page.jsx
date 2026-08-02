export const metadata = { title: "Terms of Service", description: "Terms for using BTARust.net websites, servers, Discord, and digital services." };

export default function TermsPage() {
  return <main className="container section">
    <p className="eyebrow">BTARust.net</p><h1 className="h1">Terms of Service</h1>
    <div className="card"><div className="pad muted" style={{display:"grid", gap:16}}>
      <p>Last updated: August 2, 2026.</p>
      <p>By using BTARust.net websites, Rust servers, Discord spaces, bots, mini-games, or linked services, you agree to follow the posted server and community rules as well as the applicable rules of Steam, Facepunch Studios, Discord, and Tebex.</p>
      <p>Digital purchases provide revocable access to virtual items, permissions, ranks, or services within the BTA network. They do not grant ownership of software or game assets. Purchases are final except where applicable law or the payment provider requires otherwise. Contact support before starting a payment dispute.</p>
      <p>Features, balances, maps, wipe schedules, rewards, plugins, servers, and benefits may be changed, rebalanced, suspended, wiped, or discontinued to protect gameplay, security, stability, or community fairness. Access may be limited or terminated for rule violations, fraud, chargebacks, cheating, exploitation, harassment, or ban evasion.</p>
      <p>Services are provided on an as-is and as-available basis. BTARust.net is not responsible for third-party outages, game updates, wipes, lost virtual items, plugin failures, account compromises outside its control, or interruptions beyond the remedies required by law.</p>
      <p>Questions, appeals, and support requests must be submitted through the official BTARust.net Discord. Staff decisions remain subject to community safety, evidence, platform requirements, and applicable law.</p>
      <p><a href="/">Return to BTARust.net</a> · <a href="/privacy">Privacy Policy</a></p>
    </div></div>
  </main>;
}
