import { NextResponse } from "next/server";
import {
  processCompletedPayment,
  revokeTransaction,
  verifyTebexSignature
} from "../../_utils/entitlements";
import { getSupabase } from "../../auth/_utils/linking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REVOCATION_EVENTS = new Set([
  "payment.refunded",
  "payment.chargeback",
  "payment.dispute",
  "recurring-payment.ended"
]);

function transactionIdFrom(payload) {
  return String(
    payload?.subject?.transaction?.id ||
      payload?.subject?.transaction?.transaction_id ||
      payload?.subject?.payment?.transaction_id ||
      payload?.subject?.id ||
      ""
  );
}

export async function POST(request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-signature");

  if (!verifyTebexSignature(rawBody, signature)) {
    return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 401 });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (payload?.type === "validation.webhook") {
    return NextResponse.json({ id: payload.id });
  }

  if (!payload?.id || !payload?.type) {
    return NextResponse.json(
      { ok: false, error: "Missing event id or type" },
      { status: 400 }
    );
  }

  const supabase = getSupabase();
  const eventRecord = {
    event_id: String(payload.id),
    event_type: String(payload.type),
    transaction_id: transactionIdFrom(payload) || null,
    status: "processing",
    error: null,
    received_at: new Date().toISOString()
  };

  const { data: existing, error: lookupError } = await supabase
    .from("tebex_webhook_events")
    .select("status")
    .eq("event_id", eventRecord.event_id)
    .maybeSingle();

  if (lookupError) {
    console.error("[tebex] event lookup failed", lookupError);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  if (existing?.status === "processed") {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  const { error: upsertError } = await supabase
    .from("tebex_webhook_events")
    .upsert(eventRecord, { onConflict: "event_id" });

  if (upsertError) {
    console.error("[tebex] event upsert failed", upsertError);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  try {
    let result = { ignored: true };
    if (payload.type === "payment.completed") {
      result = await processCompletedPayment(payload);
    } else if (REVOCATION_EVENTS.has(payload.type)) {
      result = await revokeTransaction(payload);
    }

    const { error: completeError } = await supabase
      .from("tebex_webhook_events")
      .update({
        status: "processed",
        error: null,
        processed_at: new Date().toISOString()
      })
      .eq("event_id", eventRecord.event_id);
    if (completeError) throw completeError;

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    const message = String(error?.message || error).slice(0, 2000);
    console.error("[tebex] webhook processing failed", payload.type, message);
    await supabase
      .from("tebex_webhook_events")
      .update({
        status: "failed",
        error: message,
        processed_at: new Date().toISOString()
      })
      .eq("event_id", eventRecord.event_id);

    // A non-2xx response tells Tebex to retry. Processing is idempotent by event
    // id and entitlement uniqueness, so a transient Discord failure is safe.
    return NextResponse.json({ ok: false, error: "Processing failed" }, { status: 500 });
  }
}
