"use client";

import React, { useEffect, useMemo, useState } from "react";

const siteUrl = "https://www.btarust.net";
const tebexStore = "https://btarustnet.tebex.io";
const discordInvite = "https://discord.gg/bXGd4SGEw2";

function Button({ children, outline = false, onClick }) {
  return (
    <button onClick={onClick} className={`btn ${outline ? "outline" : ""}`}>
      <span className="btnShine" />
      <span className="btnText">{children}</span>
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

function PriceBadge({ original, sale }) {
  return (
    <span className="badge priceSale">
      <span className="oldPrice">{original}</span>
      <span className="newPrice">{sale}</span>
      <span className="saleText">15% OFF</span>
    </span>
  );
}

function nextFacepunchWipe(now = new Date()) {
  const getFirstThursdayAtEastern2PM = (year, month) => {
    const firstDay = new Date(Date.UTC(year, month, 1, 12, 0, 0));
    const firstThursdayDate = 1 + ((4 - firstDay.getUTCDay() + 7) % 7);

    // Facepunch forced wipe is the first Thursday of each month at 2PM Eastern.
    // During daylight saving months this is 18:00 UTC; during standard time this is 19:00 UTC.
    const testNoonUtc = new Date(Date.UTC(year, month, firstThursdayDate, 12, 0, 0));
    const easternParts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      timeZoneName: "short"
    }).formatToParts(testNoonUtc);

    const tzName = easternParts.find((part) => part.type === "timeZoneName")?.value || "EST";
    const utcHour = tzName.includes("EDT") ? 18 : 19;

    return new Date(Date.UTC(year, month, firstThursdayDate, utcHour, 0, 0));
  };

  let wipe = getFirstThursdayAtEastern2PM(now.getUTCFullYear(), now.getUTCMonth());

  if (now >= wipe) {
    const nextMonth = now.getUTCMonth() + 1;
    wipe = getFirstThursdayAtEastern2PM(
      now.getUTCFullYear() + Math.floor(nextMonth / 12),
      nextMonth % 12
    );
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
  const currentMonthStart = useMemo(() => {
    const current = nextFacepunchWipe(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0)));
    if (now < current) {
      const prevMonth = now.getUTCMonth() - 1;
      const prevYear = now.getUTCFullYear() + Math.floor(prevMonth / 12);
      return nextFacepunchWipe(new Date(Date.UTC(prevYear, (prevMonth + 12) % 12, 1, 0, 0, 0)));
    }
    return current;
  }, [now]);

  const seconds = Math.max(0, Math.floor((wipe.getTime() - now.getTime()) / 1000));
  const totalCycleSeconds = Math.max(1, Math.floor((wipe.getTime() - currentMonthStart.getTime()) / 1000));
  const elapsedCycleSeconds = Math.min(totalCycleSeconds, Math.max(0, Math.floor((now.getTime() - currentMonthStart.getTime()) / 1000)));
  const hourglassProgress = Math.min(100, Math.max(0, (elapsedCycleSeconds / totalCycleSeconds) * 100));
  const topSand = Math.max(4, 100 - hourglassProgress);
  const bottomSand = Math.min(96, hourglassProgress);

  const vals = [
    ["Days", Math.floor(seconds / 86400)],
    ["Hours", Math.floor((seconds % 86400) / 3600)],
    ["Minutes", Math.floor((seconds % 3600) / 60)],
    ["Seconds", seconds % 60]
  ];

  return (
    <Card extra="orangeBorder countdownCard">
      <div className="countdownLayout">
        <div>
          <p className="eyebrow">Facepunch Wipe Calendar</p>
          <h2 className="h2">Next forced wipe countdown</h2>
          <p className="muted">First Thursday of each month at 2:00 PM Eastern.</p>
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
        </div>

        <div className="hourglassPanel" aria-label="Animated wipe countdown hourglass">
          <div className="hourglassTitle">Wipe Cycle</div>
          <div className="hourglass">
            <div className="hgCap top" />
            <div className="hgGlass">
              <div className="hgTopSand" style={{ height: `${topSand}%` }} />
              <div className="hgStream" />
              <div className="hgBottomSand" style={{ height: `${bottomSand}%` }} />
            </div>
            <div className="hgCap bottom" />
          </div>
          <div className="hourglassPercent">{Math.round(hourglassProgress)}% through wipe cycle</div>
        </div>
      </div>
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
    desc: "Free starter kit with 4 claims per wipe and a 1 hour cooldown.",
    items: "Inventory: stone x6k, wood x4k, animal fat x250, pistol ammo x100, sheet metal double doors x2, sheet metal door x1, tool cupboard x1, code locks x4, building plan x1, hammer x1. Belt: revolver x1, spear x1, pumpkins x10, stone tools, medical supplies x3. Backpack: none."
  },
  "Food Kit": {
    image: "/kits/Food.png",
    title: "Food Kit",
    desc: "Free food recovery kit with unlimited claims and a 30 minute cooldown.",
    items: "Inventory: water jug x1, cooked meat x10, pumpkins x6, corn x6. Wearables and belt are empty. Backpack: none."
  },
  "Discord Kit": {
    image: "/kits/Discord.png",
    title: "Discord Kit",
    desc: "Free Discord-linked kit with 4 claims per wipe and a 1 hour cooldown.",
    items: "Inventory: pistol ammo x128. Wearables: hazmat suit x1. Belt: semi-automatic pistol x1, salvage cleaver x1, pickaxe x1, bandages x3, medical syringes x4. Backpack: none."
  },
  "Discord Booster Kit": {
    image: "/kits/Discord Booster.png",
    title: "Discord Booster Kit",
    desc: "Discord Booster reward kit with unlimited claims and a 1 hour cooldown.",
    items: "Inventory: pistol ammo x128, jackhammer x1, chainsaw x1, low grade fuel x100, supply signal x1, empty canteen x1, metal blade x1, targeting computer x1, weapon component x1. Wearables: road sign armor set, hoodie, pants, boots, tactical gloves, backpack. Belt: medical syringes x4, bandages x4, medkits x3, supply crate x1, MP5 x1, wooden barricade cover x3. Backpack: none."
  },
  "VIP": {
    image: "/kits/VIP.png",
    title: "VIP",
    desc: "Monthly VIP kit access with VIP queue priority, 12 backpack slots, unlimited claims, and a 12 hour cooldown.",
    items: "Inventory: rifle magazine/ammo x1, empty canteen x1, metal blade x1, targeting computer x1, pistol ammo x128, stone x4k, wood x2k, animal fat x1k, gears x500, pumpkins x6. Wearables: road sign head/chest/kilt, tactical gloves, hoodie, pants, boots. Belt: launcher/weapon x1, wooden barricade cover x3, medical syringes x4, bandages x4, medkits x3, supply crate x1. Backpack: 12 slots."
  },
  "VIP Lifetime": {
    image: "/kits/VIP Lifetime.png",
    title: "VIP Lifetime",
    desc: "Lifetime VIP access with VIP queue priority, 12 backpack slots, unlimited claims, and a 12 hour cooldown.",
    items: "Inventory: pistol ammo x128, stone x4k, wood x2k, animal fat x1k, gears x500, HQM x100, pumpkins x6. Wearables: road sign head/chest/kilt, tactical gloves, hoodie, pants, boots. Belt: rifle x1, wooden barricade cover x3, medical syringes x4, bandages x4, medkits x3, supply crate x1. Backpack: 12 slots."
  },
  "Recruit Tier": {
    image: "/kits/Recruit Tier.png",
    title: "Recruit Tier",
    desc: "Recruit tier kit with 24 backpack slots, unlimited claims, and a 12 hour cooldown.",
    items: "Inventory: pistol ammo x128, wood x2k, stone x2k, animal fat x1k, gears x250, hatchet x1, pickaxe x1, mace x1. Wearables: burlap/wood armor starter set. Belt: P2 pistol x1, wooden barricade cover x3, medical syringes x4, bandages x3, pumpkins x6. Backpack: 24 slots."
  },
  "Enlistment Tier": {
    image: "/kits/Enlistment Tier.png",
    title: "Enlistment Tier",
    desc: "Enlistment tier kit with 24 backpack slots, unlimited claims, and a 12 hour cooldown.",
    items: "Inventory: pistol ammo x128, wood x2k, stone x4k, animal fat x2k, gears x250, salvaged axe x1, pickaxe x1, mace x1. Wearables: road sign armor set, tactical gloves, hoodie, pants, boots. Belt: pumpkins x6, bandages x3, medical syringes x4, wooden barricade cover x3, launcher/weapon x1. Backpack: 24 slots."
  },
  "Soldier Tier": {
    image: "/kits/Soldier Tier.png",
    title: "Soldier Tier",
    desc: "Soldier tier kit with 48 backpack slots, unlimited mini fuel, unlimited claims, and a 12 hour cooldown.",
    items: "Inventory: wood x6k, stone x6k, animal fat x4k, HQM x100, gears x500, mace/tools x500, pistol ammo x256, pumpkins x6, metal blade x1, empty canteen x1, weapon component x1, rifle magazine/ammo x1. Wearables: pumpkins, road sign armor set, tactical gloves, hoodie, pants, boots. Belt: rifle x1, wooden barricade cover x3, medical syringes x4, bandages x4, supply crate x1, medkits x3. Backpack: 48 slots."
  },
  "Officer Tier": {
    image: "/kits/Officer Tier.png",
    title: "Officer Tier",
    desc: "Officer tier kit bundled with VIP Kit, Soldier Tier, Builder Kit, Electrical Kit, and Farm Kit. Includes 48 backpack slots, unlimited vehicle fuel, premium perks, unlimited claims, and a 12 hour cooldown.",
    items: "Bundle includes VIP Kit, Soldier Tier, Builder Kit, Electrical Kit, and Farm Kit. Kit loadout: Inventory: rifle ammo x300, wood x8k, stone x8k, animal fat x12k, HQM x300, gears x750, empty canteen x1, weapon component x1, metal blade x1, rifle magazine x1, coffins x3, low grade fuel x1k, tarp x1k, jackhammer x1, chainsaw x1, explosives/utility, laptops x10, cameras x10, stop signs x10, tech trash x10, rockets/explosives x10, medical supplies x10, rifle x1, scope x1. Wearables: metal/road sign armor set, tactical gloves, hoodie, pants, boots. Belt: assault rifle x1, medical syringes x12, bandages x12, pumpkins x20, supply signal x1, loot bag x1. Backpack: 48 slots."
  },
  "Officer Tier Lifetime": {
    image: "/kits/Officer Tier Lifetime.png",
    title: "Officer Tier Lifetime",
    desc: "Permanent Officer Lifetime access bundled with VIP Kit, Soldier Tier, Builder Kit, Electrical Kit, and Farm Kit. Includes 48 backpack slots, unlimited vehicle fuel, premium perks, unlimited claims, and a 12 hour cooldown.",
    items: "Same kit loadout as Officer Tier. Includes 48 backpack slots and lifetime access. Bundle includes VIP Kit, Soldier Tier, Builder Kit, Electrical Kit, and Farm Kit."
  },
  "General Tier": {
    image: "/kits/General Tier.png",
    title: "General Tier",
    desc: "General tier kit bundled with every BTARust.net kit except Discord Booster. Includes 48 backpack slots, unlimited vehicle fuel, top-tier premium perks, unlimited claims, and a 12 hour cooldown.",
    items: "Bundle includes all kits except Discord Booster. Kit loadout: Inventory: rifle ammo x600, wood x16k, stone x16k, animal fat x24k, HQM x600, gears x1.5k, empty canteens x2, weapon components x2, metal blades x2, rifle magazines x2, coffins x3, low grade fuel x2k, tarp x2k, jackhammer x1, chainsaw x1, explosives/utility x40, laptops x20, cameras x20, stop signs x20, tech trash x20, rockets/explosives x20, medical supplies x20, rifles x2, scopes x2. Wearables: full armor set x2, tactical gloves x2, hoodie x2, pants x2, boots x2. Belt: assault rifles x2, medical syringes x12, bandages x12, pumpkins x20, supply signal x1, loot bag x1. Backpack: 48 slots."
  },
  "General Tier Lifetime": {
    image: "/kits/General Tier Lifetime.png",
    title: "General Tier Lifetime",
    desc: "Permanent General Lifetime access bundled with every BTARust.net kit except Discord Booster. Includes 48 backpack slots, unlimited vehicle fuel, top-tier premium perks, unlimited claims, and a 12 hour cooldown.",
    items: "Same kit loadout as General Tier. Includes 48 backpack slots and lifetime access. Bundle includes all kits except Discord Booster."
  },
  "Builder Kit": {
    image: "/kits/Builder Kit.png",
    title: "Builder Kit",
    desc: "Advanced building and compound support kit with unlimited claims and a 1 day cooldown.",
    items: "Inventory: wood x20k, stone x40k, animal fat/resources x40k, HQM x1.2k, code locks x30, sheet metal double doors x20, garage/doors x20, furnaces x6, stone walls x40, barricades x36, garage doors x6, tool cupboards x6, coffins x6, workbench x1, research table x1, repair bench x1, ladder x6, netting x18, windows x20, armored doors x6, ladder hatches x6, floor grills/frames x6. Belt: building plan x1 and hammer x1."
  },
  "Electrical Kit": {
    image: "/kits/Electrical Kit.png",
    title: "Electrical Kit",
    desc: "Advanced electrical, automation, farming power, and utility kit with unlimited claims and a 1 day cooldown.",
    items: "Inventory: ceiling lights x10, electric furnaces x5, switches/branches x5, windmill x1, auto turrets x9, heaters x1, electrical components x5, industrial components x5, batteries x10, solar panels x3, doors/controllers x1, wiring and power components, computer station x1, test generator x1, satellite dish x1, signs x5, Twitch Rivals item x1. Belt: wire tool x1, storage/utility box x1, turrets x6, smart switches/components x100, CCTV cameras x6, electrical controllers x6."
  },
  "Farm Kit": {
    image: "/kits/Farm Kit.png",
    title: "Farm Kit",
    desc: "Advanced farming and water management kit with unlimited claims and a 1 day cooldown.",
    items: "Inventory: water barrel x1, water catchers x1, pumps and sprinklers, planters x10, water splitters/combiners x5, heaters/lights x10, water pumps x3, planter boxes x10, water storage x5, farm frames x2, berry clones/seeds x10 each, pumpkins x10, corn x10. Belt is empty."
  }
};

