"use client";

import React, { useEffect, useMemo, useState } from "react";
import { servers } from "./data/servers";

const siteUrl = "https://www.btarust.net";
const tebexStore = "https://btarustnet.tebex.io";
const discordInvite = "https://discord.gg/HhrxErrDXg";

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
  const [now, setNow] = useState(null);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const wipe = useMemo(() => (now ? nextFacepunchWipe(now) : null), [now]);
  const currentMonthStart = useMemo(() => {
    if (!now) return null;
    const current = nextFacepunchWipe(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0)));
    if (now < current) {
      const prevMonth = now.getUTCMonth() - 1;
      const prevYear = now.getUTCFullYear() + Math.floor(prevMonth / 12);
      return nextFacepunchWipe(new Date(Date.UTC(prevYear, (prevMonth + 12) % 12, 1, 0, 0, 0)));
    }
    return current;
  }, [now]);

  if (!now) {
    return (
      <Card extra="orangeBorder countdownCard">
        <div className="countdownLayout">
          <div>
            <p className="eyebrow">Facepunch Wipe Calendar</p>
            <h2 className="h2">Next forced wipe countdown</h2>
            <p className="muted">First Thursday of each month at 2:00 PM Eastern.</p>
            <div className="count">
              {["Days", "Hours", "Minutes", "Seconds"].map((label) => (
                <div key={label}><strong>--</strong><span>{label}</span></div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    );
  }

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

const rules = [
  "Team Limit: No Limit",
  "NO CHEATING",
  "Respect admins and moderators",
  "No racism, hate speech, or harassment",
  "Heli Bombing with kit minis will increase your cooldown from 5min to 1hr, and it will last up to 12hrs.",
  "Abuse of the 24hr wipe protection system may result in temporary bans.",
  "If one member of a team/clan disables wipe protection early to participate in raiding, all active team/clan members must also have protection disabled."
];

const navigationPages = [
  { key: "servers", href: "/servers", title: "Servers", icon: "🌎", desc: "Live status, player counts, maps, BattleMetrics, and direct connect links." },
  { key: "account-linking", href: "/account-linking", title: "Account Linking", icon: "🔗", desc: "Connect Steam and Discord so purchases, kits, roles, and rewards sync correctly." },
  { key: "lifetime-kits", href: "/lifetime-kits", title: "BTA Kits", icon: "👑", desc: "Explore free kits, Discord-linked and Booster rewards, premium kits, lifetime ranks, and bundles." },
  { key: "events", href: "/events", title: "Events", icon: "💥", desc: "Preview BTA custom events, Raidable Bases, Cargo Plane Crash, and the open-PvP action waiting across the map." },
  { key: "rules", href: "/rules", title: "Rules", icon: "🛡️", desc: "Read the community, gameplay, wipe protection, and fair-play rules before joining." },
  { key: "info", href: "/info", title: "QoL & Commands", icon: "⚡", desc: "Browse free QoL perks, events, premium perks, vehicles, limits, and in-game commands." }
];

const pageMeta = {
  servers: ["Server Network", "Choose your battlefield", "Live US, EU, and Test server information from the network source of truth."],
  "account-linking": ["Account Linking", "Keep every reward on the right account", "Link Steam and Discord to synchronize Tebex purchases, kits, Discord roles, and community rewards."],
  "lifetime-kits": ["BTA Kits & Packages", "Know exactly what every kit includes", "Browse free starter kits, Discord-linked and Booster rewards, premium kits, lifetime ranks, and the Ultimate bundle."],
  events: ["BTA Events", "The map never stays quiet", "Explore BTARust.net custom and native events. Every event is open PvP, so counter-players can arrive at any moment."],
  rules: ["Server Rules", "Simple rules. Better wipes.", "These rules apply across the BTARust.net network unless a server-specific notice says otherwise."],
  info: ["Player Guide", "QoL, perks, commands, and server info", "Everything players need after joining: protection, events, vehicles, ranks, limits, economy, and useful commands."]
};

const eventVideos = [
  { id: "oTlj8xio2rc", title: "Shipwreck", desc: "Race to a dangerous wreck site, fight for control, and secure the event loot before another group does." },
  { id: "k1auI9HlG20", title: "Convoy Reforged", desc: "Track and engage a heavily defended roaming convoy while watching every approach for counters." },
  { id: "MftnKINexAY", title: "Armored Train", desc: "Take on an armed train encounter that turns the rail network into a moving PvP objective." },
  { id: "izkoOym_YrA", title: "Harbor Event", desc: "Battle through a custom harbor encounter where the monument can become a high-stakes PvP hotspot." },
  { id: "sqfrLuLWQhY", title: "Airfield Event", desc: "Contest a custom Airfield encounter with hostile opposition, valuable rewards, and exposed sightlines." },
  { id: "4TrU0gYpXMg", title: "Launch Site Helipad Event", desc: "Push the Launch Site helipad objective and hold the area while rivals close in from across the monument." }
];

const qolGroups = [
  {
    title: "Free Quality-of-Life Perks",
    items: [
      "First 24-hour wipe protection",
      "Offline raid protection begins after the solo player—or the entire team/clan—has been offline for 30 minutes; active raid damage is reduced to 25%",
      "Free 2-seat mini copter with no fuel, 1 hour spawn cooldown, and 1 hour fetch cooldown",
      "Simple Symmetry building with planner UI, mirrored layouts, and normal material costs",
      "Healthy/improved loot, custom events, Raidable Bases, Easy Sailing, and Vote Skip Night",
      "60-minute days and 10-minute nights",
      "TC-range workbenches, blueprint sharing, car radio, remove tool, box stacking, and object stacking",
      "Clans, friends, stats, playtime tracking, and a server menu with Economy, RP, and Bank balances"
    ]
  },
  {
    title: "Events & PvE Content",
    items: [
      "Raidable Bases, Airfield Event, Armored Train, Cargo Plane Crash, Convoy, Harbor Event, and Launch Site Helipad Event",
      "Shipwreck, NPC events, custom NPC presets, monument additions, and custom monument content",
      "Raid markers, event notifications, cases, trader systems, skills, BattlePass, Daily Rewards, and playtime rewards",
      "Ultimate Leaderboard, map voting, and wipe calendar"
    ]
  },
  {
    title: "Premium Perks",
    items: [
      "VIP queue priority, BTA Custom SkinBox, improved BattlePass/Daily Rewards, and faster RP progression",
      "Furnace Splitter, backpack access, increased turret/defense limits, and vehicle spawning upgrades",
      "Auto electrical branches, team/clan/friend authorization, auto door codes, and inventory sorting",
      "Instant crafting for Officer and General, plus building grade tools",
      "Premium kit groups: Builder, Electrical, Farm, Discord Booster, VIP, Recruit, Enlistment, Soldier, Officer, General, and Ultimate (all except Discord Booster)"
    ]
  }
];

const commandGroups = [
  { title: "Start Here", commands: ["/info — server menu and quick help", "/help — basic help", "/kit — available kits", "/rules — server rules", "/store — store and perks", "/discord — Discord linking help", "/dc — generate a Discord linking code", "/wipe or /wipedata — wipe schedule", "/stats — player stats", "/playtime — view playtime", "/clan — clan system", "/remove — remove owned structures/entities", "/shop — shop, where available", "/vote — vote rewards", "/claim — claim vote rewards", "/rewardlist — vote reward list"] },
  { title: "Wipe Protection", commands: ["/bta — wipe protection info", "/protection — protection status", "/protectionoff — disable protection early", "/wipeprotection or /wp — protection info/status"] },
  { title: "Premium & QoL", commands: ["/skins, /skin, /skinbox — SkinBox", "/backpack or /bp — backpack", "/up and /upall — building upgrades", "/bgrade or /grade — building grade tool", "/code 1234 — auto-apply code locks", "/fs — Furnace Splitter", "/bs — Blueprint Share", "/btawb — TC workbench", "/togglecarradio — car radio", "/sym — Simple Symmetry"] },
  { title: "Vehicles", commands: ["/mymini, /fmini, /nomini — Mini Copter", "/myheli, /fheli, /noheli — Scrap Transport Helicopter", "/myattack, /fattack, /noattack — Attack Helicopter"] }
];

const rankReference = [
  "Default: mini has no fuel with 1 hour spawn/fetch cooldown; no backpack",
  "VIP: mini has no fuel with 5 minute spawn/fetch cooldown; 12-slot backpack",
  "Recruit: mini has no fuel with 5 minute spawn/fetch cooldown; 24-slot backpack",
  "Enlistment: mini starts with 100 fuel and 5 minute spawn/fetch cooldown; 24-slot backpack",
  "Soldier: unlimited-fuel mini with 5 minute spawn/fetch cooldown; 48-slot backpack",
  "Officer: unlimited-fuel mini (5 minutes) and Scrap Heli (1 hour); 48-slot backpack; unlimited defenses",
  "General: Officer vehicles plus unlimited-fuel Attack Heli (1 hour); 48-slot backpack; unlimited defenses",
  "Backpack body bags despawn after 30 minutes"
];

const economySystems = ["Server Rewards / RP", "Economics", "Bank System", "Shop", "Daily Rewards", "BattlePass / Gamepass", "Playtime rewards every 30 minutes", "Faster RP progression for premium ranks"];

const rankRewards = {
  vip: "1,000 RP • 2,000 Keys • 500 XP",
  recruit: "2,000 RP • 4,000 Keys • 500 XP",
  enlistment: "4,000 RP • 8,000 Keys • 1,000 XP",
  soldier: "6,000 RP • 10,000 Keys • 2,000 XP",
  officer: "8,000 RP • 15,000 Keys • 3,000 XP",
  general: "10,000 RP • 20,000 Keys • 4,000 XP",
  ultimate: "30,000 RP • 40,000 Keys • 10,000 XP"
};

const kitDetails = {
  "Starter Kit": {
    image: "/kits/starter.png",
    title: "Starter Kit",
    desc: "Starter kit with 3 claims per wipe and a 1 hour cooldown.",
    items: "Stone, metal fragments, wood, animal fat, pistol ammo, sheet metal doors, code locks, tool cupboard, building plan, hammer, revolver, spear, pumpkins, and medical supplies."
  },
  "Food Kit": {
    image: "/kits/food.png",
    title: "Food Kit",
    desc: "Basic food and water recovery kit with a 30 minute cooldown.",
    items: "Water, cooked steak, pumpkins, and potatoes."
  },
  "Discord Kit": {
    image: "/kits/discord.png",
    title: "Discord Kit",
    desc: "Free Discord-linked kit for players who connect their Discord account.",
    items: "Pistol ammo, hazmat suit, pistol, pickaxe, salvaged tool, bandages, and medical syringes."
  },
  "Discord Booster Kit": {
    image: "/kits/discord-booster.png",
    title: "Discord Booster Kit",
    desc: "Earned reward for players with an active boost on the BTARust.net Discord server. This is not a free kit. Includes 5 claims and a 1 hour cooldown.",
    items: "MP5, pistol ammo, jackhammer, chainsaw, low grade fuel, supply signal, road sign armor set, hoodie, pants, boots, tactical gloves, backpack, medical syringes, bandages, medkit, and wooden barricade cover."
  },
  "VIP": {
    image: "/kits/viplifetime.png",
    title: "VIP",
    desc: "Monthly VIP kit access with VIP queue skip permissions, unlimited claims per wipe, and a 24 hour cooldown.",
    items: "Pistol ammo, stone, metal fragments, wood, animal fat, gears, pumpkins, road sign armor, hoodie, pants, boots, tactical gloves, SMG, wooden barricades, medical syringes, bandages, and medkit.",
    rewards: rankRewards.vip
  },
  "VIP Lifetime": {
    image: "/kits/viplifetime.png",
    title: "VIP Lifetime",
    desc: "Lifetime VIP kit access with queue priority, Custom SkinBox, a 12-slot backpack, free-fuel mini access, and unlimited claims with a 24 hour kit cooldown.",
    perks: "Mini: no fuel, 5 minute spawn/fetch cooldown. Backpack: 12 slots. Default defense limits: 12 auto turrets, 12 flame turrets, 6 SAM sites, and 24 shotgun traps.",
    items: "Pistol ammo, stone, metal fragments, wood, animal fat, gears, HQM, pumpkins, road sign armor, hoodie, pants, boots, tactical gloves, rifle, wooden barricades, medical syringes, bandages, and medkit.",
    rewards: rankRewards.vip,
    packageUrl: "https://btarustnet.tebex.io/package/7439480"
  },
  "Recruit Tier": {
    image: "/kits/recruit.png",
    title: "Recruit Tier",
    desc: "Recruit progression kit with a 24-slot backpack, free-fuel mini access, increased turret limits, unlimited claims, and a 24 hour kit cooldown.",
    perks: "Mini: no fuel, 5 minute spawn/fetch cooldown. Backpack: 24 slots. Defense limits: 24 auto turrets, 12 flame turrets, 6 SAM sites, and 24 shotgun traps.",
    items: "Pistol ammo, wood, stone, metal fragments, animal fat, gears, basic tools, burlap/wood armor, P2 pistol, wooden barricades, medical syringes, bandages, and pumpkins.",
    rewards: rankRewards.recruit
  },
  "Enlistment Tier": {
    image: "/kits/enlisted.png",
    title: "Enlistment Tier",
    desc: "Enlistment progression kit with better gear, a 24-slot backpack, fast mini access, increased turret limits, unlimited claims, and a 24 hour kit cooldown.",
    perks: "Mini: 100 fuel, 5 minute spawn/fetch cooldown. Backpack: 24 slots. Defense limits: 24 auto turrets, 12 flame turrets, 6 SAM sites, and 24 shotgun traps.",
    items: "Pistol ammo, wood, stone, metal fragments, animal fat, gears, salvage tools, road sign armor, hoodie, pants, boots, tactical gloves, SMG, barricades, medical syringes, bandages, and pumpkins.",
    rewards: rankRewards.enlistment
  },
  "Soldier Tier": {
    image: "/kits/soldier.png",
    title: "Soldier Tier",
    desc: "Soldier progression kit with mid-game combat support, a 48-slot backpack, unlimited-fuel mini access, expanded defenses, unlimited claims, and a 24 hour kit cooldown.",
    perks: "Mini: unlimited fuel, 5 minute spawn/fetch cooldown. Backpack: 48 slots. Defense limits: 48 auto turrets, 24 flame turrets, 12 SAM sites, and 48 shotgun traps.",
    items: "Wood, stone, metal fragments, animal fat, HQM, gears, salvage tools, pistol ammo, rifle ammo, road sign armor, hoodie, pants, boots, tactical gloves, rifle, barricades, medical syringes, medkits, bandages, and pumpkins.",
    rewards: rankRewards.soldier
  },
  "Officer Tier": {
    image: "/kits/officer.png",
    title: "Officer Tier",
    desc: "Tier 3 workbench access with Instant Craft, the best RP and Skill progression, Elite Battle Pass, premium mid-late wipe support, unlimited claims per wipe, and a 24 hour cooldown.",
    perks: "Instant Craft, best RP progression, best Skill progression, and Elite Battle Pass.",
    items: "Rifle ammo, wood, stone, metal fragments, animal fat, gears, HQM, weapon components, chainsaw, jackhammer, low grade fuel, cloth, coffins, armor, assault rifle, medical syringes, pumpkins, airdrops, and loot bag.",
    rewards: rankRewards.officer
  },
  "Officer Tier Lifetime": {
    image: "/kits/officer.png",
    title: "Officer Tier Lifetime",
    desc: "Permanent Officer access with Instant Craft, the best RP and Skill progression, Elite Battle Pass, Tier 3 support, a 48-slot backpack, unlimited-fuel mini and Scrap Transport Helicopter access, unlimited defenses, unlimited claims, and a 24 hour kit cooldown.",
    perks: "Instant Craft, best RP progression, best Skill progression, and Elite Battle Pass. Mini: unlimited fuel, 5 minute spawn/fetch cooldown. Scrap heli: unlimited fuel, 1 hour spawn/fetch cooldown. Backpack: 48 slots. Auto turrets, flame turrets, SAM sites, and shotgun traps: unlimited.",
    items: "Rifle ammo, wood, stone, metal fragments, animal fat, gears, HQM, weapon components, chainsaw, jackhammer, low grade fuel, cloth, coffins, armor, assault rifle, medical syringes, pumpkins, airdrops, and loot bag.",
    rewards: rankRewards.officer
  },
  "General Tier": {
    image: "/kits/general.png",
    title: "General Tier",
    desc: "Top-tier monthly progression kit with Instant Craft, the best RP and Skill progression, Elite Battle Pass, massive resource support, premium gear and utility access, unlimited claims per wipe, and a 24 hour cooldown.",
    perks: "Instant Craft, best RP progression, best Skill progression, and Elite Battle Pass.",
    items: "Rifle ammo, full metal gear, hoodie, pants, boots, tactical gloves, wood, stone, metal fragments, animal fat, gears, HQM, coffins, cloth, chainsaws, jackhammers, low grade fuel, weapon components, assault rifles, medical syringes, medkits, barricades, airdrops, and pumpkins.",
    rewards: rankRewards.general
  },
  "General Tier Lifetime": {
    image: "/kits/general.png",
    title: "General Tier Lifetime",
    desc: "Permanent top-tier access with Instant Craft, the best RP and Skill progression, Elite Battle Pass, a 48-slot backpack, unlimited-fuel mini, Scrap Transport and Attack Helicopter access, unlimited defenses, premium utility permissions, unlimited claims, and a 24 hour kit cooldown.",
    perks: "Instant Craft, best RP progression, best Skill progression, and Elite Battle Pass. Mini: unlimited fuel, 5 minute spawn/fetch cooldown. Scrap and attack helis: unlimited fuel, 1 hour spawn/fetch cooldown. Backpack: 48 slots. Auto turrets, flame turrets, SAM sites, and shotgun traps: unlimited.",
    items: "Rifle ammo, full metal gear, hoodie, pants, boots, tactical gloves, wood, stone, metal fragments, animal fat, gears, HQM, coffins, cloth, chainsaws, jackhammers, low grade fuel, weapon components, assault rifles, medical syringes, medkits, barricades, airdrops, and pumpkins.",
    rewards: rankRewards.general
  },
  "Builder Kit": {
    image: "/kits/builder.png",
    title: "Builder Lifetime Kit",
    desc: "Advanced building and compound support kit with premium construction supplies, unlimited claims per wipe, and a 24 hour cooldown.",
    items: "Wood, stone, metal fragments, HQM, code locks, doors, gates, walls, barricades, garage doors, tool cupboards, coffins, workbenches, research table, repair bench, ladder, netting, window bars, armored doors, ladder hatches, building plan, and hammer."
  },
  "Electrical Kit": {
    image: "/kits/electrical.png",
    title: "Electrical Lifetime Kit",
    desc: "Advanced electrical and automation support kit for power generation, industrial components, turrets, furnaces, and utilities with a 24 hour cooldown.",
    items: "Generator, batteries, windmills, solar panels, electrical branches, switches, splitters, electric furnaces, lights, fridge, industrial components, computer station, wire tool, piping tool, auto turrets, weapons, and ammo."
  },
  "Farm Kit": {
    image: "/kits/farm.png",
    title: "Farm Lifetime Kit",
    desc: "Advanced farming and water management kit with automated irrigation, plant growth systems, sprinklers, planters, and utilities.",
    items: "Water barrels, planters, water splitters, pumps, electrical components, batteries, lights, heaters, sprinklers, water storage, hose tools, farming deployables, clones, seeds, and food."
  }
};

const freeKits = [
  { icon: "🎒", title: "Starter Kit", badges: ["Steam Required", "3 Claims", "1 Hr Cooldown"], desc: kitDetails["Starter Kit"].desc },
  { icon: "🍖", title: "Food Kit", badges: ["Steam Required", "Unlimited", "30 Min Cooldown"], desc: kitDetails["Food Kit"].desc },
  { icon: "💬", title: "Discord Kit", badges: ["Discord Required", "3 Claims", "5 Min Cooldown"], desc: kitDetails["Discord Kit"].desc }
];

const discordBoosterKit = {
  icon: "🚀",
  title: "Discord Booster Kit",
  badges: ["Active Server Boost Required", "5 Claims", "1 Hr Cooldown"],
  desc: kitDetails["Discord Booster Kit"].desc
};

const lifetimeKits = [
  {
    icon: "👑",
    title: "ULTIMATE Lifetime Bundle",
    detailsKey: "ULTIMATE Lifetime Bundle",
    cooldown: "24 Hr",
    backpack: "48 Slots",
    bundle: "Includes All Kits Except Discord Booster",
    rewards: rankRewards.ultimate,
    price: "$170.00 USD",
    packageUrl: "https://btarustnet.tebex.io/package/7439471"
  },
  {
    icon: "💎",
    title: "VIP Queue Skip Lifetime (KIT & PERMS)",
    detailsKey: "VIP Lifetime",
    cooldown: "24 Hr",
    backpack: "12 Slots",
    bundle: "Permanent VIP Kit & Permissions",
    rewards: rankRewards.vip,
    price: "$25.50 USD",
    packageUrl: "https://btarustnet.tebex.io/package/7439459"
  }
];

const buildYourOwnLifetimeKits = [
  {
    icon: "👑",
    title: "General Lifetime Kit",
    detailsKey: "General Tier Lifetime",
    cooldown: "24 Hr",
    backpack: "48 Slots",
    rewards: rankRewards.general,
    price: "$50.00 USD",
    packageUrl: "https://btarustnet.tebex.io/package/7439470"
  },
  {
    icon: "⭐",
    title: "Officer Lifetime Kit",
    detailsKey: "Officer Tier Lifetime",
    cooldown: "24 Hr",
    backpack: "48 Slots",
    rewards: rankRewards.officer,
    price: "$45.00 USD",
    packageUrl: "https://btarustnet.tebex.io/package/7486542"
  },
  {
    icon: "⚔️",
    title: "Soldier Lifetime Kit",
    detailsKey: "Soldier Tier",
    cooldown: "24 Hr",
    backpack: "48 Slots",
    rewards: rankRewards.soldier,
    price: "$40.00 USD",
    packageUrl: "https://btarustnet.tebex.io/package/7439466"
  },
  {
    icon: "🎖️",
    title: "Enlistment Lifetime Kit",
    detailsKey: "Enlistment Tier",
    cooldown: "24 Hr",
    backpack: "24 Slots",
    rewards: rankRewards.enlistment,
    price: "$30.00 USD",
    packageUrl: "https://btarustnet.tebex.io/package/7439464"
  },
  {
    icon: "🪖",
    title: "Recruit Lifetime Kit",
    detailsKey: "Recruit Tier",
    cooldown: "24 Hr",
    backpack: "24 Slots",
    rewards: rankRewards.recruit,
    price: "$20.00 USD",
    packageUrl: "https://btarustnet.tebex.io/package/7439462"
  },
  {
    icon: "💎",
    title: "VIP Lifetime Kit (KIT ONLY NO PERMS)",
    detailsKey: "VIP Lifetime",
    cooldown: "24 Hr",
    backpack: "No Permission Bundle",
    rewards: rankRewards.vip,
    price: "$5.00 USD",
    packageUrl: "https://btarustnet.tebex.io/package/7439458"
  },
  {
    icon: "🌱",
    title: "Farm Lifetime Kit",
    cooldown: "24 Hr",
    backpack: "No Backpack",
    price: "$10.00 USD",
    packageUrl: "https://btarustnet.tebex.io/package/7486439"
  },
  {
    icon: "⚡",
    title: "Electrical Lifetime Kit",
    cooldown: "24 Hr",
    backpack: "No Backpack",
    price: "$10.00 USD",
    packageUrl: "https://btarustnet.tebex.io/package/7486415"
  },
  {
    icon: "🏗️",
    title: "Builder Lifetime Kit",
    cooldown: "24 Hr",
    backpack: "No Backpack",
    price: "$10.00 USD",
    packageUrl: "https://btarustnet.tebex.io/package/7486262"
  }
];

function getPackageUrl(kit) {
  if (kit?.packageUrl && kit.packageUrl.trim() !== "") return kit.packageUrl;
  return "https://btarustnet.tebex.io";
}

function getKitDetails(title) {
  if (title === "ULTIMATE Lifetime Bundle") {
    const includedKeys = [
      "Starter Kit",
      "Food Kit",
      "Discord Kit",
      "VIP Lifetime",
      "Recruit Tier",
      "Enlistment Tier",
      "Soldier Tier",
      "Officer Tier Lifetime",
      "General Tier Lifetime",
      "Builder Kit",
      "Electrical Kit",
      "Farm Kit"
    ];

    return {
      title: "ULTIMATE Lifetime Bundle",
      desc: "The complete BTARust.net lifetime collection: every kit shown below except the Discord Booster Kit, which remains exclusive to active Discord server boosters.",
      items: includedKeys.map((key) => kitDetails[key].title).join(", "),
      perks: "Includes the kit contents and applicable rank permissions shown for every included package. Discord Booster rewards are not included.",
      rewards: rankRewards.ultimate,
      bundleKits: includedKeys.map((key) => kitDetails[key])
    };
  }

  const aliases = {
    "VIP Queue Skip": "VIP",
    "VIP Queue Skip Lifetime": "VIP Lifetime",
    "VIP Lifetime Kit (KIT ONLY NO PERMS)": "VIP Lifetime",
    "Recruit Lifetime": "Recruit Tier",
    "Recruit Lifetime Kit": "Recruit Tier",
    "Enlistment Lifetime": "Enlistment Tier",
    "Enlistment Lifetime Kit": "Enlistment Tier",
    "Soldier Lifetime": "Soldier Tier",
    "Soldier Lifetime Kit": "Soldier Tier",
    "Officer Lifetime": "Officer Tier",
    "Officer Lifetime Kit": "Officer Tier",
    "General Lifetime": "General Tier",
    "General Lifetime Kit": "General Tier",
    "Build Your Own Lifetime Bundle": "General Tier",
    "Farm Lifetime Kit": "Farm Kit",
    "Electrical Lifetime Kit": "Electrical Kit",
    "Builder Lifetime Kit": "Builder Kit"
  };

  return kitDetails[title] || kitDetails[aliases[title]] || null;
}

function KitModal({ kit, onClose }) {
  useEffect(() => {
    if (!kit) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [kit, onClose]);

  if (!kit) return null;

  return (
    <div className="modal" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="modalInner kitModalInner" role="dialog" aria-modal="true" aria-labelledby="kit-modal-title">
        <button className="close" onClick={onClose} autoFocus>✕ Close</button>
        <div className={`modalGrid ${kit.bundleKits ? "bundleModalGrid" : ""}`}>
          {kit.bundleKits ? (
            <div className="bundleGallery">
              {kit.bundleKits.map((includedKit) => (
                <figure className="bundleKit" key={includedKit.title}>
                  <img src={includedKit.image} alt={`${includedKit.title} preview`} />
                  <figcaption>{includedKit.title}</figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <img src={kit.image} alt={`${kit.title} preview`} className="kitImg" />
          )}
          <div className="modalCopy">
            <p className="eyebrow">Kit Preview</p>
            <h2 className="h2" id="kit-modal-title">{kit.title}</h2>
            <p className="muted">{kit.desc}</p>
            <div className="modalBox">
              <h3>{kit.bundleKits ? "Included Kits" : "Items Provided"}</h3>
              <p>{kit.items}</p>
            </div>
            {kit.perks && (
              <div className="modalBox">
                <h3>QoL & Permissions</h3>
                <p>{kit.perks}</p>
              </div>
            )}
            {kit.rewards && (
              <div className="modalBox">
                <h3>Package Extras</h3>
                <p>{kit.rewards}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page({ initialView = "home" }) {
  const [preview, setPreview] = useState(null);
  const [linked, setLinked] = useState({ steam: false, discord: false });
  const [linkStatusLoading, setLinkStatusLoading] = useState(true);
  const [linkMessage, setLinkMessage] = useState("");
  const [serverStatus, setServerStatus] = useState({});
  const activeMeta = pageMeta[initialView];
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
    const result = params.get("discord") || params.get("steam");
    if (result === "linked") setLinkMessage("Account linked successfully.");
    if (result === "failed") setLinkMessage("Account linking failed. Please try again or open a support ticket.");

    const loadLinkStatus = async () => {
      try {
        const response = await fetch("/api/auth/status", { cache: "no-store" });
        const payload = await response.json();
        if (!response.ok || !payload.ok) throw new Error(payload.error || "Status lookup failed");

        setLinked({
          steam: Boolean(payload.steam?.linked),
          discord: Boolean(payload.discord?.linked)
        });
        setProfile({
          steamName: payload.steam?.name || "Steam Player",
          steamAvatar: payload.steam?.avatar || steamLogo,
          discordName: payload.discord?.name || "Discord User",
          discordAvatar: payload.discord?.avatar || discordLogo
        });
      } catch (error) {
        console.error("Unable to load linked account status", error);
        setLinkMessage("Unable to load account status. Please refresh and try again.");
      } finally {
        setLinkStatusLoading(false);
      }
    };

    loadLinkStatus();
  }, []);

  useEffect(() => {
    if (initialView !== "servers") return undefined;

    let active = true;

    const refreshServerStatus = async () => {
      try {
        const response = await fetch("/api/status/battlemetrics", { cache: "no-store" });
        if (!response.ok) throw new Error(`Status API returned ${response.status}`);
        const payload = await response.json();

        if (active) {
          setServerStatus(
            Object.fromEntries((payload.servers || []).map((server) => [server.id, server]))
          );
        }
      } catch (error) {
        console.warn("Unable to refresh server status", error);
      }
    };

    refreshServerStatus();
    const timer = setInterval(refreshServerStatus, 60_000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [initialView]);

  const unlinkAccount = async (type, askForConfirmation = true) => {
    const confirmed = !askForConfirmation || window.confirm(`Unlink your ${type === "steam" ? "Steam" : "Discord"} account from this website?`);
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/auth/${type}/unlink`, { method: "POST" });
      const payload = await response.json();
      if (!response.ok || !payload.ok) throw new Error(payload.error || "Unlink failed");

      setLinked((current) => ({ ...current, [type]: false }));
      setProfile((current) => ({
        ...current,
        ...(type === "steam" ? { steamName: "Steam Player", steamAvatar: steamLogo } : {}),
        ...(type === "discord" ? { discordName: "Discord User", discordAvatar: discordLogo } : {})
      }));
      setLinkMessage(`${type === "steam" ? "Steam" : "Discord"} account unlinked.`);
    } catch (error) {
      console.error(`${type} unlink failed`, error);
      setLinkMessage(`Unable to unlink ${type === "steam" ? "Steam" : "Discord"}. Please try again.`);
    }
  };

  const unlinkAllAccounts = async () => {
    if (!window.confirm("Unlink both Steam and Discord from this website?")) return;
    await Promise.all([
      linked.steam ? unlinkAccount("steam", false) : Promise.resolve(),
      linked.discord ? unlinkAccount("discord", false) : Promise.resolve()
    ]);
  };

  const openKit = (title) => {
    setPreview(getKitDetails(title));
  };

  return (
    <>
      <style>{`
        *{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:#09090b;color:#f4f4f5;font-family:Inter,system-ui,Segoe UI,Arial,sans-serif;background-image:linear-gradient(180deg,rgba(0,0,0,.72),rgba(9,9,11,.96) 55%,#09090b 100%),url('/BTARust_HeroImage_Optimized.jpg');background-size:cover;background-position:top center;background-attachment:fixed;background-repeat:no-repeat}a{color:inherit;text-decoration:none}.bg{position:fixed;inset:0;z-index:-1;background:radial-gradient(circle at top left,rgba(249,115,22,.22),transparent 34%),radial-gradient(circle at top right,rgba(185,28,28,.18),transparent 30%),linear-gradient(180deg,rgba(0,0,0,.18),#09090b 82%);pointer-events:none}.container{max-width:1280px;margin:0 auto;padding:0 24px}.header{display:flex;align-items:center;justify-content:space-between;padding:22px 24px;gap:20px;position:sticky;top:0;z-index:20;background:linear-gradient(180deg,rgba(9,9,11,.92),rgba(9,9,11,.62));backdrop-filter:blur(14px);border-bottom:1px solid rgba(249,115,22,.12)}.brand{display:flex;align-items:center;gap:14px}.brand img{width:52px;height:52px;border-radius:16px;border:1px solid rgba(249,115,22,.35);transition:.25s ease}.brand:hover img{transform:rotate(-2deg) scale(1.06);box-shadow:0 0 26px rgba(249,115,22,.35)}.nav{display:flex;gap:22px;color:#d4d4d8;font-size:14px}.nav a{position:relative;transition:.25s ease;white-space:nowrap}.nav a:hover,.nav a.active{color:#fb923c}.nav a:after{content:"";position:absolute;left:0;right:0;bottom:-8px;height:2px;background:#fb923c;transform:scaleX(0);transform-origin:left;transition:.25s ease}.nav a:hover:after,.nav a.active:after{transform:scaleX(1)}.actions{display:flex;gap:10px;flex-wrap:wrap}.btn{position:relative;overflow:hidden;display:inline-flex;align-items:center;justify-content:center;border-radius:18px;padding:12px 18px;font-weight:900;border:0;cursor:pointer;background:linear-gradient(135deg,#f97316,#ea580c 55%,#c2410c);color:white;box-shadow:0 12px 28px rgba(124,45,18,.35),inset 0 1px 0 rgba(255,255,255,.25);transition:transform .22s ease,box-shadow .22s ease,filter .22s ease}.btn:hover{transform:translateY(-3px) scale(1.03);box-shadow:0 18px 42px rgba(249,115,22,.35),0 0 22px rgba(249,115,22,.25);filter:saturate(1.15)}.btn:active{transform:translateY(0) scale(.98)}.btn.outline{background:rgba(9,9,11,.68);border:1px solid rgba(255,255,255,.18);color:#fafafa;box-shadow:inset 0 1px 0 rgba(255,255,255,.06)}.btn.outline:hover{border-color:rgba(249,115,22,.7);box-shadow:0 0 30px rgba(249,115,22,.18),inset 0 1px 0 rgba(255,255,255,.08)}.btnShine{position:absolute;inset:-40% auto -40% -70%;width:60%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.35),transparent);transform:skewX(-20deg);transition:left .55s ease}.btn:hover .btnShine{left:125%}.btnText{position:relative;z-index:1}.hero{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;padding-top:70px;padding-bottom:70px;animation:fadeUp .7s ease both}.logo{width:210px;height:210px;border-radius:28px;border:1px solid rgba(249,115,22,.35);object-fit:cover;box-shadow:0 25px 80px rgba(0,0,0,.45);animation:floatLogo 4.5s ease-in-out infinite}.pill{display:inline-flex;padding:8px 14px;border:1px solid rgba(249,115,22,.35);border-radius:999px;background:rgba(124,45,18,.25);color:#fed7aa;font-size:14px;margin:20px 0}.h1{font-size:64px;line-height:1;letter-spacing:-.04em;margin:0;font-weight:1000;text-shadow:0 8px 34px rgba(0,0,0,.55)}.orange{color:#fb923c;text-shadow:0 0 22px rgba(249,115,22,.22)}.card{position:relative;overflow:hidden;border:1px solid rgba(255,255,255,.08);background:linear-gradient(145deg,rgba(15,15,18,.86),rgba(8,8,10,.74));border-radius:28px;box-shadow:0 25px 70px rgba(0,0,0,.35);transition:transform .25s ease,border-color .25s ease,box-shadow .25s ease}.card:before{content:"";position:absolute;inset:0;background:linear-gradient(120deg,transparent,rgba(249,115,22,.08),transparent);opacity:0;transition:.25s ease;pointer-events:none}.card:hover{transform:translateY(-6px);border-color:rgba(249,115,22,.45);box-shadow:0 30px 90px rgba(0,0,0,.5),0 0 30px rgba(249,115,22,.12)}.card:hover:before{opacity:1}.card.orangeBorder{border-color:rgba(249,115,22,.45)}.pad{padding:26px;position:relative;z-index:1}.section{padding:56px 0;animation:fadeUp .7s ease both}.sectionHead{display:flex;justify-content:space-between;gap:24px;align-items:end;margin-bottom:28px}.eyebrow{font-size:13px;text-transform:uppercase;letter-spacing:.18em;color:#fdba74;font-weight:900}.h2{font-size:40px;line-height:1.05;margin:10px 0 0;font-weight:1000;letter-spacing:-.03em}.muted{color:#a1a1aa;line-height:1.65}.grid{display:grid;gap:20px}.grid3{grid-template-columns:repeat(3,1fr)}.grid4{grid-template-columns:repeat(4,1fr)}.badge{display:inline-flex;border-radius:999px;background:rgba(24,24,27,.88);padding:6px 10px;font-size:12px;font-weight:900;color:#d4d4d8;border:1px solid rgba(255,255,255,.06);transition:.22s ease}.badge:hover{transform:translateY(-1px);border-color:rgba(249,115,22,.35)}.badge.green{background:rgba(16,185,129,.16);color:#86efac;border-color:rgba(16,185,129,.22)}.badge.orange{background:rgba(249,115,22,.16);color:#fdba74;border:1px solid rgba(249,115,22,.25)}.kitIcon{width:56px;height:56px;border-radius:18px;background:linear-gradient(135deg,rgba(249,115,22,.28),rgba(124,45,18,.22));display:flex;align-items:center;justify-content:center;font-size:30px;box-shadow:inset 0 1px 0 rgba(255,255,255,.08);transition:.25s ease}.card:hover .kitIcon{transform:scale(1.08) rotate(-3deg);box-shadow:0 0 28px rgba(249,115,22,.18)}.kitTitle{font-size:26px;margin:20px 0 8px;font-weight:1000}.badges{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0}.kitImg{width:100%;max-width:100%;border-radius:20px;border:1px solid #3f3f46;background:#09090b;object-fit:contain}.countdownLayout{display:grid;grid-template-columns:minmax(0,1fr) 230px;gap:28px;align-items:center}.countdownCard .pad{padding:30px}.count{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:20px}.count div{background:rgba(24,24,27,.78);border:1px solid rgba(255,255,255,.08);border-radius:20px;padding:18px;text-align:center;transition:.25s ease}.count div:hover{transform:translateY(-4px);border-color:rgba(249,115,22,.45)}.count strong{display:block;color:#fdba74;font-size:38px;text-shadow:0 0 18px rgba(249,115,22,.28)}.hourglassPanel{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:260px;border:1px solid rgba(249,115,22,.22);border-radius:24px;background:radial-gradient(circle at top,rgba(249,115,22,.16),rgba(9,9,11,.55));box-shadow:inset 0 1px 0 rgba(255,255,255,.06)}.hourglassTitle{font-weight:1000;letter-spacing:.16em;text-transform:uppercase;color:#fdba74;font-size:12px;margin-bottom:12px}.hourglass{position:relative;width:96px;height:158px;filter:drop-shadow(0 0 18px rgba(249,115,22,.22))}.hgCap{position:absolute;left:7px;width:82px;height:12px;border-radius:999px;background:linear-gradient(90deg,#78350f,#fdba74,#78350f);box-shadow:0 0 12px rgba(249,115,22,.25)}.hgCap.top{top:0}.hgCap.bottom{bottom:0}.hgGlass{position:absolute;top:14px;bottom:14px;left:17px;right:17px;border:3px solid rgba(253,186,116,.78);border-radius:18px;overflow:hidden;clip-path:polygon(0 0,100% 0,58% 50%,100% 100%,0 100%,42% 50%);background:rgba(255,255,255,.04)}.hgTopSand{position:absolute;top:0;left:0;right:0;background:linear-gradient(180deg,#fde68a,#f97316);transition:height .9s linear;opacity:.9}.hgBottomSand{position:absolute;bottom:0;left:0;right:0;background:linear-gradient(0deg,#fde68a,#f97316);transition:height .9s linear;opacity:.95}.hgStream{position:absolute;left:50%;top:44%;width:4px;height:28px;border-radius:999px;background:#fde68a;transform:translateX(-50%);animation:sandStream 1s linear infinite;box-shadow:0 0 10px rgba(253,230,138,.8)}.hourglassPercent{margin-top:12px;color:#a1a1aa;font-weight:800;font-size:12px;text-align:center}.card:hover .hourglass{animation:hourglassTilt 1.8s ease-in-out infinite}@keyframes sandStream{0%{opacity:.25;transform:translateX(-50%) translateY(-4px)}50%{opacity:1}100%{opacity:.25;transform:translateX(-50%) translateY(8px)}}@keyframes hourglassTilt{0%,100%{transform:rotate(0)}50%{transform:rotate(2deg)}}.modal{position:fixed;inset:0;background:rgba(0,0,0,.82);z-index:50;display:flex;align-items:center;justify-content:center;padding:24px}.modalInner{position:relative;max-width:1100px;max-height:92vh;overflow:auto;background:#09090b;border:1px solid rgba(249,115,22,.35);border-radius:24px;padding:18px}.kitModalInner{max-width:1200px}.close{position:absolute;right:16px;top:16px;background:#ef4444;color:white;border:0;border-radius:12px;padding:10px 14px;font-weight:900;z-index:5;cursor:pointer;transition:.22s ease}.close:hover{transform:translateY(-2px);box-shadow:0 0 22px rgba(239,68,68,.35)}.modalGrid{display:grid;grid-template-columns:1.25fr .75fr;gap:22px;align-items:start;padding-top:48px}.bundleModalGrid{grid-template-columns:minmax(0,1.65fr) minmax(280px,.75fr)}.bundleGallery{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.bundleKit{margin:0;border:1px solid rgba(249,115,22,.24);border-radius:16px;background:#111114;overflow:hidden}.bundleKit img{display:block;width:100%;aspect-ratio:1/1;object-fit:contain;background:#09090b}.bundleKit figcaption{padding:10px;font-size:12px;font-weight:900;color:#fed7aa;text-align:center}.modalCopy{padding:8px 6px}.modalBox{margin-top:20px;border:1px solid #27272a;background:rgba(24,24,27,.75);border-radius:20px;padding:18px}.modalBox h3{margin:0 0 10px;color:#fdba74}.modalBox p{margin:0;color:#d4d4d8;line-height:1.65}.footer{text-align:center;color:#a1a1aa;padding:50px 0;border-top:1px solid #27272a}.rules{grid-template-columns:repeat(2,1fr)}.rule{background:rgba(24,24,27,.72);border:1px solid rgba(255,255,255,.08);border-radius:18px;padding:16px;transition:.22s ease}.rule:hover{transform:translateX(4px);border-color:rgba(249,115,22,.35);background:rgba(24,24,27,.88)}.pageIntro{padding-top:58px;padding-bottom:8px}.pageIntro .h1{font-size:52px}.routeGrid{grid-template-columns:repeat(5,minmax(0,1fr))}.routeCard{display:block;height:100%}.routeCard .card{height:100%}.infoList{margin:18px 0 0;padding-left:20px;color:#d4d4d8;line-height:1.65}.infoList li+li{margin-top:9px}.commandList{display:grid;gap:9px;margin-top:18px}.commandLine{padding:11px 13px;border:1px solid rgba(255,255,255,.07);border-radius:12px;background:rgba(24,24,27,.66);color:#d4d4d8;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:13px}.boosterCallout{margin-top:28px}.boosterCallout .card{border-color:rgba(88,101,242,.55);background:linear-gradient(145deg,rgba(54,57,99,.42),rgba(9,9,11,.8))}@keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}@keyframes floatLogo{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}@media(max-width:1100px){.routeGrid{grid-template-columns:repeat(2,1fr)}}@media(max-width:900px){.countdownLayout{grid-template-columns:1fr}.hourglassPanel{min-height:220px}body{background-attachment:scroll;overflow-x:hidden}.container{width:100%;max-width:100%;padding:0 16px}.hero,.grid3,.grid4,.rules,.modalGrid,.linkGrid,.routeGrid{grid-template-columns:1fr!important}.nav{display:flex;width:100%;overflow-x:auto;gap:18px;padding:8px 0 10px}.h1{font-size:40px;line-height:1.05;letter-spacing:-.035em}.h2{font-size:30px;line-height:1.1}.sectionHead{display:block}.header{align-items:flex-start;flex-direction:column;padding:18px 16px}.header.container{padding-left:16px;padding-right:16px}.brand{width:100%;align-items:center}.brand img{width:62px;height:62px}.actions{width:100%;display:grid;grid-template-columns:1fr 1fr;gap:10px}.actions a,.actions button,.btn{width:100%;min-width:0}.badges{max-width:100%}.header>.actions>.badges{display:grid;grid-template-columns:1fr 1fr;width:100%;gap:10px}.header>.actions{grid-template-columns:1fr 1fr}.hero{gap:28px;padding-top:34px;padding-bottom:42px}.logo{width:150px;height:150px}.card{overflow:hidden;border-radius:22px}.pad{padding:18px}.section{padding:36px 0}.pageIntro{padding-top:36px}.pageIntro .h1{font-size:40px}.count{grid-template-columns:repeat(2,1fr);gap:10px}.count div{padding:14px}.count strong{font-size:30px}.linkGrid{display:grid!important;grid-template-columns:1fr!important;gap:16px!important}.linkCard{display:flex!important;flex-direction:column!important;text-align:center!important;align-items:center!important;width:100%!important;min-width:0!important;padding:18px!important}.linkCard>div{width:100%!important;min-width:0!important}.linkCard h3{font-size:28px!important;line-height:1.05!important;word-break:normal!important}.linkAvatar{width:96px!important;height:96px!important;flex:0 0 auto!important}.modal{padding:12px}.modalInner{width:100%;max-height:88vh}.modalGrid{gap:18px}.bundleGallery{grid-template-columns:repeat(2,minmax(0,1fr))}.kitTitle{font-size:22px}.rule{font-size:15px}.muted{font-size:15px;line-height:1.55}img{max-width:100%;height:auto}}@media(max-width:520px){.header>.actions{grid-template-columns:1fr}.header>.actions>.badges{grid-template-columns:1fr}.actions{grid-template-columns:1fr}.h1{font-size:36px}.h2{font-size:28px}.hero{text-align:left}.count{grid-template-columns:1fr 1fr}.btn{padding:13px 14px;border-radius:16px}.linkCard h3{font-size:26px!important}.linkCard .badges{justify-content:center}.grid{gap:16px}.bundleGallery{grid-template-columns:1fr 1fr}}
      `}</style>
      <style>{`
        .header.container{max-width:1600px}
        .nav{gap:14px;font-size:13px}
        .header .actions{gap:8px}
        .header .btn{padding:12px 15px}
        .routeGrid{grid-template-columns:repeat(3,minmax(0,1fr))}
        .eventWarning{border:1px solid rgba(239,68,68,.6);background:linear-gradient(135deg,rgba(127,29,29,.5),rgba(9,9,11,.88));border-radius:24px;padding:24px;box-shadow:0 0 36px rgba(239,68,68,.12)}
        .eventWarning h2{margin:8px 0 10px}
        .videoGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}
        .videoCard{overflow:hidden;border:1px solid rgba(249,115,22,.35);border-radius:24px;background:rgba(9,9,11,.9)}
        .videoFrame{position:relative;aspect-ratio:16/9;background:#000}
        .videoFrame iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
        .videoCopy{padding:20px}
        .videoCopy h3{margin:0 0 8px;font-size:24px}
        .eventFeatureGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px;align-items:start}
        .eventFeature{overflow:hidden;border:1px solid rgba(249,115,22,.35);border-radius:24px;background:rgba(9,9,11,.88)}
        .eventFeature img{display:block;width:100%;aspect-ratio:16/9;object-fit:contain;background:#050505}
        .eventFeatureCopy{padding:24px}
        .eventPhotoPair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;padding:10px}
        .eventPhotoPair img{border-radius:14px;aspect-ratio:16/9}
        @media(max-width:1100px){.routeGrid{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:900px){.videoGrid,.eventFeatureGrid{grid-template-columns:1fr}}
        @media(max-width:520px){.eventPhotoPair{grid-template-columns:1fr}}
      `}</style>
      <style>{`
        :root{--rad:#b8f52b;--hazard:#f5c542;--ember:#ff5a1f;--rust:#8e2f1b;--steel:#15191a}
        body{background-color:#070908;background-image:linear-gradient(180deg,rgba(3,6,4,.60),rgba(7,9,8,.96) 52%,#070908 100%),url('/BTARust_HeroImage_Optimized.jpg')}
        .bg{background:repeating-linear-gradient(135deg,rgba(245,197,66,.035) 0 12px,transparent 12px 36px),radial-gradient(circle at 14% 5%,rgba(184,245,43,.16),transparent 30%),radial-gradient(circle at 86% 8%,rgba(255,90,31,.18),transparent 31%),linear-gradient(180deg,rgba(0,0,0,.12),#070908 82%)}
        .header{background:linear-gradient(180deg,rgba(7,9,8,.96),rgba(7,9,8,.78));border-bottom:1px solid rgba(184,245,43,.22)}
        .header:after{content:"";position:absolute;left:0;right:0;bottom:-5px;height:4px;background:repeating-linear-gradient(135deg,#171a18 0 12px,#d5a91f 12px 24px);opacity:.72}
        .nav a:hover,.nav a.active,.orange{color:var(--rad)}
        .nav a:after{background:var(--rad);box-shadow:0 0 14px rgba(184,245,43,.6)}
        .btn{border-radius:8px;background:linear-gradient(135deg,#9b2f18,#e14d20 58%,#7d2114);text-transform:uppercase;letter-spacing:.05em;box-shadow:0 12px 28px rgba(78,20,10,.42),inset 0 1px 0 rgba(255,255,255,.2)}
        .btn:hover{box-shadow:0 16px 42px rgba(255,90,31,.3),0 0 22px rgba(184,245,43,.18)}
        .btn.outline{border-color:rgba(184,245,43,.35);background:rgba(10,14,11,.86)}
        .btn.outline:hover{border-color:rgba(184,245,43,.85);box-shadow:0 0 28px rgba(184,245,43,.18)}
        .card{border-radius:12px;border-color:rgba(184,245,43,.14);background:linear-gradient(145deg,rgba(20,25,22,.94),rgba(7,10,8,.90))}
        .card:after{content:"";position:absolute;inset:0;pointer-events:none;border:1px solid rgba(255,255,255,.025);background:linear-gradient(115deg,transparent 0 74%,rgba(184,245,43,.025) 74% 76%,transparent 76%)}
        .card:hover,.card.orangeBorder{border-color:rgba(184,245,43,.42)}
        .eyebrow{color:var(--hazard)}
        .badge.green{background:rgba(184,245,43,.13);color:#d9ff74;border-color:rgba(184,245,43,.28)}
        .badge.orange{background:rgba(255,90,31,.14);color:#ffb18e;border-color:rgba(255,90,31,.3)}
        .kitPrice{display:inline-flex;align-items:center;gap:8px;margin:2px 0 8px;padding:8px 12px;border:1px solid rgba(184,245,43,.46);border-radius:6px;background:rgba(85,112,20,.18);color:#dfff7e;font-size:20px;font-weight:1000;letter-spacing:.02em;box-shadow:inset 3px 0 0 var(--rad)}
        .nukePromo{position:relative;overflow:hidden;display:grid;grid-template-columns:minmax(0,1.05fr) minmax(340px,.95fr);gap:0;border:1px solid rgba(184,245,43,.38);border-radius:14px;background:#090d0a;box-shadow:0 30px 90px rgba(0,0,0,.55),0 0 42px rgba(184,245,43,.08)}
        .nukePromoCopy{padding:38px;align-self:center}
        .nukePromoCopy h2{font-size:46px;margin:8px 0 14px;text-transform:uppercase;line-height:.98}
        .nukePromoCopy strong{color:var(--rad);text-shadow:0 0 18px rgba(184,245,43,.35)}
        .nukePromoImage{min-height:390px;background:linear-gradient(90deg,#090d0a 0,transparent 25%),url('/BTA-Cargo-Nuke-Promo.png') center/cover no-repeat}
        .hazardLine{height:14px;margin:22px 0;background:repeating-linear-gradient(135deg,#121512 0 14px,#e6b92c 14px 28px);border:1px solid rgba(245,197,66,.35)}
        .radiationMark{font-size:54px;filter:drop-shadow(0 0 14px rgba(184,245,43,.38))}
        @media(max-width:900px){.nukePromo{grid-template-columns:1fr}.nukePromoImage{min-height:270px;order:-1}.nukePromoCopy{padding:24px}.nukePromoCopy h2{font-size:36px}}
      `}</style>
      <div className="bg" />
      <header className="header container">
        <a href="/" className="brand">
          <img src="/BTARust.jpg" alt="BTARust" />
          <div>
            <b>BTARust.net</b>
            <div className="eyebrow">Rust Servers</div>
          </div>
        </a>
        <nav className="nav">
          <a className={initialView === "home" ? "active" : ""} href="/">
            Home
          </a>
          {navigationPages.map((page) => (
            <a className={initialView === page.key ? "active" : ""} href={page.href} key={page.key}>
              {page.title}
            </a>
          ))}
        </nav>
        <div className="actions">
          <div className="badges" style={{ margin: 0, alignItems: 'center' }}>
            <Badge tone={linked.steam ? "green" : "orange"}>{linkStatusLoading ? "Steam: Checking..." : linked.steam ? "Steam Linked" : "Steam not linked"}</Badge>
            <Badge tone={linked.discord ? "green" : "orange"}>{linkStatusLoading ? "Discord: Checking..." : linked.discord ? "Discord Linked" : "Discord not linked"}</Badge>
          </div>
          <a href={tebexStore}><Button outline>Open Store</Button></a>
          <a href={discordInvite}><Button>Join Discord</Button></a>
        </div>
      </header>

      <main id="top">
        {activeMeta && (
          <section className="container pageIntro">
            <p className="eyebrow">{activeMeta[0]}</p>
            <h1 className="h1">{activeMeta[1]}</h1>
            <p className="muted" style={{ maxWidth: 820, marginTop: 18 }}>{activeMeta[2]}</p>
          </section>
        )}

        {initialView === "home" && (
          <>
        <section className="hero container">
          <div>
            <img className="logo" src="/BTARust.jpg" alt="BTARust logo" />
            
            <h1 className="h1">
              Survive, build, raid, and dominate on <span className="orange">BTARust.net</span>
            </h1>
            
            <div className="actions" style={{ marginTop: 30 }}>
              <a href="/servers"><Button>View Servers</Button></a>
              <a href="/account-linking"><Button outline>Link Accounts</Button></a>
            </div>
          </div>

          <Card extra="orangeBorder">
            <p className="eyebrow">Featured Servers</p>
            <h2 className="h2">US 3x, EU 3x & Test</h2>
            <p className="muted">
              Three live BTARust.net servers: monthly 3x QoL/Loot+ gameplay in the US and EU, plus our official US Test server.
            </p>
            <div className="badges" style={{ marginTop: 18 }}>
              <Badge tone="green">Live</Badge>
              <Badge>US</Badge>
              <Badge>EU</Badge>
              <Badge>Test Server</Badge>
            </div>
          </Card>
        </section>

        <section className="container section">
          <div className="nukePromo">
            <div className="nukePromoCopy">
              <div className="radiationMark" aria-hidden="true">☢</div>
              <p className="eyebrow">Cargo Nuke Event • Beta Live</p>
              <h2>Prepare. <strong>Survive.</strong> Recover.</h2>
              <p className="muted">
                Nuclear flyovers now enter the BTA Event Cycle with bomber escorts, SAM interception, randomized strike outcomes, fallout zones, rescue objectives, and decontamination recovery.
              </p>
              <div className="hazardLine" aria-hidden="true" />
              <div className="actions">
                <a href="/events"><Button>View Nuke Event Intel</Button></a>
                <a href="/servers"><Button outline>Choose a Server</Button></a>
              </div>
            </div>
            <div className="nukePromoImage" role="img" aria-label="BTA Cargo Nuke bomber flying over an apocalyptic Rust landscape" />
          </div>
        </section>

        <section className="container section"><Countdown /></section>

        <section className="container section">
          <div className="sectionHead">
            <div>
              <p className="eyebrow">Explore BTARust.net</p>
              <h2 className="h2">Six focused player guides</h2>
            </div>
            <p className="muted">Open a dedicated page for the information you need.</p>
          </div>
          <div className="grid routeGrid">
            {navigationPages.map((page) => (
              <a className="routeCard" href={page.href} key={page.key}>
                <Card extra="orangeBorder">
                  <div className="kitIcon">{page.icon}</div>
                  <h3 className="kitTitle">{page.title}</h3>
                  <p className="muted">{page.desc}</p>
                </Card>
              </a>
            ))}
          </div>
        </section>
          </>
        )}

        {initialView === "servers" && (
        <section id="servers" className="container section">
          <div className="sectionHead">
            <div>
              <p className="eyebrow">Server Lineup</p>
              <h2 className="h2">Choose your battlefield</h2>
            </div>
            <p className="muted">Choose US or EU 3x monthly gameplay, or follow upcoming BTA changes on the US Test server.</p>
          </div>

          <div className="grid grid3">
            {servers.map((server) => {
              const live = serverStatus[server.id] || {};
              const isOnline = live.status === "online";
              const statusLabel = live.status
                ? live.status.charAt(0).toUpperCase() + live.status.slice(1)
                : "Checking...";
              const mapUrl = live.mapUrl || server.mapUrl;

              return (
                <Card key={server.id} extra="orangeBorder">
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:10,flexWrap:'wrap'}}>
                    <Badge tone={isOnline ? "green" : "orange"}>{statusLabel}</Badge>
                    <Badge>{server.region}</Badge>
                  </div>

                  <h3 className="kitTitle">{server.name}</h3>
                  <div className="badges">
                    <Badge>{server.rate}</Badge>
                    <Badge>QoL/Loot+</Badge>
                    <Badge>No Team Limit</Badge>
                    <Badge>{server.wipe}</Badge>
                  </div>
                  <p className="muted">{server.description}</p>

                  <div className="muted" style={{display:'grid',gap:6,marginTop:16,fontWeight:700}}>
                    <span>Players: {live.players ?? "—"} / {live.maxPlayers ?? "—"}</span>
                    <span>Game: {server.ip}:{server.port}</span>
                    <span>Query: {server.ip}:{server.queryPort}</span>
                    <span>Map: {live.map || server.map}</span>
                  </div>

                  <div className="actions" style={{marginTop:18}}>
                    <a href={server.connect}><Button>Connect to Server</Button></a>
                    <a href={mapUrl} target="_blank" rel="noreferrer"><Button outline>View Map</Button></a>
                    {server.battleMetricsUrl && (
                      <a href={server.battleMetricsUrl} target="_blank" rel="noreferrer">
                        <Button outline>BattleMetrics</Button>
                      </a>
                    )}
                  </div>

                  <div className="muted" style={{marginTop:14,fontWeight:700}}>
                    F1 fallback: connect {server.client}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
        )}

        {initialView === "rules" && (
        <section id="rules" className="container section">
          <Card>
            <p className="eyebrow">Server Rules</p>
            <h2 className="h2">Simple rules. Better wipes.</h2>
            <div className="grid rules" style={{ marginTop: 24 }}>
              {rules.map((rule) => <div className="rule" key={rule}>🛡️ {rule}</div>)}
            </div>
          </Card>
        </section>
        )}

        {initialView === "account-linking" && (
        <section id="linking" className="container section">
          <Card extra="orangeBorder">
            <p className="eyebrow">Account Linking</p>
            <h2 className="h2">Linked Account Status</h2>
            <p className="muted">Connect Steam and Discord so purchases, kits, VIP rewards, cooldowns, and Discord permissions sync to the correct Rust profile.</p>
            {linkMessage && <p className="badge orange" role="status" style={{ marginTop: 14 }}>{linkMessage}</p>}

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
              <Button
                onClick={unlinkAllAccounts}
                outline
              >
                ❌ Unlink All Accounts
              </Button>
            </div>
          </Card>
        </section>
        )}

        {initialView === "lifetime-kits" && (
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
                <Button outline onClick={() => openKit(kit.detailsKey || kit.title)}>👀 View Kit</Button>
              </Card>
            ))}
          </div>

          <div className="boosterCallout">
            <Card>
              <div className="kitIcon">{discordBoosterKit.icon}</div>
              <p className="eyebrow" style={{ marginTop: 18 }}>Earned Discord Perk — Not a Free Kit</p>
              <h3 className="kitTitle">{discordBoosterKit.title}</h3>
              <div className="badges">{discordBoosterKit.badges.map((badge) => <Badge key={badge}>{badge}</Badge>)}</div>
              <p className="muted">{discordBoosterKit.desc}</p>
              <div className="actions">
                <a href={discordInvite} target="_blank" rel="noreferrer"><Button>Boost BTARust.net Discord</Button></a>
                <Button outline onClick={() => openKit(discordBoosterKit.title)}>View Booster Kit</Button>
              </div>
            </Card>
          </div>

          <p className="eyebrow" style={{ marginTop: 48 }}>Lifetime Packages</p>
          <h2 className="h2">Permanent access and lifetime bundles</h2>
          <p className="muted" style={{ marginTop: 12, marginBottom: 0 }}>
            Lifetime packages are usable across all BTARust.net servers and match the current Tebex lifetime package setup.
          </p>
          <div className="grid grid3" style={{ marginTop: 24 }}>
            {lifetimeKits.map((kit) => (
              <Card key={kit.title} extra="orangeBorder">
                <div className="kitIcon">{kit.icon}</div>
                <h3 className="kitTitle">{kit.title}</h3>
                <div className="kitPrice">☢ {kit.price}</div>
                <div className="badges">
                  <Badge>{kit.cooldown} Cooldown</Badge>
                  {kit.backpack && <Badge>{kit.backpack}</Badge>}
                  <Badge tone="green">{kit.bundle}</Badge>
                  {kit.rewards && <Badge tone="orange">{kit.rewards}</Badge>}
                  <Badge>Steam Linked</Badge>
                  <Badge>Discord Linked</Badge>
                </div>
                <p className="muted">{getKitDetails(kit.detailsKey || kit.title)?.desc || "Lifetime rewards synced to your linked Rust account."}</p>
                <div className="actions">
                  <a href={getPackageUrl(kit)} target="_blank" rel="noreferrer"><Button>🛒 Buy on Tebex</Button></a>
                  <Button outline onClick={() => openKit(kit.detailsKey || kit.title)}>👑 View Lifetime Kit</Button>
                </div>
              </Card>
            ))}
          </div>

          <p className="eyebrow" style={{ marginTop: 48 }}>Build Your Own Lifetime Bundle</p>
          <h2 className="h2">Choose only the lifetime kits you want</h2>
          <p className="muted" style={{ marginTop: 12, marginBottom: 0 }}>
            Mix and match lifetime kit options from Tebex. These are kit-focused lifetime options and cooldowns are 24 hours.
          </p>
          <div className="grid grid3" style={{ marginTop: 24 }}>
            {buildYourOwnLifetimeKits.map((kit) => (
              <Card key={kit.title} extra="orangeBorder">
                <div className="kitIcon">{kit.icon}</div>
                <h3 className="kitTitle">{kit.title}</h3>
                <div className="kitPrice">☢ {kit.price}</div>
                <div className="badges">
                  <Badge>{kit.cooldown} Cooldown</Badge>
                  {kit.backpack && <Badge>{kit.backpack}</Badge>}
                  {kit.rewards && <Badge tone="orange">{kit.rewards}</Badge>}
                  <Badge>Steam Linked</Badge>
                  <Badge>Discord Linked</Badge>
                </div>
                <p className="muted">{kitDetails[kit.detailsKey || kit.title]?.desc || "Lifetime kit option synced to your linked Rust account."}</p>
                <div className="actions">
                  <a href={getPackageUrl(kit)} target="_blank" rel="noreferrer"><Button>🛒 Buy on Tebex</Button></a>
                  <Button outline onClick={() => openKit(kit.detailsKey || kit.title)}>👀 View Kit</Button>
                </div>
              </Card>
            ))}
          </div>
        </section>
        )}

        {initialView === "events" && (
          <>
            <section className="container section" style={{ paddingTop: 28 }}>
              <div className="eventWarning">
                <p className="eyebrow">Open PvP Everywhere</p>
                <h2 className="h2">Every custom and native event is contested</h2>
                <p className="muted" style={{ marginBottom: 0 }}>
                  Counter-players can, could, and will show up at any moment. This applies to every BTA custom event, every native Rust event, Cargo Plane Crash, and every Raidable Base. Come prepared to fight for the objective and your way home.
                </p>
              </div>
            </section>

            <section className="container section">
              <div className="sectionHead">
                <div>
                  <p className="eyebrow">Watch on BTARust.net</p>
                  <h2 className="h2">Custom event previews</h2>
                </div>
                <p className="muted">Play every video directly here without leaving the website.</p>
              </div>
              <div className="videoGrid">
                {eventVideos.map((event) => (
                  <article className="videoCard" key={event.id}>
                    <div className="videoFrame">
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${event.id}?rel=0`}
                        title={`${event.title} event video`}
                        loading="lazy"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      />
                    </div>
                    <div className="videoCopy">
                      <p className="eyebrow">BTA Event</p>
                      <h3>{event.title}</h3>
                      <p className="muted" style={{ marginBottom: 0 }}>{event.desc}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="container section">
              <div className="sectionHead">
                <div>
                  <p className="eyebrow">More BTA Encounters</p>
                  <h2 className="h2">Cargo Plane Crash & Raidable Bases</h2>
                </div>
                <p className="muted">High-value objectives designed to pull players together—and into conflict.</p>
              </div>
              <div className="eventFeatureGrid">
                <article className="eventFeature">
                  <div className="eventPhotoPair">
                    <img src="/events/cargo-plane-crash.png" alt="Burning Cargo Plane Crash event aircraft" loading="lazy" decoding="async" />
                    <img src="/events/cargo-plane-explosion.png" alt="Cargo Plane Crash event explosion with airborne loot" loading="lazy" decoding="async" />
                  </div>
                  <div className="eventFeatureCopy">
                    <p className="eyebrow">Custom World Event</p>
                    <h2 className="kitTitle" style={{ marginTop: 8 }}>Cargo Plane Crash</h2>
                    <p className="muted">A cargo aircraft goes down in a violent crash, scattering a dangerous objective and valuable loot into an open-PvP fight.</p>
                  </div>
                </article>

                <article className="eventFeature">
                  <img src="/events/raidable-bases.png" alt="Raidable Bases open PvP combat illustration" loading="lazy" decoding="async" />
                  <div className="eventFeatureCopy">
                    <p className="eyebrow">200+ Randomized Bases</p>
                    <h2 className="kitTitle" style={{ marginTop: 8 }}>Raidable Bases</h2>
                    <p className="muted">BTARust.net features more than 200 randomized Raidable Bases. Layouts, defenses, and encounters vary, but the PvP risk never does—counters may arrive at any time.</p>
                  </div>
                </article>
              </div>
            </section>
          </>
        )}

        {initialView === "info" && (
          <>
            <section className="container section">
              <div className="grid grid3">
                {qolGroups.map((group) => (
                  <Card key={group.title} extra="orangeBorder">
                    <h2 className="kitTitle" style={{ marginTop: 0 }}>{group.title}</h2>
                    <ul className="infoList">
                      {group.items.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </Card>
                ))}
              </div>
            </section>

            <section className="container section">
              <div className="sectionHead">
                <div>
                  <p className="eyebrow">In-Game Commands</p>
                  <h2 className="h2">Quick command reference</h2>
                </div>
                <p className="muted">Commands and availability may vary by server type and active permissions.</p>
              </div>
              <div className="grid grid4">
                {commandGroups.map((group) => (
                  <Card key={group.title}>
                    <h3 className="kitTitle" style={{ marginTop: 0 }}>{group.title}</h3>
                    <div className="commandList">
                      {group.commands.map((command) => <div className="commandLine" key={command}>{command}</div>)}
                    </div>
                  </Card>
                ))}
              </div>
            </section>

            <section className="container section">
              <div className="grid grid3">
                <Card extra="orangeBorder">
                  <p className="eyebrow">Vehicles, Backpacks & Limits</p>
                  <h2 className="kitTitle">Rank reference</h2>
                  <ul className="infoList">
                    {rankReference.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </Card>
                <Card>
                  <p className="eyebrow">Economy & Rewards</p>
                  <h2 className="kitTitle">Progression systems</h2>
                  <ul className="infoList">
                    {economySystems.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </Card>
                <Card>
                  <p className="eyebrow">Official Links</p>
                  <h2 className="kitTitle">Stay connected</h2>
                  <div className="commandList">
                    <a className="commandLine" href="https://www.btarust.net/">Website — btarust.net</a>
                    <a className="commandLine" href={tebexStore} target="_blank" rel="noreferrer">Store — Tebex</a>
                    <a className="commandLine" href={discordInvite} target="_blank" rel="noreferrer">Discord — Join the community</a>
                    <a className="commandLine" href="https://x.com/BTARustOfficial" target="_blank" rel="noreferrer">X / Twitter — @BTARustOfficial</a>
                  </div>
                </Card>
              </div>
            </section>
          </>
        )}

        {initialView === "lifetime-kits" && (
        <section className="container section">
          <Card>
            <p className="eyebrow">Store Disclaimer</p>
            <h2 className="h2">Donation & Refund Policy</h2>
            <div className="muted" style={{display:'grid',gap:'14px'}}><p>All purchases made through the BTARust.net Tebex store are considered voluntary donations supporting server development, hosting, maintenance, custom plugins, moderation, and community operations. By completing a purchase, you acknowledge that you are receiving digital virtual goods, perks, ranks, or access tied exclusively to BTARust.net servers and services.</p><p>Due to the digital nature of in-game items, ranks, permissions, and server-related benefits, all purchases are final and non-refundable unless required by applicable law or approved directly by BTARust.net administration. Chargebacks, fraudulent disputes, payment reversals, or unauthorized transaction claims may result in permanent suspension from all BTARust.net services, including game servers, Discord services, and associated platforms.</p><p>BTARust.net reserves the right to modify, rebalance, remove, wipe, replace, suspend, or discontinue any server feature, kit, rank, item, permission, cooldown, server, or perk at any time without prior notice in order to maintain gameplay balance, server health, security, stability, or community fairness.</p><p>BTARust.net staff members, moderators, developers, owners, affiliates, and partners are not liable for data loss, item loss, server downtime, wipes, plugin failures, exploits, account compromises, gameplay interruptions, third-party outages, or any damages arising from use of BTARust.net services. All services are provided on an “as-is” and “as-available” basis without warranties or guarantees of uninterrupted availability.</p><p>By using BTARust.net services, purchasing store items, or accessing community platforms, you agree to follow all server rules, community guidelines, Facepunch Studios terms of service, Steam terms of service, Discord terms of service, and Tebex policies. Violations may result in suspension or termination of access without refund eligibility.</p><p>BTARust.net may offer a conditional Ban Appeal Reinstatement option for eligible community bans issued exclusively on BTARust.net servers. In order to qualify, the banned player must first submit a formal support ticket and complete a manual ban appeal review through the official BTARust.net Discord server. Appeals are reviewed solely by authorized BTARust.net staff members.</p><p>If a player’s appeal is approved by BTARust.net staff, a private “Unban Me” purchase option may then become available to the approved player through Tebex. The purchase option is only accessible after staff approval and does not bypass the required review process. Purchasing the approved reinstatement option will restore access only to BTARust.net community servers and services approved by staff.</p><p>Cheating bans, EAC bans, Facepunch bans, fraudulent activity, severe harassment, exploit abuse, ban evasion, or repeat offenses may automatically disqualify a player from eligibility. BTARust.net staff reserve full discretion to approve, deny, revoke, or permanently refuse any appeal request for reasons related to community safety, fairness, server integrity, or platform compliance. Any payments associated with approved reinstatement reviews are considered administrative processing fees and are non-refundable once review processing or reinstatement actions begin.</p><p>If you experience payment issues or require assistance, please contact BTARust.net staff through the official Discord server before opening disputes or chargebacks.</p></div>
          </Card>
        </section>
        )}
      </main>

      <footer className="footer">© BTARust.net • Built for Rust players • {siteUrl}</footer>
      <KitModal kit={preview} onClose={() => setPreview(null)} />
    </>
  );
}
