// Placeholder — regenerate with `npm run types` (wrangler types) after `wrangler login`
// and filling in the real D1 database_id in wrangler.jsonc.
/// <reference types="@cloudflare/workers-types" />

interface Env {
  ROOM_DO: DurableObjectNamespace;
  DB: D1Database;
}
