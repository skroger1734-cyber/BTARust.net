# BTARust.net Working Replacement Build

This build includes:
- Current BTARust Kits Preview UI
- Active server-only Connect to Server button
- Active server-only View Map button
- BattleMetrics button
- Steam/Discord logo fallback until linked
- Steam/Discord account avatar after linking
- Supabase linked_accounts saving
- Discord mod-log webhook embeds for link and unlink events
- Debug endpoint for webhook testing

After upload:
1. Replace all files in GitHub with this ZIP contents.
2. Redeploy Vercel with Build Cache OFF.
3. Confirm DISCORD_MOD_LOG_WEBHOOK_URL is in Production and Preview.
4. Test webhook:
   https://btarust.net/api/debug/webhook-test?key=YOUR_JWT_SECRET
5. If the webhook test works, unlink all accounts and relink Steam/Discord.

If no Discord log appears:
- Open Vercel Function Logs for /api/auth/discord/callback or /api/debug/webhook-test.
- Search for "[webhook] failed" or "DISCORD_MOD_LOG_WEBHOOK_URL missing".
