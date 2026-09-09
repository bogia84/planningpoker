// Hand-written — do NOT run `wrangler types` to regenerate this file. That command
// bundles Cloudflare's full runtime type declarations globally, which collides with
// @opennextjs/cloudflare's own reliance on the plain @cloudflare/workers-types package
// (duplicate, incompatible global Headers/R2Bucket/etc. declarations).
// Intentionally uses an inline import type (not a triple-slash reference) so this
// doesn't globally override DOM's Request/Response/fetch types used by client code.
interface CloudflareEnv {
  ROOMS_BUCKET: import("@cloudflare/workers-types").R2Bucket;
  ADMIN_SECRET: string;
}
