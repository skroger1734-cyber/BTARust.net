"use client";

import React, { useEffect, useMemo, useState } from "react";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://btarust.net";
const tebexStore = process.env.NEXT_PUBLIC_TEBEX_STORE_URL || process.env.NEXT_PUBLIC_STORE_URL || "https://btarustnet.tebex.io";
const discordInvite = process.env.NEXT_PUBLIC_DISCORD_INVITE || "https://discord.gg/bXGd4SGEw2";

function Button({ children, outline = false, onClick = undefined }) {
  return <button onClick={onClick} className={`btn ${outline ? "outline" : ""}`}>{children}</button>;
}
function Card({ children, extra = "" }) {
  return <div className={`card ${extra}`}><div className="pad">{children}</div></div>;
}
function Badge({ children, tone = "" }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}
function nextFacepunchWipe(now = new Date()) {
  const firstThu = (y, m) => {
    const d = new Date(Date.UTC(y, m, 1, 19, 0, 0));
    d.setUTCDate(1 + ((4 - d.getUTCDay() + 7) % 7));
    return d;
  };
  let wipe = firstThu(now.getUTCFullYear(), now.getUTCMonth());
  if (now >= wipe) {
    const nextMonth = now.getUTCMonth() + 1;
    wipe = firstThu(now.getUTCFullYear() + Math.floor(nextMonth / 12), nextMonth % 12);
  }
  return wipe;
}
function Countdown() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const wipe = useMemo(() => nextFacepunchWipe(now), [now]);
  const seconds = Math.max(0, Math.floor((wipe.getTime() - now.getTime()) / 1000));
  const vals = [
    ["Days", Math.floor(seconds / 86400)],
    ["Hours", Math.floor((seconds % 86400) / 3600)],
    ["Minutes", Math.floor((seconds % 3600) / 60)],
    ["Seconds", seconds % 60]
  ];
  return (
    <Card extra="orangeBorder">
      <p className="eyebrow">Facepunch Wipe Calendar</p>
      <h2 className="h2">Next forced wipe countdown</h2>
      <p className="muted">First Thursday of each month at 19:00 UTC.</p>
      <div className="count">
        {vals.map(([label, value]) => <div key={label}><strong>{String(value).padStart(2, "0")}</strong><span>{label}</span></div>)}
      </div>
      <p className="muted">Next wipe: <b>{wipe.toLocaleString()}</b></p>
    </Card>
  );
}

const servers = [
  { name: "BTARust.net Vanilla Monthly", status: "Live Now", rate: "Vanilla", wipe: "Monthly", desc: "Clean fair Rust with standard gather rates, long-term progression, and monthly reset schedule.", bm: "https://www.battlemetrics.com/servers/rust/38992245" },
  { name: "BTARust.net 2x Monthly", status: "Coming Soon", rate: "2x Gather", wipe: "Monthly", desc: "Faster progression with less grind and more action." },
  { name: "BTARust.net 3x Monthly", status: "Coming Soon", rate: "3x Gather", wipe: "Monthly", desc: "Higher-paced monthly server for quicker bases, raids, and PvP." },
  { name: "BTARust.net Million X", status: "Coming Soon", rate: "Million X", wipe: "TBD", desc: "Focused PvP and raiding with extreme gather rates, fast progression, and high-action gameplay." },
  { name: "BTARust.net Creative", status: "Coming Soon", rate: "Creative", wipe: "TBD", desc: "Build-focused creative server for testing bases, practicing designs, experimenting with electrical setups, and planning raid bases." }
];

const rules = [
  "Team Limit: No Limit",
  "NO CHEATING",
  "No exploiting or bug abuse",
  "Respect admins and moderators",
  "No racism, hate speech, or harassment",
  "Mini helis are available to everyone. Heli bombing into player bases increases mini heli cooldown from 5 minutes to 1 hour for 12 hours."
];

