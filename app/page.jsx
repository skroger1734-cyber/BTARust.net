"use client";

import React, { useEffect, useMemo, useState } from "react";

const siteUrl = "https://www.btarust.net";
const tebexStore = "https://btarustnet.tebex.io";
const discordInvite = "https://discord.gg/bXGd4SGEw2";

function Button({ children, outline = false, onClick }) {
  return (
    <button onClick={onClick} className={`btn ${outline ? "outline" : ""}`}>
      {children}
    </button>
  );
}

function Card({ children, extra = "" }) {
  return (
    <div className={`card ${extra}`}>
      <div className="pad">{children}</div>
    </div>
  );
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
        {vals.map(([label, value]) => (
          <div key={label}>
            <strong>{String(value).padStart(2, "0")}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <p className="muted">
        Next wipe: <b>{wipe.toLocaleString()}</b>
      </p>
    </Card>
  );
}

const servers = [
  {
    name: "BTARust.net | US | Vanilla+ Monthly",
    status: "Live Now",
    rate: "QoL/Loot+",
    wipe: "Full Wipe",
    desc: "Vanilla+ monthly Rust experience with QoL improvements, boosted loot progression, no team limits, active moderation, and full monthly wipes.",
    bm: "https://www.battlemetrics.com/servers/rust/38992245",
    connect: "steam://connect/216.245.177.18:28015",
    client: "216.245.177.18:28015"
  },
  {
    name: "BTARust.net | US | 2x Monthly",
    status: "Coming Soon",
    rate: "QoL/Loot+ 2x",
    wipe: "Full Wipe",
    desc: "Upcoming 2x monthly Rust server with faster progression, QoL improvements, Loot+, no team limits, active moderation, and full monthly wipes."
  },
  {
    name: "BTARust.net | US | 3x Monthly",
    status: "Live Now",
    rate: "QoL/Loot+ 3x",
    wipe: "Full Wipe",
    desc: "Fast-paced 3x monthly Rust server with boosted loot, QoL systems, no team limits, faster progression, PvP, raiding, and monthly wipes.",
    bm: "https://www.battlemetrics.com/servers/rust/39147285",
    connect: "steam://connect/144.48.106.226:28015",
    client: "144.48.106.226:28015"
  },
  {
    name: "BTARust.net Million X",
    status: "Coming Soon",
    rate: "Million X",
    wipe: "TBD",
    desc: "Focused PvP and raiding with extreme gather rates, fast progression, and high-action gameplay."
  },
  {
    name: "BTARust.net Creative",
    status: "Coming Soon",
    rate: "Creative",
    wipe: "TBD",
    desc: "Build-focused creative server for testing bases, practicing designs, experimenting with electrical setups, and planning raid bases."
  }
];

const rules = [
  "Team Limit: No Limit",
  "NO CHEATING",
  "Respect admins and moderators",
  "No racism, hate speech, or harassment",
  "Heli Bombing with kit minis will increase your cooldown from 5min to 1hr, and it will last up to 12hrs.",
  "Abuse of the 24hr wipe protection system may result in temporary bans.",
  "If one member of a team/clan disables wipe protection early to participate in raiding, all active team/clan members must also have protection disabled."
];

const kitDetails = {
  "Starter Kit": {
    image: "/kits/Starter.png",
    title: "Starter Kit",
    desc: "Starter kit with 3 claims per wipe and a 1 hour cooldown.",
    items: "Stone, metal fragments, wood, animal fat, pistol ammo, sheet metal doors, code locks, tool cupboard, building plan, hammer, revolver, spear, pumpkins, and medical supplies."
  },
  "Food Kit": {
    image: "/kits/Food.png",
    title: "Food Kit",
    desc: "Basic food and water recovery kit with a 30 minute cooldown.",
    items: "Water, cooked steak, pumpkins, and potatoes."
  },
  "Discord Kit": {
    image: "/kits/Discord.png",
    title: "Discord Kit",
    desc: "Free Discord-linked kit for players who connect their Discord account.",
    items: "Pistol ammo, hazmat suit, pistol, pickaxe, salvaged tool, bandages, and medical syringes."
  },
  "Discord Booster Kit": {
    image: "/kits/Discord Booster.png",
    title: "Discord Booster Kit",
    desc: "Reward kit for players who boost the BTARust.net Discord server. Includes 5 claims and a 1 hour cooldown.",
    items: "MP5, pistol ammo, jackhammer, chainsaw, low grade fuel, supply signal, road sign armor set, hoodie, pants, boots, tactical gloves, backpack, medical syringes, bandages, medkit, and wooden barricade cover."
  },
  "VIP": {
    image: "/kits/VIP.png",
    title: "VIP",
    desc: "Monthly VIP kit access with VIP queue skip permissions, unlimited claims per wipe, and a 12 hour cooldown.",
    items: "Pistol ammo, stone, metal fragments, wood, animal fat, gears, pumpkins, road sign armor, hoodie, pants, boots, tactical gloves, SMG, wooden barricades, medical syringes, bandages, and medkit."
  },
  "VIP Lifetime": {
    image: "/kits/VIP Lifetime.png",
    title: "VIP Lifetime",
    desc: "Lifetime VIP kit access with VIP queue skip permissions, unlimited claims per wipe, and a 12 hour cooldown.",
    items: "Pistol ammo, stone, metal fragments, wood, animal fat, gears, HQM, pumpkins, road sign armor, hoodie, pants, boots, tactical gloves, rifle, wooden barricades, medical syringes, bandages, and medkit."
  },
  "Recruit Tier": {
    image: "/kits/Recruit Tier.png",
    title: "Recruit Tier",
    desc: "Basic recruit loadout for early wipe progression with unlimited claims per wipe and a 12 hour cooldown.",
    items: "Pistol ammo, wood, stone, metal fragments, animal fat, gears, basic tools, burlap/wood armor, P2 pistol, wooden barricades, medical syringes, bandages, and pumpkins."
  },
  "Enlistment Tier": {
    image: "/kits/Enlistment Tier.png",
    title: "Enlistment Tier",
    desc: "Improved mid-early wipe progression kit with better gear, basic and advanced fragments, unlimited claims per wipe, and a 12 hour cooldown.",
    items: "Pistol ammo, wood, stone, metal fragments, animal fat, gears, salvage tools, road sign armor, hoodie, pants, boots, tactical gloves, SMG, barricades, medical syringes, bandages, and pumpkins."
  },
  "Soldier Tier": {
    image: "/kits/Soldier Tier.png",
    title: "Soldier Tier",
    desc: "Tier 2 progression access with mid-game combat support, advanced fragments, unlimited claims per wipe, and a 12 hour cooldown.",
    items: "Wood, stone, metal fragments, animal fat, HQM, gears, salvage tools, pistol ammo, rifle ammo, road sign armor, hoodie, pants, boots, tactical gloves, rifle, barricades, medical syringes, medkits, bandages, and pumpkins."
  },
  "Officer Tier": {
    image: "/kits/Officer Tier.png",
    title: "Officer Tier",
    desc: "Tier 3 workbench access with premium mid-late wipe support, unlimited claims per wipe, and a 12 hour cooldown.",
    items: "Rifle ammo, wood, stone, metal fragments, animal fat, gears, HQM, weapon components, chainsaw, jackhammer, low grade fuel, cloth, coffins, armor, assault rifle, medical syringes, pumpkins, airdrops, and loot bag."
  },
  "Officer Tier Lifetime": {
    image: "/kits/Officer Tier Lifetime.png",
    title: "Officer Tier Lifetime",
    desc: "Permanent Officer access bundled with the Builder Kit. Includes Tier 3 workbench support, premium mid-late wipe resources, unlimited claims per wipe, and a 12 hour cooldown.",
    items: "Rifle ammo, wood, stone, metal fragments, animal fat, gears, HQM, weapon components, chainsaw, jackhammer, low grade fuel, cloth, coffins, armor, assault rifle, medical syringes, pumpkins, airdrops, and loot bag."
  },
  "General Tier": {
    image: "/kits/General Tier.png",
    title: "General Tier",
    desc: "Top-tier monthly progression kit with massive resource support, premium gear and utility access, unlimited claims per wipe, and a 12 hour cooldown.",
    items: "Rifle ammo, full metal gear, hoodie, pants, boots, tactical gloves, wood, stone, metal fragments, animal fat, gears, HQM, coffins, cloth, chainsaws, jackhammers, low grade fuel, weapon components, assault rifles, medical syringes, medkits, supply crates, barricades, airdrops, and pumpkins."
  },
  "General Tier Lifetime": {
    image: "/kits/General Tier Lifetime.png",
    title: "General Tier Lifetime",
    desc: "Permanent top-tier access bundled with Builder, Electrical, and Farm kits. Includes massive resource support, premium gear and utility access, unlimited claims per wipe, and a 12 hour cooldown.",
    items: "Rifle ammo, full metal gear, hoodie, pants, boots, tactical gloves, wood, stone, metal fragments, animal fat, gears, HQM, coffins, cloth, chainsaws, jackhammers, low grade fuel, weapon components, assault rifles, medical syringes, medkits, supply crates, barricades, airdrops, and pumpkins."
  },
  "Builder Kit": {
    image: "/kits/Builder Kit.png",
    title: "Builder Kit",
    desc: "Advanced building and compound support kit with premium construction supplies, unlimited claims per wipe, and a 12 hour cooldown.",
    items: "Wood, stone, metal fragments, HQM, code locks, doors, gates, walls, barricades, garage doors, tool cupboards, coffins, workbenches, research table, repair bench, ladder, netting, window bars, armored doors, ladder hatches, building plan, and hammer."
  },
  "Electrical Kit": {
    image: "/kits/Electrical Kit.png",
    title: "Electrical Kit",
    desc: "Advanced electrical and automation support kit for power generation, industrial components, turrets, furnaces, and utilities with a 24 hour cooldown.",
    items: "Generator, batteries, windmills, solar panels, electrical branches, switches, splitters, electric furnaces, lights, fridge, industrial components, computer station, wire tool, piping tool, auto turrets, weapons, and ammo."
  },
  "Farm Kit": {
    image: "/kits/Farm Kit.png",
    title: "Farm Kit",
    desc: "Advanced farming and water management kit with automated irrigation, plant growth systems, sprinklers, planters, and utilities.",
    items: "Water barrels, planters, water splitters, pumps, electrical components, batteries, lights, heaters, sprinklers, water storage, hose tools, farming deployables, clones, seeds, and food."
  }
};

const freeKits = [
  { icon: "🎒", title: "Starter Kit", badges: ["Steam Required", "3 Claims", "1 Hr Cooldown"], desc: kitDetails["Starter Kit"].desc },
  { icon: "🍖", title: "Food Kit", badges: ["Steam Required", "Unlimited", "30 Min Cooldown"], desc: kitDetails["Food Kit"].desc },
  { icon: "💬", title: "Discord Kit", badges: ["Discord Required", "3 Claims", "5 Min Cooldown"], desc: kitDetails["Discord Kit"].desc },
  { icon: "🚀", title: "Discord Booster Kit", badges: ["Booster Required", "5 Claims", "1 Hr Cooldown"], desc: kitDetails["Discord Booster Kit"].desc }
];

const premiumKits = [
  { icon: "⭐", title: "VIP", price: "$5", cooldown: "12 Hr" },
  { icon: "🎖️", title: "Recruit Tier", price: "$20", cooldown: "12 Hr" },
  { icon: "🪖", title: "Enlistment Tier", price: "$40", cooldown: "12 Hr" },
  { icon: "⚔️", title: "Soldier Tier", price: "$60", cooldown: "12 Hr" },
  { icon: "🎯", title: "Officer Tier", price: "$80", cooldown: "12 Hr" },
  { icon: "👑", title: "General Tier", price: "$100", cooldown: "12 Hr" },
  { icon: "🏗️", title: "Builder Kit", price: "$15", cooldown: "12 Hr" },
  { icon: "🔌", title: "Electrical Kit", price: "$15", cooldown: "24 Hr" },
  { icon: "🌾", title: "Farm Kit", price: "$10", cooldown: "12 Hr" }
];

const lifetimeKits = [
  {
    icon: "⭐",
    title: "VIP Lifetime",
    price: "Lifetime",
    cooldown: "12 Hr",
    bundle: "Permanent VIP access"
  },
  {
    icon: "🎯",
    title: "Officer Tier Lifetime",
    price: "$160",
    cooldown: "12 Hr",
    bundle: "Bundled with Builder Kit"
  },
  {
    icon: "👑",
    title: "General Tier Lifetime",
    price: "$200",
    cooldown: "12 Hr",
    bundle: "Bundled with Builder, Electrical & Farm Kits"
  }
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
            <div className="modalBox">
              <h3>Items Provided</h3>
              <p>{kit.items}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const [preview, setPreview] = useState(null);
  const [linked, setLinked] = useState({ steam: true, discord: true });
  const steamLogo = "https://community.cloudflare.steamstatic.com/public/shared/images/responsive/share_steam_logo.png";
  const discordLogo = "https://cdn.discordapp.com/embed/avatars/0.png";

  const [profile, setProfile] = useState({
    steamName: "Steam Player",
    steamAvatar: steamLogo,
    discordName: "Discord User",
    discordAvatar: discordLogo
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const steamLinked = params.get("steam") === "linked" || localStorage.getItem("btarust_steam_linked") === "true";
    const discordLinked = params.get("discord") === "linked" || localStorage.getItem("btarust_discord_linked") === "true";

    if (params.get("steam") === "linked") localStorage.setItem("btarust_steam_linked", "true");
    if (params.get("discord") === "linked") localStorage.setItem("btarust_discord_linked", "true");

    const steamNameFromUrl = params.get("steam_name");
    const steamAvatarFromUrl = params.get("steam_avatar");
    const discordNameFromUrl = params.get("discord_name");
    const discordAvatarFromUrl = params.get("discord_avatar");

    if (steamNameFromUrl) localStorage.setItem("btarust_steam_name", steamNameFromUrl);
    if (steamAvatarFromUrl) localStorage.setItem("btarust_steam_avatar", steamAvatarFromUrl);
    if (discordNameFromUrl) localStorage.setItem("btarust_discord_name", discordNameFromUrl);
    if (discordAvatarFromUrl) localStorage.setItem("btarust_discord_avatar", discordAvatarFromUrl);

    setLinked({ steam: steamLinked, discord: discordLinked });
    setProfile({
      steamName: localStorage.getItem("btarust_steam_name") || "Steam Player",
      steamAvatar: steamLinked ? localStorage.getItem("btarust_steam_avatar") || steamLogo : steamLogo,
      discordName: localStorage.getItem("btarust_discord_name") || "Discord User",
      discordAvatar: discordLinked ? localStorage.getItem("btarust_discord_avatar") || discordLogo : discordLogo
    });
  }, []);

  const unlinkAccount = async (type) => {
    const confirmed = window.confirm(`Unlink your ${type === "steam" ? "Steam" : "Discord"} account from this website?`);
    if (!confirmed) return;

    localStorage.removeItem(type === "steam" ? "btarust_steam_linked" : "btarust_discord_linked");
    localStorage.removeItem(type === "steam" ? "btarust_steam_name" : "btarust_discord_name");
    localStorage.removeItem(type === "steam" ? "btarust_steam_avatar" : "btarust_discord_avatar");
    setLinked((current) => ({ ...current, [type]: false }));
    setProfile((current) => ({
      ...current,
      ...(type === "steam" ? { steamName: "Steam Player", steamAvatar: steamLogo } : {}),
      ...(type === "discord" ? { discordName: "Discord User", discordAvatar: discordLogo } : {})
    }));

    try {
      await fetch(`/api/auth/${type}/unlink`, { method: "POST" });
    } catch (error) {
      console.warn(`${type} unlink API route not available yet. Local unlink completed.`, error);
    }
  };

  const openKit = (title) => {
    setPreview(kitDetails[title]);
  };

  return (
    <>
      <style>{`
        *{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:#09090b;color:#f4f4f5;font-family:Inter,system-ui,Segoe UI,Arial,sans-serif}a{color:inherit;text-decoration:none}.bg{position:fixed;inset:0;z-index:-1;background:radial-gradient(circle at top left,rgba(249,115,22,.25),transparent 35%),linear-gradient(180deg,rgba(9,9,11,.75),#09090b 70%)}.container{max-width:1280px;margin:0 auto;padding:0 24px}.header{display:flex;align-items:center;justify-content:space-between;padding:22px 24px;gap:20px}.brand{display:flex;align-items:center;gap:14px}.brand img{width:52px;height:52px;border-radius:16px;border:1px solid rgba(249,115,22,.35)}.nav{display:flex;gap:22px;color:#d4d4d8;font-size:14px}.actions{display:flex;gap:10px;flex-wrap:wrap}.btn{display:inline-flex;align-items:center;justify-content:center;border-radius:18px;padding:12px 18px;font-weight:800;border:0;cursor:pointer;background:#ea580c;color:white;box-shadow:0 12px 28px rgba(124,45,18,.35)}.btn.outline{background:rgba(9,9,11,.65);border:1px solid #3f3f46;color:#fafafa;box-shadow:none}.hero{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;padding-top:70px;padding-bottom:70px}.logo{width:210px;height:210px;border-radius:28px;border:1px solid rgba(249,115,22,.35);object-fit:cover;box-shadow:0 25px 80px rgba(0,0,0,.45)}.pill{display:inline-flex;padding:8px 14px;border:1px solid rgba(249,115,22,.35);border-radius:999px;background:rgba(124,45,18,.25);color:#fed7aa;font-size:14px;margin:20px 0}.h1{font-size:64px;line-height:1;letter-spacing:-.04em;margin:0;font-weight:1000}.orange{color:#fb923c}.card{border:1px solid #27272a;background:rgba(9,9,11,.78);border-radius:28px;box-shadow:0 25px 70px rgba(0,0,0,.35)}.card.orangeBorder{border-color:rgba(249,115,22,.45)}.pad{padding:26px}.section{padding:56px 0}.sectionHead{display:flex;justify-content:space-between;gap:24px;align-items:end;margin-bottom:28px}.eyebrow{font-size:13px;text-transform:uppercase;letter-spacing:.18em;color:#fdba74;font-weight:800}.h2{font-size:40px;line-height:1.05;margin:10px 0 0;font-weight:1000;letter-spacing:-.03em}.muted{color:#a1a1aa;line-height:1.65}.grid{display:grid;gap:20px}.grid3{grid-template-columns:repeat(3,1fr)}.grid4{grid-template-columns:repeat(4,1fr)}.badge{display:inline-flex;border-radius:999px;background:#18181b;padding:6px 10px;font-size:12px;font-weight:900;color:#d4d4d8}.badge.green{background:rgba(16,185,129,.16);color:#86efac}.badge.orange{background:rgba(249,115,22,.16);color:#fdba74;border:1px solid rgba(249,115,22,.25)}.kitIcon{width:56px;height:56px;border-radius:18px;background:rgba(249,115,22,.18);display:flex;align-items:center;justify-content:center;font-size:30px}.kitTitle{font-size:26px;margin:20px 0 8px;font-weight:1000}.badges{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0}.kitImg{max-width:100%;border-radius:20px;border:1px solid #3f3f46;background:#09090b}.count{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:20px}.count div{background:rgba(24,24,27,.75);border:1px solid #27272a;border-radius:20px;padding:18px;text-align:center}.count strong{display:block;color:#fdba74;font-size:38px}.modal{position:fixed;inset:0;background:rgba(0,0,0,.82);z-index:50;display:flex;align-items:center;justify-content:center;padding:24px}.modalInner{position:relative;max-width:1100px;max-height:92vh;overflow:auto;background:#09090b;border:1px solid rgba(249,115,22,.35);border-radius:24px;padding:18px}.kitModalInner{max-width:1200px}.close{position:absolute;right:16px;top:16px;background:#ef4444;color:white;border:0;border-radius:12px;padding:10px 14px;font-weight:900;z-index:5;cursor:pointer}.modalGrid{display:grid;grid-template-columns:1.25fr .75fr;gap:22px;align-items:start;padding-top:48px}.modalCopy{padding:8px 6px}.modalBox{margin-top:20px;border:1px solid #27272a;background:rgba(24,24,27,.75);border-radius:20px;padding:18px}.modalBox h3{margin:0 0 10px;color:#fdba74}.modalBox p{margin:0;color:#d4d4d8;line-height:1.65}.footer{text-align:center;color:#a1a1aa;padding:50px 0;border-top:1px solid #27272a}.rules{grid-template-columns:repeat(2,1fr)}.rule{background:rgba(24,24,27,.7);border:1px solid #27272a;border-radius:18px;padding:16px}@media(max-width:900px){.hero,.grid3,.grid4,.rules,.modalGrid{grid-template-columns:1fr}.nav{display:none}.h1{font-size:44px}.sectionHead{display:block}.header{align-items:flex-start;flex-direction:column}.count{grid-template-columns:repeat(2,1fr)}}
      `}</style>
      <div className="bg" />
      <header className="header container">
        <div className="brand">
          <img src="/BTARust.jpg" alt="BTARust" />
          <div>
            <b>BTARust.net</b>
            <div className="eyebrow">Rust Servers</div>
          </div>
        </div>
        <nav className="nav">
          <a href="#servers">Servers</a>
          <a href="#linking">Account Linking</a>
          <a href="#kits">Kits</a>
          <a href="#rules">Rules</a>
        </nav>
        <div className="actions">
          <div className="badges" style={{ margin: 0, alignItems: 'center' }}>
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
            
            <h1 className="h1">
              Survive, build, raid, and dominate on <span className="orange">BTARust.net</span>
            </h1>
            <p className="muted" style={{ maxWidth: 620, marginTop: 20 }}>
              Vanilla-style Rust with active admins, fair wipes, linked account rewards, free kits, VIP progression, and a growing multi-server network.
            </p>
            <div className="actions" style={{ marginTop: 30 }}>
              <a href="steam://connect/btarust.net:28015"><Button>View Servers</Button></a>
              <a href="#linking"><Button outline>Link Accounts</Button></a>
            </div>
          </div>

          <Card extra="orangeBorder">
            <p className="eyebrow">Featured Servers</p>
            <h2 className="h2">Vanilla+ & 3x Monthly</h2>
            <p className="muted">
              Two live BTARust.net servers featuring QoL improvements, Loot+, no team limits, active moderation, and full monthly wipes.
            </p>
            <div className="badges" style={{ marginTop: 18 }}>
              <Badge tone="green">Live</Badge>
              <Badge>Monthly</Badge>
              <Badge>US</Badge>
            </div>
          </Card>
        </section>

        <section className="container section"><Countdown /></section>

        <section id="servers" className="container section">
          <div className="sectionHead">
            <div>
              <p className="eyebrow">Server Lineup</p>
              <h2 className="h2">Choose your battlefield</h2>
            </div>
            <p className="muted">Both BTARust.net monthly servers are now live and accepting players.</p>
          </div>

          <div className="grid grid3">
            {servers.map((server) => (
              <Card key={server.name} extra="orangeBorder">
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <Badge tone={server.status === "Live Now" ? "green" : "orange"}>{server.status}</Badge>
                  <Badge>{server.rate}</Badge>
                </div>

                <h3 className="kitTitle">{server.name}</h3>
                <p className="muted">{server.desc}</p>

                <div className="actions" style={{marginTop:18}}>
                  {server.connect && server.status === "Live Now" && (
                    <a href={server.connect}><Button>Connect to Server</Button></a>
                  )}

                  {server.client && server.status === "Live Now" && (
                    <div className="muted" style={{marginTop:12,fontWeight:700}}>
                      Client Connect: {server.client}
                    </div>
                  )}

                  {server.bm && (
                    <a href={server.bm} target="_blank" rel="noreferrer">
                      <Button outline>BattleMetrics</Button>
                    </a>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section id="rules" className="container section">
          <Card>
            <p className="eyebrow">Server Rules</p>
            <h2 className="h2">Simple rules. Better wipes.</h2>
            <div className="grid rules" style={{ marginTop: 24 }}>
              {rules.map((rule) => <div className="rule" key={rule}>🛡️ {rule}</div>)}
            </div>
          </Card>
        </section>

        <section id="linking" className="container section">
          <Card extra="orangeBorder">
            <p className="eyebrow">Account Linking</p>
            <h2 className="h2">Linked Account Status</h2>
            <p className="muted">Connect Steam and Discord so purchases, kits, VIP rewards, cooldowns, and Discord permissions sync to the correct Rust profile.</p>

            <div style={{
              marginTop: 26,
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 18
            }}>
              <div style={{
                border: '1px solid rgba(249,115,22,.35)',
                borderRadius: 24,
                background: 'linear-gradient(135deg, rgba(24,24,27,.9), rgba(9,9,11,.82))',
                padding: 22,
                display: 'flex',
                gap: 18,
                alignItems: 'center',
                minHeight: 160
              }}>
                <img
                  src={profile.steamAvatar}
                  alt="Steam profile avatar"
                  style={{ width: 88, height: 88, borderRadius: 22, border: linked.steam ? '2px solid rgba(34,197,94,.65)' : '2px solid rgba(249,115,22,.45)', objectFit: 'cover', background: '#18181b' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, fontSize: 26, fontWeight: 1000 }}>Steam Account</h3>
                    <Badge tone={linked.steam ? "green" : "orange"}>{linked.steam ? "Connected" : "Not Linked"}</Badge>
                  </div>
                  <p className="muted" style={{ margin: '10px 0 0' }}>
                    {linked.steam ? profile.steamName : 'Connect Steam to claim kits and sync Tebex purchases.'}
                  </p>
                  <div className="actions" style={{ marginTop: 16 }}>
                    {linked.steam ? (
                      <Button outline onClick={() => unlinkAccount("steam")}>❌ Unlink Steam</Button>
                    ) : (
                      <a href="/api/auth/steam"><Button>🔗 Connect Steam</Button></a>
                    )}
                  </div>
                </div>
              </div>

              <div style={{
                border: '1px solid rgba(249,115,22,.35)',
                borderRadius: 24,
                background: 'linear-gradient(135deg, rgba(24,24,27,.9), rgba(9,9,11,.82))',
                padding: 22,
                display: 'flex',
                gap: 18,
                alignItems: 'center',
                minHeight: 160
              }}>
                <img
                  src={profile.discordAvatar}
                  alt="Discord profile avatar"
                  style={{ width: 88, height: 88, borderRadius: 22, border: linked.discord ? '2px solid rgba(34,197,94,.65)' : '2px solid rgba(249,115,22,.45)', objectFit: 'cover', background: '#18181b' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, fontSize: 26, fontWeight: 1000 }}>Discord Account</h3>
                    <Badge tone={linked.discord ? "green" : "orange"}>{linked.discord ? "Connected" : "Not Linked"}</Badge>
                  </div>
                  <p className="muted" style={{ margin: '10px 0 0' }}>
                    {linked.discord ? profile.discordName : 'Connect Discord to sync roles and community rewards.'}
                  </p>
                  <div className="actions" style={{ marginTop: 16 }}>
                    {linked.discord ? (
                      <Button outline onClick={() => unlinkAccount("discord")}>❌ Unlink Discord</Button>
                    ) : (
                      <a href="/api/auth/discord"><Button outline>💬 Connect Discord</Button></a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              marginTop: 22,
              display: 'flex',
              justifyContent: 'center'
            }}>
              <Button
                onClick={() => {
                  unlinkAccount('steam');
                  unlinkAccount('discord');
                }}
                outline
              >
                ❌ Unlink All Accounts
              </Button>
            </div>
          </Card>
        </section>

        <section id="kits" className="container section">
          <p className="eyebrow">Free Starter Kits</p>
          <h2 className="h2">Claim free kits by linking accounts</h2>
          <p className="muted" style={{ marginTop: 12, marginBottom: 0 }}>
            Kits are usable across all BTARust.net servers.
          </p>
          <div className="grid grid4" style={{ marginTop: 24 }}>
            {freeKits.map((kit) => (
              <Card key={kit.title}>
                <div className="kitIcon">{kit.icon}</div>
                <h3 className="kitTitle">{kit.title}</h3>
                <div className="badges">{kit.badges.map((badge) => <Badge key={badge}>{badge}</Badge>)}</div>
                <p className="muted">{kit.desc}</p>
                <Button outline onClick={() => openKit(kit.title)}>👀 View Kit</Button>
              </Card>
            ))}
          </div>

          <p className="eyebrow" style={{ marginTop: 48 }}>Premium Kits</p>
          <h2 className="h2">Unlock advanced kits and perks</h2>
          <p className="muted" style={{ marginTop: 12, marginBottom: 0 }}>
            Kits are usable across all BTARust.net servers.
          </p>
          <div className="grid grid3" style={{ marginTop: 24 }}>
            {premiumKits.map((kit) => (
              <Card key={kit.title}>
                <div className="kitIcon">{kit.icon}</div>
                <h3 className="kitTitle">{kit.title}</h3>
                <div className="badges">
                  <Badge tone="orange">{kit.price}</Badge>
                  <Badge>{kit.cooldown} Cooldown</Badge>
                  <Badge>Steam Linked</Badge>
                  <Badge>Discord Linked</Badge>
                </div>
                <p className="muted">{kitDetails[kit.title]?.desc || "Premium server rewards synced to your linked Rust account."}</p>
                <div className="actions">
                  <a href={tebexStore}><Button>🛒 Buy on Tebex</Button></a>
                  <Button outline onClick={() => openKit(kit.title)}>👀 View Kit</Button>
                </div>
              </Card>
            ))}
          </div>

          <p className="eyebrow" style={{ marginTop: 48 }}>Lifetime Kits</p>
          <h2 className="h2">Permanent access and bundle perks</h2>
          <p className="muted" style={{ marginTop: 12, marginBottom: 0 }}>
            Lifetime kits are usable across all BTARust.net servers and include the bundled perks shown below.
          </p>
          <div className="grid grid3" style={{ marginTop: 24 }}>
            {lifetimeKits.map((kit) => (
              <Card key={kit.title} extra="orangeBorder">
                <div className="kitIcon">{kit.icon}</div>
                <h3 className="kitTitle">{kit.title}</h3>
                <div className="badges">
                  <Badge tone="orange">{kit.price}</Badge>
                  <Badge>{kit.cooldown} Cooldown</Badge>
                  <Badge tone="green">{kit.bundle}</Badge>
                  <Badge>Steam Linked</Badge>
                  <Badge>Discord Linked</Badge>
                </div>
                <p className="muted">{kitDetails[kit.title]?.desc || "Lifetime rewards synced to your linked Rust account."}</p>
                <div className="actions">
                  <a href={tebexStore}><Button>🛒 Buy on Tebex</Button></a>
                  <Button outline onClick={() => openKit(kit.title)}>👑 View Lifetime Kit</Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="container section">
          <Card>
            <p className="eyebrow">Store Disclaimer</p>
            <h2 className="h2">Donation & Refund Policy</h2>
            <div className="muted" style={{display:'grid',gap:'14px'}}><p>All purchases made through the BTARust.net Tebex store are considered voluntary donations supporting server development, hosting, maintenance, custom plugins, moderation, and community operations. By completing a purchase, you acknowledge that you are receiving digital virtual goods, perks, ranks, or access tied exclusively to BTARust.net servers and services.</p><p>Due to the digital nature of in-game items, ranks, permissions, and server-related benefits, all purchases are final and non-refundable unless required by applicable law or approved directly by BTARust.net administration. Chargebacks, fraudulent disputes, payment reversals, or unauthorized transaction claims may result in permanent suspension from all BTARust.net services, including game servers, Discord services, and associated platforms.</p><p>BTARust.net reserves the right to modify, rebalance, remove, wipe, replace, suspend, or discontinue any server feature, kit, rank, item, permission, cooldown, server, or perk at any time without prior notice in order to maintain gameplay balance, server health, security, stability, or community fairness.</p><p>BTARust.net staff members, moderators, developers, owners, affiliates, and partners are not liable for data loss, item loss, server downtime, wipes, plugin failures, exploits, account compromises, gameplay interruptions, third-party outages, or any damages arising from use of BTARust.net services. All services are provided on an “as-is” and “as-available” basis without warranties or guarantees of uninterrupted availability.</p><p>By using BTARust.net services, purchasing store items, or accessing community platforms, you agree to follow all server rules, community guidelines, Facepunch Studios terms of service, Steam terms of service, Discord terms of service, and Tebex policies. Violations may result in suspension or termination of access without refund eligibility.</p><p>BTARust.net may offer a conditional Ban Appeal Reinstatement option for eligible community bans issued exclusively on BTARust.net servers. In order to qualify, the banned player must first submit a formal support ticket and complete a manual ban appeal review through the official BTARust.net Discord server. Appeals are reviewed solely by authorized BTARust.net staff members.</p><p>If a player’s appeal is approved by BTARust.net staff, a private “Unban Me” purchase option may then become available to the approved player through Tebex. The purchase option is only accessible after staff approval and does not bypass the required review process. Purchasing the approved reinstatement option will restore access only to BTARust.net community servers and services approved by staff.</p><p>Cheating bans, EAC bans, Facepunch bans, fraudulent activity, severe harassment, exploit abuse, ban evasion, or repeat offenses may automatically disqualify a player from eligibility. BTARust.net staff reserve full discretion to approve, deny, revoke, or permanently refuse any appeal request for reasons related to community safety, fairness, server integrity, or platform compliance. Any payments associated with approved reinstatement reviews are considered administrative processing fees and are non-refundable once review processing or reinstatement actions begin.</p><p>If you experience payment issues or require assistance, please contact BTARust.net staff through the official Discord server before opening disputes or chargebacks.</p></div>
          </Card>
        </section>
      </main>

      <footer className="footer">© BTARust.net • Built for Rust players • {siteUrl}</footer>
      <KitModal kit={preview} onClose={() => setPreview(null)} />
    </>
  );
}
