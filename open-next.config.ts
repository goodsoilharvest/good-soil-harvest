// open-next.config.ts — Cloudflare Workers adapter for Next.js
// See https://opennext.js.org/cloudflare for full options.
//
// Phase 1: defaults only. We can wire R2 incremental cache + Workers KV
// in Phase 3 when image storage moves off Vercel Blob.

import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({});