const kitDetails = {
  "Starter Kit": { image: "/kits/Starter.jpg", title: "Starter Kit", desc: "3 max uses per wipe with a cooldown of 5min.", items: "Farm tools, stone, metal fragments, wood, revolver with ammo, spear, food, bandages, building plan, hammer, tool cupboard, doors, code locks, and starter building supplies." },
  "Food Kit": { image: "/kits/Food.jpg", title: "Food Kit", desc: "Basic food and water support kit for quick survival recovery.", items: "Water, cooked steak, pumpkins, and potatoes." },
  "Discord Kit": { image: "/kits/Discord.jpg", title: "Discord Kit", desc: "Free Discord account-linking reward kit for players who connect through Discord.", items: "Pistol ammo, hazmat gear, pistol, pickaxe, salvaged tool, bandages, and medical syringes." },
  "Discord Booster Kit": { image: "/kits/Discord Booster.jpg", title: "Discord Booster Kit", desc: "Reward kit for players who boost the BTARust Discord server.", items: "MP5, pistol ammo, jackhammer, chainsaw, low grade fuel, airdrop, road sign armor set, hoodie, pants, boots, small backpack, medical syringes, bandages, medkit, and wooden barricade cover." },
  "VIP Queue Skip": { image: "/kits/VIP.jpg", title: "VIP Queue Skip", desc: "Monthly VIP access with mini heli spawn including 100 low grade, auto sort boxes, VIP queue skip, and linked account perks. Mini helis have a 5min cooldown. Heli bombing increases cooldown to 6hrs for 2 days.", items: "Custom SMG, pistol ammo, wooden barricade cover, medsticks, bandages, medkit, pumpkins, road sign armor set, stone, metal fragments, wood, and scrap." },
  "VIP Lifetime": { image: "/kits/VIP Lifetime.jpg", title: "VIP Lifetime", desc: "Lifetime VIP access with mini heli spawn including 100 low grade, auto sort boxes, VIP queue skip, skin permissions, and linked account perks. Mini helis have a 5min cooldown. Heli bombing increases cooldown to 6hrs for 2 days.", items: "Thompson, pistol ammo, stone, metal fragments, HQM, wood, scrap, pumpkins, road sign armor set, wooden barricade cover, medsticks, bandages, and medkit." },
  "Recruit Tier": { image: "/kits/Recruit Tier.jpg", title: "Recruit Tier", desc: "Basic recruit loadout with mini heli access including 200 low grade, auto sort boxes, unlimited claims per wipe, and a 12 hour cooldown. Mini helis have a 5min cooldown. Heli bombing increases cooldown to 6hrs for 2 days.", items: "P2, pistol ammo, wooden armor set with burlap clothes, wooden barricade cover, medstick, bandages, pumpkins, standard tools, wood, stone, metal fragments, and scrap." },
  "Enlistment Tier": { image: "/kits/Enlistmnt Tier.jpg", title: "Enlistment Tier", desc: "Improved mid-early wipe progression tier with mini heli access including 200 low grade, auto sort boxes, better gear, unlimited claims per wipe, and a 12 hour cooldown. Mini helis have a 5min cooldown. Heli bombing increases cooldown to 6hrs for 2 days.", items: "Custom SMG, pistol ammo, wooden barricade cover, medsticks, bandages, pumpkins, road sign armor set, wood, stone, metal fragments, scrap, salvage tools, and basic fragments." },
  "Soldier Tier": { image: "/kits/Soldier Tier.jpg", title: "Soldier Tier", desc: "Mid-game combat progression tier with unlimited fuel mini heli access, VIP queue skip, twice the standard turret limit, auto auth to TC/doors/turrets, auto sort boxes, box stacking, /remove, unlimited claims per wipe, and a 12 hour cooldown. Mini helis have a 5min cooldown. Heli bombing increases cooldown to 6hrs for 2 days.", items: "Thompson SMG, pistol ammo, wooden barricade cover, medsticks, bandages, medpack, roadsign armor set, wood, stone, metal fragments, HQM, scrap, tier 2 workbench, salvage tools, and pumpkins." },
  "Officer Tier": { image: "/kits/Officer Tier.jpg", title: "Officer Tier", desc: "Officer monthly access with unlimited fuel mini heli access, special mini, attack heli, and transport heli spawns, VIP queue skip, unlimited turret limit, auto auth to TC/doors/turrets, auto sort boxes, box stacking, /remove, insta craft, auto sort furnaces, unlimited claims per wipe, and a 12 hour cooldown. Mini helis have a 5min cooldown. Attack helis have a 1hr cooldown. Heli bombing increases cooldown to 6hrs for 2 days.", items: "Assault Rifle, rifle ammo, gunpowder, medsticks, pumpkins, airdrops, full metal armor set, hoodie, pants, tactical gloves, boots, tier 3 workbench, jackhammer, chainsaw, low grade fuel, cloth, coffins, loot bag, scrap, wood, stone, metal fragments, and HQM." },
  "Officer Tier Lifetime": { image: "/kits/Officer Tier Lifetime.jpg", title: "Officer Tier Lifetime", desc: "Permanent Officer access with unlimited fuel mini heli access, special mini, attack heli, and transport heli spawns, VIP queue skip, unlimited turret limit, auto auth to TC/doors/turrets, auto sort boxes, box stacking, /remove, insta craft, auto sort furnaces, unlimited claims per wipe, and a 12 hour cooldown. Mini helis have a 5min cooldown. Attack helis have a 1hr cooldown. Heli bombing increases cooldown to 6hrs for 2 days.", items: "Assault Rifle, rifle ammo, gunpowder, medsticks, pumpkins, airdrops, full metal armor set, hoodie, pants, tactical gloves, boots, tier 3 workbench, jackhammer, chainsaw, low grade fuel, cloth, coffins, loot bag, scrap, wood, stone, metal fragments, and HQM." },
  "General Tier": { image: "/kits/General Tier.jpg", title: "General Tier", desc: "Top-tier monthly progression access with unlimited fuel mini heli access, special mini, attack heli, and transport heli spawns, VIP queue skip, unlimited turret limit, auto auth to TC/doors/turrets, auto sort boxes, box stacking, /remove, insta craft, auto sort furnaces, unlimited claims, and premium linked account perks. Mini helis have a 5min cooldown. Attack helis have a 1hr cooldown. Heli bombing increases cooldown to 6hrs for 2 days.", items: "Assault rifle, rifle ammo, gunpowder, full metal armor set, hoodie, pants, boots, tactical gloves, wood, stone, metal fragments, scrap, HQM, cloth, jackhammer, chainsaw, low grade fuel, tier 3 workbench, engineering workbench, pumpkins, loot bag, coffins, medsticks, medpacks, and airdrops." },
  "General Tier Lifetime": { image: "/kits/General Tier Lifetime.jpg", title: "General Tier Lifetime", desc: "Permanent top-tier progression access with unlimited fuel mini heli access, special mini, attack heli, and transport heli spawns, VIP queue skip, unlimited turret limit, auto auth to TC/doors/turrets, auto sort boxes, box stacking, /remove, insta craft, auto sort furnaces, unlimited claims, and premium linked account perks. Mini helis have a 5min cooldown. Attack helis have a 1hr cooldown. Heli bombing increases cooldown to 6hrs for 2 days.", items: "Assault rifle, rifle ammo, gunpowder, full metal armor set, hoodie, pants, boots, tactical gloves, wood, stone, metal fragments, scrap, HQM, cloth, jackhammer, chainsaw, low grade fuel, tier 3 workbench, engineering workbench, pumpkins, loot bag, coffins, medsticks, medpacks, and airdrops." },
  "Builder Kit": { image: "/kits/Builder Kit.jpg", title: "Builder Kit", desc: "Advanced building and compound support kit with premium construction supplies, CopyPaste support, unlimited claims per wipe, and a 12 hour cooldown.", items: "Wood, stone, metal fragments, HQM, code locks, vertical and horizontal embrasures, stone gate and high walls, metal barricades, garage door, TCs, coffins, tier 2 and engineering workbench, research table, repair bench, ladder, netting, metal window bars, armored doors, ladder hatches, building plan, and hammer." },
  "Electrical Kit": { image: "/kits/Electrical Kit.jpg", title: "Electrical Kit", desc: "Advanced electrical and automation support kit for power generation, industrial components, turrets, furnaces, and electrical utilities.", items: "Test gen, batteries, windmills, solar panels, electrical branch, switch, splitter, electric furnace, lights, fridge, industrial conveyer, industrial splitter, industrial combiner, computer station, wire tool, piping tool, auto turrets, pythons, and pistol ammo." },
  "Farm Kit": { image: "/kits/Farm Kit.jpg", title: "Farm Kit", desc: "Advanced farming and water-management kit with automated irrigation, plant growth systems, sprinklers, planters, and utilities.", items: "Water barrels, planters, water splitters, pumps, electrical components, batteries, lights, heaters, ceiling lights, sprinklers, water storage, hose tools, and farming deployables." }
};

