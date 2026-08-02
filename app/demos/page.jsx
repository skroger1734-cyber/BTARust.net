import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import DemoActions from "./DemoActions";
import styles from "./demos.module.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "BTA Demo Archive",
  description:
    "Download server-side Rust demo captures from BTA event-cycle and Cargo Nuke events.",
  openGraph: {
    title: "BTA Demo Archive",
    description:
      "BTA event-cycle and Cargo Nuke demo captures, cataloged by server and player.",
    url: "https://btarust.net/demos",
    images: [{ url: "/BTA-Cargo-Nuke-Promo.png", width: 1200, height: 630 }]
  }
};

function adminClient() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.BTA_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.BTA_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Demo catalog database is not configured.");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

function displayBytes(value) {
  const bytes = Number(value || 0);
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

function displayDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Phoenix"
  }).format(new Date(value));
}

function safeSearchTerm(value) {
  return String(value || "")
    .trim()
    .slice(0, 80)
    .replace(/[,%()"'\\]/g, " ")
    .replace(/\s+/g, " ");
}

async function loadDemos(server, type, search) {
  let query = adminClient()
    .from("demo_recordings")
    .select(
      "id,capture_id,server_code,event_type,event_name,trigger_source,started_at,ended_at,steam_id,player_name,public_url,file_name,file_size_bytes,sha256,video_status,video_url,video_size_bytes"
    )
    .eq("status", "ready")
    .order("started_at", { ascending: false })
    .limit(250);

  if (server && ["US", "EU", "TEST"].includes(server)) {
    query = query.eq("server_code", server);
  }
  if (type && ["atp_event", "nuke", "manual"].includes(type)) {
    query = query.eq("event_type", type);
  }
  if (search) {
    query = query.or(
      `player_name.ilike.%${search}%,steam_id.ilike.%${search}%`
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export default async function DemoArchive({ searchParams }) {
  const selectedServer = String(searchParams?.server || "").toUpperCase();
  const selectedType = String(searchParams?.type || "").toLowerCase();
  const selectedSearch = safeSearchTerm(searchParams?.q);
  let demos = [];
  let error = "";
  try {
    demos = await loadDemos(selectedServer, selectedType, selectedSearch);
  } catch (catalogError) {
    error = catalogError.message;
  }

  const captures = new Set(demos.map((demo) => demo.capture_id)).size;
  const totalBytes = demos.reduce(
    (sum, demo) => sum + Number(demo.file_size_bytes || 0),
    0
  );
  const serverOrder = ["US", "EU", "TEST"];
  const serverGroups = serverOrder
    .map((serverCode) => {
      const serverDemos = demos.filter(
        (demo) => demo.server_code === serverCode
      );
      const events = Array.from(
        serverDemos.reduce((groups, demo) => {
          if (!groups.has(demo.capture_id)) {
            groups.set(demo.capture_id, []);
          }
          groups.get(demo.capture_id).push(demo);
          return groups;
        }, new Map())
      ).map(([captureId, recordings]) => ({
        captureId,
        recordings
      }));
      return { serverCode, serverDemos, events };
    })
    .filter((group) => group.serverDemos.length > 0);

  return (
    <main className={styles.page}>
      <div className={styles.glow} aria-hidden="true" />
      <header className={styles.header}>
        <a className={styles.brand} href="/">
          <Image
            src="/BTARusticon.png"
            alt="BTA Rust"
            width={56}
            height={56}
            priority
          />
          <span>
            <strong>BTARust.net</strong>
            <small>Demo Archive</small>
          </span>
        </a>
        <a className={styles.backLink} href="/">
          Back to BTA
        </a>
      </header>

      <section className={styles.hero}>
        <p className={styles.eyebrow}>EVENT EVIDENCE · AUTOMATIC ARCHIVE</p>
        <h1>Every event. Every nuke. Saved.</h1>
        <p>
          Server-side Rust demo captures from ATP&apos;s event cycle and every
          Cargo Nuke call across BTA US, EU, and Test.
        </p>
        <div className={styles.stats}>
          <span>
            <strong>{demos.length}</strong>
            demo files
          </span>
          <span>
            <strong>{captures}</strong>
            event captures
          </span>
          <span>
            <strong>{displayBytes(totalBytes)}</strong>
            visible archive
          </span>
        </div>
      </section>

      <form className={styles.filters}>
        <label className={styles.searchField}>
          Player search
          <input
            type="search"
            name="q"
            defaultValue={selectedSearch}
            placeholder="Player name or Steam ID"
            maxLength={80}
          />
        </label>
        <label>
          Server
          <select name="server" defaultValue={selectedServer}>
            <option value="">All servers</option>
            <option value="US">BTA US</option>
            <option value="EU">BTA EU</option>
            <option value="TEST">BTA US 2x Weekly</option>
          </select>
        </label>
        <label>
          Capture type
          <select name="type" defaultValue={selectedType}>
            <option value="">All captures</option>
            <option value="atp_event">ATP event cycle</option>
            <option value="nuke">Cargo Nuke</option>
            <option value="manual">Manual / test</option>
          </select>
        </label>
        <button type="submit">Apply filters</button>
        {(selectedSearch || selectedServer || selectedType) && (
          <a href="/demos">Clear</a>
        )}
      </form>

      <aside className={styles.formatNote}>
        <strong>Rust demo format</strong>
        <span>
          These are playable <code>.dem</code> captures, not rendered MP4
          videos. Download a file and open it with Rust&apos;s demo tools.
        </span>
      </aside>

      {error ? (
        <section className={styles.empty}>
          <strong>The archive is temporarily unavailable.</strong>
          <span>{error}</span>
        </section>
      ) : demos.length === 0 ? (
        <section className={styles.empty}>
          <strong>
            {selectedSearch
              ? `No demos found for “${selectedSearch}”.`
              : "No completed demos yet."}
          </strong>
          <span>
            {selectedSearch
              ? "Try another player name or the full 17-digit Steam ID."
              : "The next ATP event or Cargo Nuke call will appear here automatically after recording finishes."}
          </span>
        </section>
      ) : (
        <section className={styles.archive}>
          {serverGroups.map(({ serverCode, serverDemos, events }) => (
            <section className={styles.serverGroup} key={serverCode}>
              <header className={styles.serverHeader}>
                <div>
                  <span>SERVER</span>
                  <h2>BTA {serverCode}</h2>
                </div>
                <span>
                  {events.length} {events.length === 1 ? "event" : "events"} ·{" "}
                  {serverDemos.length}{" "}
                  {serverDemos.length === 1 ? "demo" : "demos"}
                </span>
              </header>

              {events.map(({ captureId, recordings }) => {
                const event = recordings[0];
                return (
                  <section className={styles.eventGroup} key={captureId}>
                    <header className={styles.eventHeader}>
                      <div>
                        <span
                          className={`${styles.badge} ${
                            event.event_type === "nuke" ? styles.nuke : ""
                          }`}
                        >
                          {event.event_type === "nuke"
                            ? "CARGO NUKE"
                            : "ATP EVENT"}
                        </span>
                        <h3>{event.event_name}</h3>
                      </div>
                      <div className={styles.eventMeta}>
                        <span>{displayDate(event.started_at)} MST</span>
                        <code>{captureId}</code>
                      </div>
                    </header>

                    <div className={styles.grid}>
                      {recordings.map((demo) => (
                        <article className={styles.card} key={demo.id}>
                          <div className={styles.cardTop}>
                            <span className={styles.fileLabel}>
                              PLAYER DEMO
                            </span>
                            <span className={styles.server}>
                              {demo.server_code}
                            </span>
                          </div>
                          <h2>{demo.player_name || "Unknown player"}</h2>
                          <p className={styles.player}>
                            <span>Steam ID</span>
                            <code>{demo.steam_id || "Unknown"}</code>
                          </p>
                          <dl>
                            <div>
                              <dt>Recorded</dt>
                              <dd>{displayDate(demo.started_at)} MST</dd>
                            </div>
                            <div>
                              <dt>Demo file</dt>
                              <dd>{displayBytes(demo.file_size_bytes)}</dd>
                            </div>
                            <div>
                              <dt>MP4</dt>
                              <dd>
                                {demo.video_status === "ready"
                                  ? displayBytes(demo.video_size_bytes)
                                  : demo.video_status === "rendering"
                                    ? "Rendering"
                                    : "Queued"}
                              </dd>
                            </div>
                          </dl>
                          {demo.video_status === "ready" && demo.video_url ? (
                            <video
                              className={styles.video}
                              controls
                              preload="metadata"
                            >
                              <source src={demo.video_url} type="video/mp4" />
                              Your browser does not support MP4 playback.
                            </video>
                          ) : (
                            <p className={styles.renderStatus}>
                              MP4 conversion{" "}
                              {demo.video_status === "rendering"
                                ? "is in progress."
                                : "is queued."}
                            </p>
                          )}
                          <a
                            className={styles.download}
                            href={demo.public_url}
                            download={demo.file_name}
                          >
                            Download {demo.file_name}
                          </a>
                          {demo.video_status === "ready" && demo.video_url ? (
                            <>
                              <a
                                className={styles.videoDownload}
                                href={demo.video_url}
                                download
                              >
                                Download MP4
                              </a>
                              <DemoActions
                                videoUrl={demo.video_url}
                                videoSize={demo.video_size_bytes}
                                playerName={demo.player_name}
                                eventName={demo.event_name}
                              />
                            </>
                          ) : null}
                        </article>
                      ))}
                    </div>
                  </section>
                );
              })}
            </section>
          ))}
        </section>
      )}
    </main>
  );
}
