"use client";

import React, { useEffect, useMemo, useState } from "react";

const siteUrl = "https://btarust.net";
const tebexStore = "https://btarustnet.tebex.io";
const discordInvite = "https://discord.gg/bXGd4SGEw2";

function Button({ children, outline = false, onClick = undefined }) {
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
    name: "BTARust.net Vanilla Monthly",
    status: "Live Now",
    rate: "Vanilla",
    wipe: "Monthly",
    desc: "Clean fair Rust with standard gather rates, long-term progression, and monthly reset schedule.",
    bm: "https://www.battlemetrics.com/servers/rust/38992245",
    map: "https://rustmaps.com/map/648252_3500",
    connect: "steam://connect/btarust.net:28015"
  },
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
  const [linked, setLinked] = useState({ steam: false, discord: false });
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

    const steamLinkedFromUrl = params.get("steam") === "linked";
    const discordLinkedFromUrl = params.get("discord") === "linked";

    if (steamLinkedFromUrl) localStorage.setItem("btarust_steam_linked", "true");
    if (discordLinkedFromUrl) localStorage.setItem("btarust_discord_linked", "true");

    const steamNameFromUrl = params.get("steam_name");
    const steamAvatarFromUrl = params.get("steam_avatar");
    const discordNameFromUrl = params.get("discord_name");
    const discordAvatarFromUrl = params.get("discord_avatar");

    if (steamNameFromUrl) localStorage.setItem("btarust_steam_name", steamNameFromUrl);
    if (steamAvatarFromUrl) localStorage.setItem("btarust_steam_avatar", steamAvatarFromUrl);
    if (discordNameFromUrl) localStorage.setItem("btarust_discord_name", discordNameFromUrl);
    if (discordAvatarFromUrl) localStorage.setItem("btarust_discord_avatar", discordAvatarFromUrl);

    const steamLinked = localStorage.getItem("btarust_steam_linked") === "true";
    const discordLinked = localStorage.getItem("btarust_discord_linked") === "true";

    setLinked({ steam: steamLinked, discord: discordLinked });
    setProfile({
      steamName: steamLinked ? localStorage.getItem("btarust_steam_name") || "Steam Player" : "Steam Player",
      steamAvatar: steamLinked ? localStorage.getItem("btarust_steam_avatar") || steamLogo : steamLogo,
      discordName: discordLinked ? localStorage.getItem("btarust_discord_name") || "Discord User" : "Discord User",
      discordAvatar: discordLinked ? localStorage.getItem("btarust_discord_avatar") || discordLogo : discordLogo
    });

    if (steamLinkedFromUrl || discordLinkedFromUrl || params.get("steam") === "failed" || params.get("discord") === "failed") {
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, []);

  const unlinkOnly = async (type) => {
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

  const unlinkAccount = async (type) => {
    const confirmed = window.confirm(`Unlink your ${type === "steam" ? "Steam" : "Discord"} account from this website?`);
    if (!confirmed) return;
    await unlinkOnly(type);
  };

  const unlinkAllAccounts = async () => {
    const confirmed = window.confirm("Unlink both your Steam and Discord accounts from this website?");
    if (!confirmed) return;
    await unlinkOnly("steam");
    await unlinkOnly("discord");
  };

  const openKit = (title) => {
    setPreview(kitDetails[title]);
  };

  return (
    <>
      <style>{`
        *{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:#09090b;color:#f4f4f5;font-family:Inter,system-ui,Segoe UI,Arial,sans-serif}a{color:inherit;text-decoration:none}.bg{position:fixed;inset:0;z-index:-1;background:radial-gradient(circle at top left,rgba(249,115,22,.25),transparent 35%),linear-gradient(180deg,rgba(9,9,11,.75),#09090b 70%)}.container{max-width:1280px;margin:0 auto;padding:0 24px}.header{display:flex;align-items:center;justify-content:space-between;padding:22px 24px;gap:20px}.brand{display:flex;align-items:center;gap:14px}.brand img{width:52px;height:52px;border-radius:16px;border:1px solid rgba(249,115,22,.35)}.nav{display:flex;gap:22px;color:#d4d4d8;font-size:14px}.actions{display:flex;gap:10px;flex-wrap:wrap}.btn{display:inline-flex;align-items:center;justify-content:center;border-radius:18px;padding:12px 18px;font-weight:800;border:0;cursor:pointer;background:#ea580c;color:white;box-shadow:0 12px 28px rgba(124,45,18,.35)}.btn.outline{background:rgba(9,9,11,.65);border:1px solid #3f3f46;color:#fafafa;box-shadow:none}.hero{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;padding-top:70px;padding-bottom:70px}.logo{width:210px;height:210px;border-radius:28px;border:1px solid rgba(249,115,22,.35);object-fit:cover;box-shadow:0 25px 80px rgba(0,0,0,.45)}.pill{display:inline-flex;padding:8px 14px;border:1px solid rgba(249,115,22,.35);border-radius:999px;background:rgba(124,45,18,.25);color:#fed7aa;font-size:14px;margin:20px 0}.h1{font-size:64px;line-height:1;letter-spacing:-.04em;margin:0;font-weight:1000}.orange{color:#fb923c}.card{border:1px solid #27272a;background:rgba(9,9,11,.78);border-radius:28px;box-shadow:0 25px 70px rgba(0,0,0,.35)}.card.orangeBorder{border-color:rgba(249,115,22,.45)}.pad{padding:26px}.section{padding:56px 0}.sectionHead{display:flex;justify-content:space-between;gap:24px;align-items:end;margin-bottom:28px}.eyebrow{font-size:13px;text-transform:uppercase;letter-spacing:.18em;color:#fdba74;font-weight:800}.h2{font-size:40px;line-height:1.05;margin:10px 0 0;font-weight:1000;letter-spacing:-.03em}.muted{color:#a1a1aa;line-height:1.65}.grid{display:grid;gap:20px}.grid3{grid-template-columns:repeat(3,1fr)}.grid4{grid-template-columns:repeat(4,1fr)}.badge{display:inline-flex;border-radius:999px;background:#18181b;padding:6px 10px;font-size:12px;font-weight:900;color:#d4d4d8}.badge.green{background:rgba(16,185,129,.16);color:#86efac}.badge.orange{background:rgba(249,115,22,.16);color:#fdba74;border:1px solid rgba(249,115,22,.25)}.kitIcon{width:56px;height:56px;border-radius:18px;background:rgba(249,115,22,.18);display:flex;align-items:center;justify-content:center;font-size:30px}.kitTitle{font-size:26px;margin:20px 0 8px;font-weight:1000}.badges{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0}.kitImg{max-width:100%;border-radius:20px;border:1px solid #3f3f46;background:#09090b}.count{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:20px}.count div{background:rgba(24,24,27,.75);border:1px solid #27272a;border-radius:20px;padding:18px;text-align:center}.count strong{display:block;color:#fdba74;font-size:38px}.modal{position:fixed;inset:0;background:rgba(0,0,0,.82);z-index:50;display:flex;align-items:center;justify-content:center;padding:24px}.modalInner{position:relative;max-width:1100px;max-height:92vh;overflow:auto;background:#09090b;border:1px solid rgba(249,115,22,.35);border-radius:24px;padding:18px}.kitModalInner{max-width:1200px}.close{position:absolute;right:16px;top:16px;background:#ef4444;color:white;border:0;border-radius:12px;padding:10px 14px;font-weight:900;z-index:5;cursor:pointer}.modalGrid{display:grid;grid-template-columns:1.25fr .75fr;gap:22px;align-items:start;padding-top:48px}.modalCopy{padding:8px 6px}.modalBox{margin-top:20px;border:1px solid #27272a;background:rgba(24,24,27,.75);border-radius:20px;padding:18px}.modalBox h3{margin:0 0 10px;color:#fdba74}.modalBox p{margin:0;color:#d4d4d8;line-height:1.65}.footer{text-align:center;color:#a1a1aa;padding:50px 0;border-top:1px solid #27272a}.rules{grid-template-columns:repeat(2,1fr)}.rule{background:rgba(24,24,27,.7);border:1px solid #27272a;border-radius:18px;padding:16px}.linkCards{margin-top:26px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.linkCard{border:1px solid rgba(249,115,22,.35);border-radius:24px;background:linear-gradient(135deg,rgba(24,24,27,.9),rgba(9,9,11,.82));padding:22px;display:flex;gap:18px;align-items:center;min-height:160px}.linkAvatar{width:88px;height:88px;border-radius:22px;object-fit:cover;background:#18181b}.linkAvatar.connected{border:2px solid rgba(34,197,94,.65)}.linkAvatar.unlinked{border:2px solid rgba(249,115,22,.45)}@media(max-width:900px){.hero,.grid3,.grid4,.rules,.modalGrid,.linkCards{grid-template-columns:1fr}.nav{display:none}.h1{font-size:44px}.sectionHead{display:block}.header{align-items:flex-start;flex-direction:column}.count{grid-template-columns:repeat(2,1fr)}}
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
            <div className="pill">🔥 Current server: Vanilla Monthly</div>
            <h1 className="h1">
              Survive, build, raid, and dominate on <span className="orange">BTARust.net</span>
            </h1>
            <div className="actions" style={{ marginTop: 28 }}>
              <a href="#servers"><Button>View Servers</Button></a>
              <a href="#linking"><Button outline>Link Accounts</Button></a>
            </div>
          </div>
          <Card extra="orangeBorder">
            <p className="eyebrow">Featured Server</p>
            <h2 className="h2">Vanilla Monthly</h2>
            <p className="muted">Monthly wipes, vanilla gather rates, and fair progression. Search Rust for BTARust.net.</p>
            <Badge tone="green">Live</Badge>
          </Card>
        </section>

        <section className="container section"><Countdown /></section>

        <section id="servers" className="container section">
          <div className="sectionHead">
            <div>
              <p className="eyebrow">Server Lineup</p>
              <h2 className="h2">Choose your battlefield</h2>
            </div>
            <p className="muted">Start on Vanilla Monthly while the BTARust.net network expands.</p>
          </div>
          <div className="grid grid3">
            {servers.map((server) => (
              <Card key={server.name} extra="orangeBorder">
                <Badge tone={server.status === "Live Now" ? "green" : "orange"}>{server.status}</Badge>
                <h3 className="kitTitle">{server.name}</h3>
                <div className="badges">
                  <Badge>{server.rate}</Badge>
                  <Badge>{server.wipe}</Badge>
                </div>
                <p className="muted">{server.desc}</p>
                <div className="actions" style={{ marginTop: 14 }}>
                  {server.connect && server.status === "Live Now" && (
                    <a href={server.connect}>
                      <Button>🎮 Connect to Server</Button>
                    </a>
                  )}
                  {server.map && server.status === "Live Now" && (
                    <a href={server.map} target="_blank" rel="noreferrer">
                      <Button outline>🗺️ View Map</Button>
                    </a>
                  )}
                  {server.bm && <a href={server.bm} target="_blank" rel="noreferrer"><Button outline>📊 BattleMetrics</Button></a>}
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

            <div className="linkCards">
              <div className="linkCard">
                <img
                  src={profile.steamAvatar}
                  alt="Steam profile avatar"
                  className={`linkAvatar ${linked.steam ? "connected" : "unlinked"}`}
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

              <div className="linkCard">
                <img
                  src={profile.discordAvatar}
                  alt="Discord profile avatar"
                  className={`linkAvatar ${linked.discord ? "connected" : "unlinked"}`}
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

            {(linked.steam || linked.discord) && (
              <div style={{ marginTop: 22, display: 'flex', justifyContent: 'center' }}>
                <Button onClick={unlinkAllAccounts} outline>
                  ❌ Unlink All Accounts
                </Button>
              </div>
            )}
          </Card>
        </section>

        <section id="kits" className="container section">
          <p className="eyebrow">Free Starter Kits</p>
          <h2 className="h2">Claim free kits by linking accounts</h2>
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
                  {kit.lifetimeTitle && <Button outline onClick={() => openKit(kit.lifetimeTitle)}>👑 View Lifetime</Button>}
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="container section">
          <Card>
            <p className="eyebrow">Store Disclaimer</p>
            <h2 className="h2">Donation & Refund Policy</h2>
            <div className="muted" style={{display:'grid',gap:'14px'}}>
              <p>All purchases made through the BTARust.net Tebex store are considered voluntary donations supporting server development, hosting, maintenance, custom plugins, moderation, and community operations. By completing a purchase, you acknowledge that you are receiving digital virtual goods, perks, ranks, or access tied exclusively to BTARust.net servers and services.</p>
              <p>Due to the digital nature of in-game items, ranks, permissions, and server-related benefits, all purchases are final and non-refundable unless required by applicable law or approved directly by BTARust.net administration. Chargebacks, fraudulent disputes, payment reversals, or unauthorized transaction claims may result in permanent suspension from all BTARust.net services, including game servers, Discord services, and associated platforms.</p>
              <p>BTARust.net reserves the right to modify, rebalance, remove, wipe, replace, suspend, or discontinue any server feature, kit, rank, item, permission, cooldown, server, or perk at any time without prior notice in order to maintain gameplay balance, server health, security, stability, or community fairness.</p>
              <p>BTARust.net may offer a conditional Ban Appeal Reinstatement option for eligible community bans issued exclusively on BTARust.net servers. In order to qualify, the banned player must first submit a formal support ticket and complete a manual ban appeal review through the official BTARust.net Discord server. Appeals are reviewed solely by authorized BTARust.net staff members.</p>
              <p>If a player’s appeal is approved by BTARust.net staff, a private “Unban Me” purchase option may then become available to the approved player through Tebex. The purchase option is only accessible after staff approval and does not bypass the required review process.</p>
            </div>
          </Card>
        </section>
      </main>

      <footer className="footer">© BTARust.net • Built for Rust players • {siteUrl}</footer>
      <KitModal kit={preview} onClose={() => setPreview(null)} />
    </>
  );
}