const freeKits = [
  { icon: "🎒", title: "Starter Kit", badges: ["Steam Required", "3 Claims", "5 Min Cooldown"], desc: kitDetails["Starter Kit"].desc },
  { icon: "🍖", title: "Food Kit", badges: ["Steam Required", "Unlimited", "30 Min Cooldown"], desc: kitDetails["Food Kit"].desc },
  { icon: "💬", title: "Discord Kit", badges: ["Discord Required", "3 Claims", "5 Min Cooldown"], desc: kitDetails["Discord Kit"].desc },
  { icon: "🚀", title: "Discord Booster Kit", badges: ["Booster Required", "5 Claims", "1 Hr Cooldown"], desc: kitDetails["Discord Booster Kit"].desc }
];

const premiumKits = [
  { icon: "⭐", title: "VIP Queue Skip", price: "$5 / $50", cooldown: "Always Active", lifetimeTitle: "VIP Lifetime" },
  { icon: "🎖️", title: "Recruit Tier", price: "$20", cooldown: "12 Hr" },
  { icon: "🪖", title: "Enlistment Tier", price: "$40", cooldown: "12 Hr" },
  { icon: "⚔️", title: "Soldier Tier", price: "$60", cooldown: "12 Hr" },
  { icon: "🎯", title: "Officer Tier", price: "$80 / $160", cooldown: "12 Hr", lifetimeTitle: "Officer Tier Lifetime" },
  { icon: "👑", title: "General Tier", price: "$100 / $200", cooldown: "12 Hr", lifetimeTitle: "General Tier Lifetime" },
  { icon: "🏗️", title: "Builder Kit", price: "$15", cooldown: "12 Hr" },
  { icon: "🔌", title: "Electrical Kit", price: "$15", cooldown: "12 Hr" },
  { icon: "🌾", title: "Farm Kit", price: "$10", cooldown: "12 Hr" }
];

