# BTARust.net Account Linking Fixed Build

This build fixes:
- Steam avatar/name returning to the website after link
- Discord avatar/name returning to the website after link
- Supabase linked_accounts upsert for Steam and Discord
- Optional Discord mod-log webhook messages for link/unlink events
- Logos show while not linked; account avatars show once linked; logos return after unlink

Required extra Vercel variable for Discord logs:
DISCORD_MOD_LOG_WEBHOOK_URL=

Create this webhook in Discord:
Channel Settings -> Integrations -> Webhooks -> New Webhook -> Copy Webhook URL

After uploading:
1. Redeploy in Vercel with Build Cache OFF.
2. Click Unlink All Accounts once to clear old local browser test data.
3. Link Steam again.
4. Link Discord again.
5. Check Supabase with supabase/check-linked-accounts.sql.
