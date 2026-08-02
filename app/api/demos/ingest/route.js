import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_DEMO_BYTES = 4 * 1024 * 1024;
const SERVER_CODES = new Set(["US", "EU", "TEST"]);
const EVENT_TYPES = new Set(["atp_event", "nuke", "manual"]);

function secureEqual(left, right) {
  const leftBuffer = Buffer.from(String(left || ""));
  const rightBuffer = Buffer.from(String(right || ""));
  return (
    leftBuffer.length === rightBuffer.length &&
    crypto.timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function safeSegment(value, fallback) {
  const clean = String(value || "")
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return clean || fallback;
}

function parseMetadata(request) {
  const encoded = request.headers.get("x-bta-demo-metadata");
  if (!encoded || encoded.length > 12_000) {
    throw new Error("Missing or oversized demo metadata.");
  }
  const metadata = JSON.parse(Buffer.from(encoded, "base64").toString("utf8"));
  const serverCode = String(metadata.server_code || "").toUpperCase();
  const eventType = String(metadata.event_type || "").toLowerCase();
  const captureId = safeSegment(metadata.capture_id, "");
  const fileName = safeSegment(metadata.file_name, "");
  if (!SERVER_CODES.has(serverCode)) throw new Error("Invalid server code.");
  if (!EVENT_TYPES.has(eventType)) throw new Error("Invalid event type.");
  if (!captureId) throw new Error("Invalid capture ID.");
  if (!fileName.toLowerCase().endsWith(".dem")) {
    throw new Error("Only Rust .dem files are accepted.");
  }
  const startedAt = new Date(metadata.started_at);
  const endedAt = new Date(metadata.ended_at);
  if (
    Number.isNaN(startedAt.getTime()) ||
    Number.isNaN(endedAt.getTime())
  ) {
    throw new Error("Invalid capture timestamps.");
  }
  return {
    ...metadata,
    server_code: serverCode,
    event_type: eventType,
    capture_id: captureId,
    file_name: fileName,
    started_at: startedAt.toISOString(),
    ended_at: endedAt.toISOString()
  };
}

function supabaseAdmin() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.BTA_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.BTA_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase is not configured.");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

export async function POST(request) {
  try {
    const configuredSecret = process.env.BTA_DEMO_INGEST_SECRET;
    const providedSecret = request.headers.get("x-bta-demo-secret");
    if (
      !configuredSecret ||
      !providedSecret ||
      !secureEqual(providedSecret, configuredSecret)
    ) {
      return Response.json({ error: "Unauthorized." }, { status: 401 });
    }

    const metadata = parseMetadata(request);
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength <= 0 || contentLength > MAX_DEMO_BYTES) {
      return Response.json(
        { error: "Demo file must be between 1 byte and 4 MB." },
        { status: 413 }
      );
    }

    const body = Buffer.from(await request.arrayBuffer());
    if (body.length !== contentLength || body.length > MAX_DEMO_BYTES) {
      return Response.json(
        { error: "Demo upload size did not match its declared length." },
        { status: 400 }
      );
    }

    const startedAt = new Date(metadata.started_at);
    const sha256 = crypto.createHash("sha256").update(body).digest("hex");
    const storagePath = [
      metadata.server_code.toLowerCase(),
      String(startedAt.getUTCFullYear()),
      String(startedAt.getUTCMonth() + 1).padStart(2, "0"),
      String(startedAt.getUTCDate()).padStart(2, "0"),
      metadata.capture_id,
      safeSegment(metadata.steam_id, `unknown-${sha256.slice(0, 12)}`),
      metadata.file_name
    ].join("/");
    if (metadata.sha256 && metadata.sha256 !== sha256) {
      return Response.json(
        { error: "Demo checksum verification failed." },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin();
    const { error: uploadError } = await supabase.storage
      .from("bta-demos")
      .upload(storagePath, body, {
        contentType: "application/octet-stream",
        cacheControl: "3600",
        upsert: true
      });
    if (uploadError) throw uploadError;

    const {
      data: { publicUrl }
    } = supabase.storage.from("bta-demos").getPublicUrl(storagePath);

    const row = {
      capture_id: metadata.capture_id,
      server_code: metadata.server_code,
      event_type: metadata.event_type,
      event_name: String(metadata.event_name || "BTA Event").slice(0, 240),
      trigger_source: String(metadata.trigger_source || "unknown").slice(
        0,
        500
      ),
      started_at: metadata.started_at,
      ended_at: metadata.ended_at,
      steam_id: metadata.steam_id
        ? String(metadata.steam_id).slice(0, 32)
        : null,
      player_name: metadata.player_name
        ? String(metadata.player_name).slice(0, 128)
        : null,
      storage_path: storagePath,
      public_url: publicUrl,
      file_name: metadata.file_name,
      file_size_bytes: body.length,
      sha256,
      status: "ready",
      metadata:
        metadata.metadata && typeof metadata.metadata === "object"
          ? metadata.metadata
          : {}
    };
    const { error: catalogError } = await supabase
      .from("demo_recordings")
      .upsert(row, { onConflict: "storage_path" });
    if (catalogError) throw catalogError;

    return Response.json({ publicUrl, storagePath });
  } catch (error) {
    console.error("BTA demo ingest failed:", error.message);
    return Response.json(
      { error: "The demo could not be ingested." },
      { status: 500 }
    );
  }
}
