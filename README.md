# BTARust.net Complete Updated Build

Included:
- Latest BTARust Kits Preview UI
- Active server-only "Connect to Server" button
- Steam OAuth linking with Steam avatar/name return
- Discord OAuth linking with Discord avatar/name return
- Supabase linked_accounts upsert
- Discord webhook logs for link/unlink events
- Steam/Discord logo fallback until accounts are connected
- Avatar resets back to logos after unlinking

Upload all ZIP contents to the root of your GitHub repo, replacing existing files.

After uploading:
1. In Vercel, confirm DISCORD_MOD_LOG_WEBHOOK_URL is set.
2. Confirm SUPABASE_SERVICE_ROLE_KEY is set.
3. Redeploy with Build Cache OFF.
4. Click Unlink All Accounts once on the site.
5. Re-link Steam and Discord.
6. Check #mod-logs and Supabase.