function KitModal({ kit, onClose }) {
  if (!kit) return null;
  return (
    <div className="modal">
      <div className="modalInner kitModalInner">
        <button className="close" onClick={onClose}>✕ Close</button>
        <div className="modalGrid">
          <img src={kit.image} alt={`${kit.title} preview`} className="kitImg" />
          <div className="modalCopy">
            <p className="eyebrow">Kit Preview</p>
            <h2 className="h2">{kit.title}</h2>
            <p className="muted">{kit.desc}</p>
            <div className="modalBox"><h3>Items Provided</h3><p>{kit.items}</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const [preview, setPreview] = useState(null);
  const [linked, setLinked] = useState({ steam: false, discord: false });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const steamLinked = params.get("steam") === "linked" || localStorage.getItem("btarust_steam_linked") === "true";
    const discordLinked = params.get("discord") === "linked" || localStorage.getItem("btarust_discord_linked") === "true";
    if (params.get("steam") === "linked") localStorage.setItem("btarust_steam_linked", "true");
    if (params.get("discord") === "linked") localStorage.setItem("btarust_discord_linked", "true");
    setLinked({ steam: steamLinked, discord: discordLinked });
  }, []);

  return (
    <>
      <div className="bg" />
      <header className="header container">
        <div className="brand">
          <img src="/BTARust.jpg" alt="BTARust" />
          <div><b>BTARust.net</b><div className="eyebrow">Rust Servers</div></div>
        </div>
        <nav className="nav">
          <a href="#servers">Servers</a><a href="#linking">Account Linking</a><a href="#kits">Kits</a><a href="#rules">Rules</a>
        </nav>
        <div className="actions">
          <div className="badges" style={{ margin: 0, alignItems: "center" }}>
            <Badge tone={linked.steam ? "green" : "orange"}>{linked.steam ? "Steam Linked" : "Steam not linked"}</Badge>
            <Badge tone={linked.discord ? "green" : "orange"}>{linked.discord ? "Discord Linked" : "Discord not linked"}</Badge>
          </div>
          <a href={tebexStore}><Button outline>Open Store</Button></a>
          <a href={discordInvite}><Button>Join Discord</Button></a>
        </div>
      </header>

      <main>
        <section className="hero container">
          <div>
            <img className="logo" src="/BTARust.jpg" alt="BTARust logo" />
            <div className="pill">🔥 Current server: Vanilla Monthly</div>
            <h1 className="h1">Survive, build, raid, and dominate on <span className="orange">BTARust.net</span></h1>
            <div className="actions" style={{ marginTop: 28 }}><a href="#servers"><Button>View Servers</Button></a><a href="#linking"><Button outline>Link Accounts</Button></a></div>
          </div>
          <Card extra="orangeBorder">
            <p className="eyebrow">Featured Server</p><h2 className="h2">Vanilla Monthly</h2>
            <p className="muted">Monthly wipes, vanilla gather rates, and fair progression. Search Rust for BTARust.net.</p><Badge tone="green">Live</Badge>
          </Card>
        </section>

        <section className="container section"><Countdown /></section>

        <section id="servers" className="container section">
          <div className="sectionHead"><div><p className="eyebrow">Server Lineup</p><h2 className="h2">Choose your battlefield</h2></div><p className="muted">Start on Vanilla Monthly while the BTARust.net network expands.</p></div>
          <div className="grid grid3">
            {servers.map((server) => (
              <Card key={server.name} extra="orangeBorder">
                <Badge tone={server.status === "Live Now" ? "green" : "orange"}>{server.status}</Badge>
                <h3 className="kitTitle">{server.name}</h3>
                <div className="badges"><Badge>{server.rate}</Badge><Badge>{server.wipe}</Badge></div>
                <p className="muted">{server.desc}</p>
                {server.bm && <a href={server.bm}><Button>📊 BattleMetrics</Button></a>}
              </Card>
            ))}
          </div>
        </section>

        <section id="rules" className="container section">
          <Card><p className="eyebrow">Server Rules</p><h2 className="h2">Simple rules. Better wipes.</h2>
            <div className="grid rules" style={{ marginTop: 24 }}>{rules.map((rule) => <div className="rule" key={rule}>🛡️ {rule}</div>)}</div>
          </Card>
        </section>

        <section id="linking" className="container section">
          <Card extra="orangeBorder">
            <p className="eyebrow">Account Linking</p><h2 className="h2">Link Steam and Discord</h2>
            <p className="muted">Connect accounts so purchases, kits, permissions, cooldowns, and Discord roles sync to the correct Rust account.</p>
            <div className="actions">
              {linked.steam ? <Button>✅ Steam Linked</Button> : <a href="/api/auth/steam"><Button>🔗 Connect Steam</Button></a>}
              {linked.discord ? <Button outline>✅ Discord Linked</Button> : <a href="/api/auth/discord"><Button outline>💬 Connect Discord</Button></a>}
            </div>
            <p className="muted" style={{ marginTop: 12 }}>After Steam or Discord authorization, the account status badges in the header will update to show whether each account is linked.</p>
          </Card>
        </section>

        <section id="kits" className="container section">
          <p className="eyebrow">Free Starter Kits</p><h2 className="h2">Claim free kits by linking accounts</h2>
          <div className="grid grid4" style={{ marginTop: 24 }}>
            {freeKits.map((kit) => (
              <Card key={kit.title}>
                <div className="kitIcon">{kit.icon}</div><h3 className="kitTitle">{kit.title}</h3>
                <div className="badges">{kit.badges.map((badge) => <Badge key={badge}>{badge}</Badge>)}</div>
                <p className="muted">{kit.desc}</p><Button outline onClick={() => setPreview(kitDetails[kit.title])}>👀 View Kit</Button>
              </Card>
            ))}
          </div>

          <p className="eyebrow" style={{ marginTop: 48 }}>Premium Kits</p><h2 className="h2">Unlock advanced kits and perks</h2>
          <div className="grid grid3" style={{ marginTop: 24 }}>
            {premiumKits.map((kit) => (
              <Card key={kit.title}>
                <div className="kitIcon">{kit.icon}</div><h3 className="kitTitle">{kit.title}</h3>
                <div className="badges"><Badge tone="orange">{kit.price}</Badge><Badge>{kit.cooldown} Cooldown</Badge><Badge>Steam Linked</Badge><Badge>Discord Linked</Badge></div>
                <p className="muted">{kitDetails[kit.title]?.desc || "Premium server rewards synced to your linked Rust account."}</p>
                <div className="actions">
                  <a href={tebexStore}><Button>🛒 Buy on Tebex</Button></a>
                  <Button outline onClick={() => setPreview(kitDetails[kit.title])}>👀 View Kit</Button>
                  {kit.lifetimeTitle && <Button outline onClick={() => setPreview(kitDetails[kit.lifetimeTitle])}>👑 View Lifetime</Button>}
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="container section">
          <Card>
            <p className="eyebrow">Store Disclaimer</p><h2 className="h2">Donation & Refund Policy</h2>
            <div className="muted" style={{display:"grid",gap:"14px"}}>
              <p>All purchases made through the BTARust.net Tebex store are considered voluntary donations supporting server development, hosting, maintenance, custom plugins, moderation, and community operations. By completing a purchase, you acknowledge that you are receiving digital virtual goods, perks, ranks, or access tied exclusively to BTARust.net servers and services.</p>
              <p>Due to the digital nature of in-game items, ranks, permissions, and server-related benefits, all purchases are final and non-refundable unless required by applicable law or approved directly by BTARust.net administration. Chargebacks, fraudulent disputes, payment reversals, or unauthorized transaction claims may result in permanent suspension from all BTARust.net services, including game servers, Discord services, and associated platforms.</p>
              <p>BTARust.net reserves the right to modify, rebalance, remove, wipe, replace, suspend, or discontinue any server feature, kit, rank, item, permission, cooldown, server, or perk at any time without prior notice in order to maintain gameplay balance, server health, security, stability, or community fairness.</p>
              <p>BTARust.net staff members, moderators, developers, owners, affiliates, and partners are not liable for data loss, item loss, server downtime, wipes, plugin failures, exploits, account compromises, gameplay interruptions, third-party outages, or any damages arising from use of BTARust.net services. All services are provided on an “as-is” and “as-available” basis without warranties or guarantees of uninterrupted availability.</p>
              <p>By using BTARust.net services, purchasing store items, or accessing community platforms, you agree to follow all server rules, community guidelines, Facepunch Studios terms of service, Steam terms of service, Discord terms of service, and Tebex policies. Violations may result in suspension or termination of access without refund eligibility.</p>
              <p>BTARust.net may offer a conditional Ban Appeal Reinstatement option for eligible community bans issued exclusively on BTARust.net servers. In order to qualify, the banned player must first submit a formal support ticket and complete a manual ban appeal review through the official BTARust.net Discord server. Appeals are reviewed solely by authorized BTARust.net staff members.</p>
              <p>If a player’s appeal is approved by BTARust.net staff, a private “Unban Me” purchase option may then become available to the approved player through Tebex. The purchase option is only accessible after staff approval and does not bypass the required review process. Purchasing the approved reinstatement option will restore access only to BTARust.net community servers and services approved by staff.</p>
              <p>Cheating bans, EAC bans, Facepunch bans, fraudulent activity, severe harassment, exploit abuse, ban evasion, or repeat offenses may automatically disqualify a player from eligibility. BTARust.net staff reserve full discretion to approve, deny, revoke, or permanently refuse any appeal request for reasons related to community safety, fairness, server integrity, or platform compliance. Any payments associated with approved reinstatement reviews are considered administrative processing fees and are non-refundable once review processing or reinstatement actions begin.</p>
              <p>If you experience payment issues or require assistance, please contact BTARust.net staff through the official Discord server before opening disputes or chargebacks.</p>
            </div>
          </Card>
        </section>
      </main>

      <footer className="footer">© BTARust.net • Built for Rust players • {siteUrl}</footer>
      <KitModal kit={preview} onClose={() => setPreview(null)} />
    </>
  );
}