const freeKits = [
  { icon: "🎒", title: "Starter Kit", badges: ["Steam Required", "4 Claims", "1 Hr Cooldown", "No Backpack"], desc: kitDetails["Starter Kit"].desc },
  { icon: "🍖", title: "Food Kit", badges: ["Steam Required", "Unlimited", "30 Min Cooldown", "No Backpack"], desc: kitDetails["Food Kit"].desc },
  { icon: "💬", title: "Discord Kit", badges: ["Discord Required", "4 Claims", "1 Hr Cooldown", "No Backpack"], desc: kitDetails["Discord Kit"].desc },
  { icon: "🚀", title: "Discord Booster Kit", badges: ["Booster Required", "Unlimited", "1 Hr Cooldown", "No Backpack"], desc: kitDetails["Discord Booster Kit"].desc }
];

const premiumKits = [
  { icon: "⭐", title: "VIP", price: "$5", salePrice: "$4.25", sale: "15% OFF SALE", cooldown: "12 Hr", backpack: "12 Slots", packageUrl: "https://btarustnet.tebex.io/package/7439458" },
  { icon: "🎖️", title: "Recruit Tier", price: "$20", salePrice: "$17.00", sale: "15% OFF SALE", cooldown: "12 Hr", backpack: "24 Slots", packageUrl: "https://btarustnet.tebex.io/package/7439462" },
  { icon: "🪖", title: "Enlistment Tier", price: "$40", salePrice: "$34.00", sale: "15% OFF SALE", cooldown: "12 Hr", backpack: "24 Slots", packageUrl: "https://btarustnet.tebex.io/package/7439464" },
  { icon: "⚔️", title: "Soldier Tier", price: "$60", salePrice: "$51.00", sale: "15% OFF SALE", cooldown: "12 Hr", backpack: "48 Slots", packageUrl: "https://btarustnet.tebex.io/package/7439466" },
  { icon: "🎯", title: "Officer Tier", price: "$80", salePrice: "$68.00", sale: "15% OFF SALE", cooldown: "12 Hr", backpack: "48 Slots", bundle: "Includes VIP, Soldier, Builder, Electrical & Farm", packageUrl: "https://btarustnet.tebex.io/package/7439468" },
  { icon: "👑", title: "General Tier", price: "$100", salePrice: "$85.00", sale: "15% OFF SALE", cooldown: "12 Hr", backpack: "48 Slots", bundle: "Includes All Kits Except Discord Booster", packageUrl: "https://btarustnet.tebex.io/package/7439470" },
  { icon: "🏗️", title: "Builder Kit", price: "$15", salePrice: "$12.75", sale: "15% OFF SALE", cooldown: "1 Day", backpack: "No Backpack", packageUrl: "https://btarustnet.tebex.io/package/7470119" },
  { icon: "🔌", title: "Electrical Kit", price: "$15", salePrice: "$12.75", sale: "15% OFF SALE", cooldown: "1 Day", backpack: "No Backpack", packageUrl: "https://btarustnet.tebex.io/package/7439479" },
  { icon: "🌾", title: "Farm Kit", price: "$10", salePrice: "$8.50", sale: "15% OFF SALE", cooldown: "1 Day", backpack: "No Backpack", packageUrl: "https://btarustnet.tebex.io/package/7439480" }
];

