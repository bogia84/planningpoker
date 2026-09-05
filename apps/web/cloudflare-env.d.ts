// Placeholder — regenerate with `npm run cf-typegen` after `wrangler login`
// and filling in the real D1 database_id in wrangler.jsonc.
// Intentionally uses an inline import type (not a triple-slash reference) so this
// doesn't globally override DOM's Request/Response/fetch types used by client code.
interface CloudflareEnv {
  DB: import("@cloudflare/workers-types").D1Database;
  REALTIME_WS_ORIGIN: string;
}
