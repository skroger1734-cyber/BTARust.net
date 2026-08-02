const { createClient } = require("@supabase/supabase-js");

async function main() {
  const captureId = process.argv[2];
  if (!captureId) {
    throw new Error(
      "Usage: node scripts/cleanup-demo-verification.js CAPTURE_ID",
    );
  }
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.BTA_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.BTA_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase admin environment is missing.");

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: rows, error: selectError } = await supabase
    .from("demo_recordings")
    .select("storage_path")
    .eq("capture_id", captureId);
  if (selectError) throw selectError;

  const storagePaths = [...new Set(rows.map((row) => row.storage_path))];
  if (storagePaths.length) {
    const { error: storageError } = await supabase.storage
      .from("bta-demos")
      .remove(storagePaths);
    if (storageError) throw storageError;
  }
  const { error: deleteError } = await supabase
    .from("demo_recordings")
    .delete()
    .eq("capture_id", captureId);
  if (deleteError) throw deleteError;

  console.log(
    JSON.stringify({
      captureId,
      removedObjects: storagePaths.length,
      removedRows: rows.length,
    }),
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