const lifetimeKits = [
  {
    icon: "⭐",
    title: "VIP Lifetime",
    price: "$50",
    salePrice: "$42.50",
    sale: "15% OFF SALE",
    cooldown: "12 Hr",
    backpack: "12 Slots",
    bundle: "Permanent VIP access",
    packageUrl: "https://btarustnet.tebex.io/package/7439459"
  },
  {
    icon: "🎯",
    title: "Officer Tier Lifetime",
    price: "$160",
    salePrice: "$136.00",
    sale: "15% OFF SALE",
    cooldown: "12 Hr",
    backpack: "48 Slots",
    bundle: "Includes VIP, Soldier, Builder, Electrical & Farm",
    packageUrl: "https://btarustnet.tebex.io/package/7439469"
  },
  {
    icon: "👑",
    title: "General Tier Lifetime",
    price: "$200",
    salePrice: "$170.00",
    sale: "15% OFF SALE",
    cooldown: "12 Hr",
    backpack: "48 Slots",
    bundle: "Includes All Kits Except Discord Booster",
    packageUrl: "https://btarustnet.tebex.io/package/7439471"
  }
];

const perks = [
  {
    icon: "🎒",
    title: "Backpack Sizes",
    items: [
      "Default: No Backpack",
      "Discord Booster: No Backpack",
      "VIP: 12 Slots",
      "VIP Lifetime: 12 Slots",
      "Recruit: 24 Slots",
      "Enlistment: 24 Slots",
      "Soldier: 48 Slots",
      "Officer: 48 Slots",
      "Officer Lifetime: 48 Slots",
      "General: 48 Slots",
      "General Lifetime: 48 Slots"
    ]
  },
  {
    icon: "🔫",
    title: "Turret & Defense Limits",
    items: [
      "Auto Turrets per TC: Default 12",
      "Discord Booster: 12",
      "VIP / VIP Lifetime: 12",
      "Recruit / Enlistment: 24",
      "Soldier: 48",
      "Officer / Officer Lifetime: Unlimited",
      "General / General Lifetime: Unlimited"
    ]
  },
  {
    icon: "🚁",
    title: "Vehicle Commands",
    items: [
      "Mini: /mymini, /fmini, /nomini",
      "Scrap Transport Helicopter: /myheli, /fheli, /noheli",
      "Attack Helicopter: /myattack, /fattack, /noattack",
      "Available commands depend on tier"
    ]
  },
  {
    icon: "⛽",
    title: "Fuel Perks",
    items: [
      "Discord Booster: Mini spawned with fuel",
      "VIP / VIP Lifetime: Mini spawned with fuel",
      "Recruit: Mini spawned with fuel",
      "Enlistment: Mini spawned with fuel",
      "Soldier: Unlimited Mini Fuel",
      "Officer / Officer Lifetime: Unlimited Vehicle Fuel*",
      "General / General Lifetime: Unlimited Vehicle Fuel*",
      "*Excludes player-built boats"
    ]
  },
  {
    icon: "⚡",
    title: "Premium Perks",
    items: [
      "VIP Queue Priority",
      "Skinbox Access",
      "Advanced Kits",
      "Builder / Electrical / Farming Kits",
      "Furnace Splitter",
      "Box Stacking",
      "Backpack Access",
      "Vehicle Spawning",
      "Faster RP Progression",
      "Auto Electrical Branches",
      "Auto Team/Clan Authorization",
      "Auto Door Codes",
      "Inventory Sorting",
      "Instant Crafting",
      "Officer / Officer Lifetime Bundle: VIP Kit, Soldier Tier, Builder Kit, Electrical Kit, and Farm Kit",
      "General / General Lifetime Bundle: All kits except Discord Booster",
      "Workbench requirements may still apply depending on tier"
    ]
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

  const unlinkAllAccounts = async () => {
    const confirmed = window.confirm("Unlink both Steam and Discord accounts from this website?");
    if (!confirmed) return;

    localStorage.removeItem("btarust_steam_linked");
    localStorage.removeItem("btarust_discord_linked");
    localStorage.removeItem("btarust_steam_name");
    localStorage.removeItem("btarust_discord_name");
    localStorage.removeItem("btarust_steam_avatar");
    localStorage.removeItem("btarust_discord_avatar");

    setLinked({ steam: false, discord: false });
    setProfile({
      steamName: "Steam Player",
      steamAvatar: steamLogo,
      discordName: "Discord User",
      discordAvatar: discordLogo
    });

    try {
      await Promise.all([
        fetch("/api/auth/steam/unlink", { method: "POST" }),
        fetch("/api/auth/discord/unlink", { method: "POST" })
      ]);
    } catch (error) {
      console.warn("Unlink API routes not available yet. Local unlink completed.", error);
    }
  };

  const openKit = (title) => {
    setPreview(kitDetails[title]);
  };

  return (
    <>
      <style>{`
        *{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:#09090b;color:#f4f4f5;font-family:Inter,system-ui,Segoe UI,Arial,sans-serif;background-image:linear-gradient(180deg,rgba(0,0,0,.72),rgba(9,9,11,.96) 55%,#09090b 100%),url('/BTARust_HeroImage_Optimized.jpg');background-size:cover;background-position:top center;background-attachment:fixed;background-repeat:no-repeat}a{color:inherit;text-decoration:none}.bg{position:fixed;inset:0;z-index:-1;background:radial-gradient(circle at top left,rgba(249,115,22,.22),transparent 34%),radial-gradient(circle at top right,rgba(185,28,28,.18),transparent 30%),linear-gradient(180deg,rgba(0,0,0,.18),#09090b 82%);pointer-events:none}.container{max-width:1280px;margin:0 auto;padding:0 24px}.header{display:flex;align-items:center;justify-content:space-between;padding:22px 24px;gap:20px;position:sticky;top:0;z-index:20;background:linear-gradient(180deg,rgba(9,9,11,.92),rgba(9,9,11,.62));backdrop-filter:blur(14px);border-bottom:1px solid rgba(249,115,22,.12)}.brand{display:flex;align-items:center;gap:14px}.brand img{width:52px;height:52px;border-radius:16px;border:1px solid rgba(249,115,22,.35);transition:.25s ease}.brand:hover img{transform:rotate(-2deg) scale(1.06);box-shadow:0 0 26px rgba(249,115,22,.35)}.nav{display:flex;gap:22px;color:#d4d4d8;font-size:14px}.nav a{position:relative;transition:.25s ease}.nav a:hover{color:#fb923c}.nav a:after{content:"";position:absolute;left:0;right:0;bottom:-8px;height:2px;background:#fb923c;transform:scaleX(0);transform-origin:left;transition:.25s ease}.nav a:hover:after{transform:scaleX(1)}.actions{display:flex;gap:10px;flex-wrap:wrap}.btn{position:relative;overflow:hidden;display:inline-flex;align-items:center;justify-content:center;border-radius:18px;padding:12px 18px;font-weight:900;border:0;cursor:pointer;background:linear-gradient(135deg,#f97316,#ea580c 55%,#c2410c);color:white;box-shadow:0 12px 28px rgba(124,45,18,.35),inset 0 1px 0 rgba(255,255,255,.25);transition:transform .22s ease,box-shadow .22s ease,filter .22s ease}.btn:hover{transform:translateY(-3px) scale(1.03);box-shadow:0 18px 42px rgba(249,115,22,.35),0 0 22px rgba(249,115,22,.25);filter:saturate(1.15)}.btn:active{transform:translateY(0) scale(.98)}.btn.outline{background:rgba(9,9,11,.68);border:1px solid rgba(255,255,255,.18);color:#fafafa;box-shadow:inset 0 1px 0 rgba(255,255,255,.06)}.btn.outline:hover{border-color:rgba(249,115,22,.7);box-shadow:0 0 30px rgba(249,115,22,.18),inset 0 1px 0 rgba(255,255,255,.08)}.btnShine{position:absolute;inset:-40% auto -40% -70%;width:60%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.35),transparent);transform:skewX(-20deg);transition:left .55s ease}.btn:hover .btnShine{left:125%}.btnText{position:relative;z-index:1}.hero{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;padding-top:70px;padding-bottom:70px;animation:fadeUp .7s ease both}.logo{width:210px;height:210px;border-radius:28px;border:1px solid rgba(249,115,22,.35);object-fit:cover;box-shadow:0 25px 80px rgba(0,0,0,.45);animation:floatLogo 4.5s ease-in-out infinite}.pill{display:inline-flex;padding:8px 14px;border:1px solid rgba(249,115,22,.35);border-radius:999px;background:rgba(124,45,18,.25);color:#fed7aa;font-size:14px;margin:20px 0}.h1{font-size:64px;line-height:1;letter-spacing:-.04em;margin:0;font-weight:1000;text-shadow:0 8px 34px rgba(0,0,0,.55)}.orange{color:#fb923c;text-shadow:0 0 22px rgba(249,115,22,.22)}.card{position:relative;overflow:hidden;border:1px solid rgba(255,255,255,.08);background:linear-gradient(145deg,rgba(15,15,18,.86),rgba(8,8,10,.74));border-radius:28px;box-shadow:0 25px 70px rgba(0,0,0,.35);transition:transform .25s ease,border-color .25s ease,box-shadow .25s ease}.card:before{content:"";position:absolute;inset:0;background:linear-gradient(120deg,transparent,rgba(249,115,22,.08),transparent);opacity:0;transition:.25s ease;pointer-events:none}.card:hover{transform:translateY(-6px);border-color:rgba(249,115,22,.45);box-shadow:0 30px 90px rgba(0,0,0,.5),0 0 30px rgba(249,115,22,.12)}.card:hover:before{opacity:1}.card.orangeBorder{border-color:rgba(249,115,22,.45)}.pad{padding:26px;position:relative;z-index:1}.section{padding:56px 0;animation:fadeUp .7s ease both}.sectionHead{display:flex;justify-content:space-between;gap:24px;align-items:end;margin-bottom:28px}.eyebrow{font-size:13px;text-transform:uppercase;letter-spacing:.18em;color:#fdba74;font-weight:900}.h2{font-size:40px;line-height:1.05;margin:10px 0 0;font-weight:1000;letter-spacing:-.03em}.muted{color:#a1a1aa;line-height:1.65}.grid{display:grid;gap:20px}.grid3{grid-template-columns:repeat(3,1fr)}.grid4{grid-template-columns:repeat(4,1fr)}.badge{display:inline-flex;border-radius:999px;background:rgba(24,24,27,.88);padding:6px 10px;font-size:12px;font-weight:900;color:#d4d4d8;border:1px solid rgba(255,255,255,.06);transition:.22s ease}.badge:hover{transform:translateY(-1px);border-color:rgba(249,115,22,.35)}.badge.green{background:rgba(16,185,129,.16);color:#86efac;border-color:rgba(16,185,129,.22)}.badge.orange{background:rgba(249,115,22,.16);color:#fdba74;border:1px solid rgba(249,115,22,.25)}.badge.priceSale{background:rgba(16,185,129,.16);color:#86efac;border-color:rgba(16,185,129,.28);gap:8px;align-items:center}.oldPrice{color:#fca5a5;text-decoration:line-through;text-decoration-thickness:2px;text-decoration-color:#ef4444}.newPrice{color:#fff;font-size:15px;font-weight:1000}.saleText{color:#86efac;font-weight:1000}.kitIcon{width:56px;height:56px;border-radius:18px;background:linear-gradient(135deg,rgba(249,115,22,.28),rgba(124,45,18,.22));display:flex;align-items:center;justify-content:center;font-size:30px;box-shadow:inset 0 1px 0 rgba(255,255,255,.08);transition:.25s ease}.card:hover .kitIcon{transform:scale(1.08) rotate(-3deg);box-shadow:0 0 28px rgba(249,115,22,.18)}.kitTitle{font-size:26px;margin:20px 0 8px;font-weight:1000}.badges{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0}.kitImg{max-width:100%;border-radius:20px;border:1px solid #3f3f46;background:#09090b}.countdownLayout{display:grid;grid-template-columns:minmax(0,1fr) 230px;gap:28px;align-items:center}.countdownCard .pad{padding:30px}.count{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:20px}.count div{background:rgba(24,24,27,.78);border:1px solid rgba(255,255,255,.08);border-radius:20px;padding:18px;text-align:center;transition:.25s ease}.count div:hover{transform:translateY(-4px);border-color:rgba(249,115,22,.45)}.count strong{display:block;color:#fdba74;font-size:38px;text-shadow:0 0 18px rgba(249,115,22,.28)}.hourglassPanel{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:260px;border:1px solid rgba(249,115,22,.22);border-radius:24px;background:radial-gradient(circle at top,rgba(249,115,22,.16),rgba(9,9,11,.55));box-shadow:inset 0 1px 0 rgba(255,255,255,.06)}.hourglassTitle{font-weight:1000;letter-spacing:.16em;text-transform:uppercase;color:#fdba74;font-size:12px;margin-bottom:12px}.hourglass{position:relative;width:96px;height:158px;filter:drop-shadow(0 0 18px rgba(249,115,22,.22))}.hgCap{position:absolute;left:7px;width:82px;height:12px;border-radius:999px;background:linear-gradient(90deg,#78350f,#fdba74,#78350f);box-shadow:0 0 12px rgba(249,115,22,.25)}.hgCap.top{top:0}.hgCap.bottom{bottom:0}.hgGlass{position:absolute;top:14px;bottom:14px;left:17px;right:17px;border:3px solid rgba(253,186,116,.78);border-radius:18px;overflow:hidden;clip-path:polygon(0 0,100% 0,58% 50%,100% 100%,0 100%,42% 50%);background:rgba(255,255,255,.04)}.hgTopSand{position:absolute;top:0;left:0;right:0;background:linear-gradient(180deg,#fde68a,#f97316);transition:height .9s linear;opacity:.9}.hgBottomSand{position:absolute;bottom:0;left:0;right:0;background:linear-gradient(0deg,#fde68a,#f97316);transition:height .9s linear;opacity:.95}.hgStream{position:absolute;left:50%;top:44%;width:4px;height:28px;border-radius:999px;background:#fde68a;transform:translateX(-50%);animation:sandStream 1s linear infinite;box-shadow:0 0 10px rgba(253,230,138,.8)}.hourglassPercent{margin-top:12px;color:#a1a1aa;font-weight:800;font-size:12px;text-align:center}.card:hover .hourglass{animation:hourglassTilt 1.8s ease-in-out infinite}@keyframes sandStream{0%{opacity:.25;transform:translateX(-50%) translateY(-4px)}50%{opacity:1}100%{opacity:.25;transform:translateX(-50%) translateY(8px)}}@keyframes hourglassTilt{0%,100%{transform:rotate(0)}50%{transform:rotate(2deg)}}.modal{position:fixed;inset:0;background:rgba(0,0,0,.82);z-index:50;display:flex;align-items:center;justify-content:center;padding:24px}.modalInner{position:relative;max-width:1100px;max-height:92vh;overflow:auto;background:#09090b;border:1px solid rgba(249,115,22,.35);border-radius:24px;padding:18px}.kitModalInner{max-width:1200px}.close{position:absolute;right:16px;top:16px;background:#ef4444;color:white;border:0;border-radius:12px;padding:10px 14px;font-weight:900;z-index:5;cursor:pointer;transition:.22s ease}.close:hover{transform:translateY(-2px);box-shadow:0 0 22px rgba(239,68,68,.35)}.modalGrid{display:grid;grid-template-columns:1.25fr .75fr;gap:22px;align-items:start;padding-top:48px}.modalCopy{padding:8px 6px}.modalBox{margin-top:20px;border:1px solid #27272a;background:rgba(24,24,27,.75);border-radius:20px;padding:18px}.modalBox h3{margin:0 0 10px;color:#fdba74}.modalBox p{margin:0;color:#d4d4d8;line-height:1.65}.perkList{display:grid;gap:10px;margin-top:18px;color:#d4d4d8;line-height:1.45}.perkItem{background:rgba(24,24,27,.58);border:1px solid rgba(255,255,255,.06);border-radius:14px;padding:10px 12px;font-weight:800}.footer{text-align:center;color:#a1a1aa;padding:50px 0;border-top:1px solid #27272a}.rules{grid-template-columns:repeat(2,1fr)}.rule{background:rgba(24,24,27,.72);border:1px solid rgba(255,255,255,.08);border-radius:18px;padding:16px;transition:.22s ease}.rule:hover{transform:translateX(4px);border-color:rgba(249,115,22,.35);background:rgba(24,24,27,.88)}.linkGrid{margin-top:26px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.linkCard{border:1px solid rgba(249,115,22,.35);border-radius:24px;background:linear-gradient(135deg,rgba(24,24,27,.9),rgba(9,9,11,.82));padding:22px;display:flex;gap:18px;align-items:center;min-height:160px}.linkAvatar{width:88px;height:88px;border-radius:22px;object-fit:cover;background:#18181b;flex:0 0 auto}@keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}@keyframes floatLogo{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}@media(max-width:900px){.countdownLayout{grid-template-columns:1fr}.hourglassPanel{min-height:220px}body{background-attachment:scroll;overflow-x:hidden}.container{width:100%;max-width:100%;padding:0 16px}.hero,.grid3,.grid4,.rules,.modalGrid,.linkGrid{grid-template-columns:1fr!important}.nav{display:none}.h1{font-size:40px;line-height:1.05;letter-spacing:-.035em}.h2{font-size:30px;line-height:1.1}.sectionHead{display:block}.header{align-items:flex-start;flex-direction:column;padding:18px 16px}.header.container{padding-left:16px;padding-right:16px}.brand{width:100%;align-items:center}.brand img{width:62px;height:62px}.actions{width:100%;display:grid;grid-template-columns:1fr 1fr;gap:10px}.actions a,.actions button,.btn{width:100%;min-width:0}.badges{max-width:100%}.header>.actions>.badges{display:grid;grid-template-columns:1fr 1fr;width:100%;gap:10px}.header>.actions{grid-template-columns:1fr 1fr}.hero{gap:28px;padding-top:34px;padding-bottom:42px}.logo{width:150px;height:150px}.card{overflow:hidden;border-radius:22px}.pad{padding:18px}.section{padding:36px 0}.count{grid-template-columns:repeat(2,1fr);gap:10px}.count div{padding:14px}.count strong{font-size:30px}.linkGrid{display:grid!important;grid-template-columns:1fr!important;gap:16px!important}.linkCard{display:flex!important;flex-direction:column!important;text-align:center!important;align-items:center!important;width:100%!important;min-width:0!important;padding:18px!important}.linkCard>div{width:100%!important;min-width:0!important}.linkCard h3{font-size:28px!important;line-height:1.05!important;word-break:normal!important}.linkAvatar{width:96px!important;height:96px!important;flex:0 0 auto!important}.modal{padding:12px}.modalInner{width:100%;max-height:88vh}.modalGrid{gap:18px}.kitTitle{font-size:22px}.rule{font-size:15px}.muted{font-size:15px;line-height:1.55}img{max-width:100%;height:auto}}@media(max-width:520px){.header>.actions{grid-template-columns:1fr}.header>.actions>.badges{grid-template-columns:1fr}.actions{grid-template-columns:1fr}.h1{font-size:36px}.h2{font-size:28px}.hero{text-align:left}.count{grid-template-columns:1fr 1fr}.btn{padding:13px 14px;border-radius:16px}.linkCard h3{font-size:26px!important}.linkCard .badges{justify-content:center}.grid{gap:16px}}
      `}</style>
      <div className="bg" />
      <header className="header container">
        <a href="#top" className="brand">
          <img src="/BTARust.jpg" alt="BTARust" />
          <div>
            <b>BTARust.net</b>
            <div className="eyebrow">Rust Servers</div>
          </div>
        </a>
        <nav className="nav">
          <a href="#servers">Servers</a>
          <a href="#linking">Account Linking</a>
          <a href="#kits">Kits</a>
          <a href="#perks">Perks</a>
          <a href="#rules">Rules</a>
        </nav>
        <div className="actions">
          <div className="badges" style={{ margin: 0, alignItems: 'center' }}>
            <Badge tone={linked.steam ? "green" : "orange"}>{linked.steam ? "Steam Linked" : "Steam not linked"}</Badge>
            <Badge tone={linked.discord ? "green" : "orange"}>{linked.discord ? "Discord Linked" : "Discord not linked"}</Badge>
          </div>
          <a href={tebexStore} target="_blank" rel="noreferrer"><Button outline>Open Store</Button></a>
          <a href={discordInvite} target="_blank" rel="noreferrer"><Button>Join Discord</Button></a>
        </div>
      </header>

      <main id="top">
        <section className="hero container">
          <div>
            <img className="logo" src="/BTARust.jpg" alt="BTARust logo" />
            
            <h1 className="h1">
              Survive, build, raid, and dominate on <span className="orange">BTARust.net</span>
            </h1>
            
            <div className="actions" style={{ marginTop: 30 }}>
              <a href="#servers"><Button>View Servers</Button></a>
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

            <div className="linkGrid" style={{
              marginTop: 26,
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 18
            }}>
              <div className="linkCard" style={{
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
                  src={profile.steamAvatar || steamLogo}
                  alt="Steam profile avatar"
                  className="linkAvatar"
                  onError={(event) => { event.currentTarget.src = steamLogo; }}
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

              <div className="linkCard" style={{
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
                  src={profile.discordAvatar || discordLogo}
                  alt="Discord profile avatar"
                  className="linkAvatar"
                  onError={(event) => { event.currentTarget.src = discordLogo; }}
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
              <Button onClick={unlinkAllAccounts} outline>
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
            Kits are usable across all BTARust.net servers. All buyable kits are currently 15% off.
          </p>
          <div className="grid grid3" style={{ marginTop: 24 }}>
            {premiumKits.map((kit) => (
              <Card key={kit.title}>
                <div className="kitIcon">{kit.icon}</div>
                <h3 className="kitTitle">{kit.title}</h3>
                <div className="badges">
                  {kit.salePrice ? (
                    <PriceBadge original={kit.price} sale={kit.salePrice} />
                  ) : (
                    <Badge tone="orange">{kit.price}</Badge>
                  )}
                  <Badge>{kit.cooldown} Cooldown</Badge>
                  <Badge>{kit.backpack}</Badge>
                  {kit.bundle && <Badge tone="green">{kit.bundle}</Badge>}
                  <Badge>Steam Linked</Badge>
                  <Badge>Discord Linked</Badge>
                </div>
                <p className="muted">{kitDetails[kit.title]?.desc || "Premium server rewards synced to your linked Rust account."}</p>
                <div className="actions">
                  <a href={kit.packageUrl || tebexStore} target="_blank" rel="noreferrer"><Button>🛒 Buy on Tebex</Button></a>
                  <Button outline onClick={() => openKit(kit.title)}>👀 View Kit</Button>
                </div>
              </Card>
            ))}
          </div>

          <p className="eyebrow" style={{ marginTop: 48 }}>Lifetime Kits</p>
          <h2 className="h2">Permanent access and bundle perks</h2>
          <p className="muted" style={{ marginTop: 12, marginBottom: 0 }}>
            Lifetime kits are usable across all BTARust.net servers and include the bundled perks shown below. All lifetime kits are currently 15% off.
          </p>
          <div className="grid grid3" style={{ marginTop: 24 }}>
            {lifetimeKits.map((kit) => (
              <Card key={kit.title} extra="orangeBorder">
                <div className="kitIcon">{kit.icon}</div>
                <h3 className="kitTitle">{kit.title}</h3>
                <div className="badges">
                  {kit.salePrice ? (
                    <PriceBadge original={kit.price} sale={kit.salePrice} />
                  ) : (
                    <Badge tone="orange">{kit.price}</Badge>
                  )}
                  <Badge>{kit.cooldown} Cooldown</Badge>
                  <Badge tone="green">{kit.bundle}</Badge>
                  <Badge>Steam Linked</Badge>
                  <Badge>Discord Linked</Badge>
                </div>
                <p className="muted">{kitDetails[kit.title]?.desc || "Lifetime rewards synced to your linked Rust account."}</p>
                <div className="actions">
                  <a href={kit.packageUrl || tebexStore} target="_blank" rel="noreferrer"><Button>🛒 Buy on Tebex</Button></a>
                  <Button outline onClick={() => openKit(kit.title)}>👑 View Lifetime Kit</Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section id="perks" className="container section">
          <div className="sectionHead">
            <div>
              <p className="eyebrow">Tier Perks</p>
              <h2 className="h2">Backpacks, vehicles, fuel, and premium access</h2>
            </div>
            <p className="muted">Perks vary by rank and tier. Workbench requirements may still apply depending on the kit or server setting.</p>
          </div>
          <div className="grid grid3">
            {perks.map((perk) => (
              <Card key={perk.title} extra="orangeBorder">
                <div className="kitIcon">{perk.icon}</div>
                <h3 className="kitTitle">{perk.title}</h3>
                <div className="perkList">
                  {perk.items.map((item) => <div className="perkItem" key={item}>• {item}</div>)}
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
