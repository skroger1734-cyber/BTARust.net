import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function secureEqual(left, right) {
  const leftBuffer = Buffer.from(String(left || ""));
  const rightBuffer = Buffer.from(String(right || ""));
  return (
    leftBuffer.length === rightBuffer.length &&
    crypto.timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function safeSegment(value, fallback = "unknown") {
  const clean = String(value || "")
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return clean || fallback;
}

function adminClient() {
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
    if (
      !secureEqual(
        request.headers.get("x-bta-demo-secret"),
        process.env.BTA_DEMO_INGEST_SECRET
      )
    ) {
      return Response.json({ error: "Unauthorized." }, { status: 401 });
    }
    const { id, storagePath } = await request.json();
    if (
      !/^[0-9a-f-]{36}$/i.test(String(id || "")) ||
      !String(storagePath || "").endsWith(".mp4") ||
      String(storagePath).includes("..") ||
      String(storagePath).length > 700
    ) {
      return Response.json({ error: "Invalid upload request." }, {
        status: 400
      });
    }

    const supabase = adminClient();
    const { data: recording, error: recordingError } = await supabase
      .from("demo_recordings")
      .select(
        "id,capture_id,server_code,started_at,steam_id,file_name,video_status"
      )
      .eq("id", id)
      .single();
    if (recordingError || recording?.video_status !== "rendering") {
      return Response.json({ error: "Render job is not active." }, {
        status: 409
      });
    }

    const started = new Date(recording.started_at);
    const expectedPath = [
      recording.server_code.toLowerCase(),
      String(started.getUTCFullYear()),
      String(started.getUTCMonth() + 1).padStart(2, "0"),
      String(started.getUTCDate()).padStart(2, "0"),
      safeSegment(recording.capture_id),
      safeSegment(recording.steam_id),
      `${safeSegment(recording.file_name.replace(/\.dem$/i, ""))}.mp4`
    ].join("/");
    if (storagePath !== expectedPath) {
      return Response.json({ error: "Upload path did not match the job." }, {
        status: 400
      });
    }

    const { data, error } = await supabase.storage
      .from("bta-demo-videos")
      .createSignedUploadUrl(storagePath, { upsert: true });
    if (error) throw error;
    const {
      data: { publicUrl }
    } = supabase.storage.from("bta-demo-videos").getPublicUrl(storagePath);

    return Response.json({
      token: data.token,
      storagePath,
      publicUrl
    });
  } catch (error) {
    console.error("BTA video upload URL failed:", error.message);
    return Response.json({ error: "Could not authorize the upload." }, {
      status: 500
    });
  }
}
