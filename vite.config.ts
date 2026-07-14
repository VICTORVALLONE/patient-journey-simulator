// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type { PluginOption } from "vite";

// The TanStack Start preview server plugin (used during SPA prerender) imports
// `dist/server/<entry>.js`, but nitro always writes the server bundle as
// `dist/server/index.mjs`. Copy it into place after the server build so the
// prerender step can load the handler.
function aliasNitroServerEntry(): PluginOption {
  return {
    name: "fisiocare:alias-nitro-server-entry",
    apply: "build",
    enforce: "post",
    closeBundle() {
      const dir = resolve(process.cwd(), "dist/server");
      const src = resolve(dir, "index.mjs");
      const dest = resolve(dir, "server.js");
      if (existsSync(src) && !existsSync(dest)) {
        copyFileSync(src, dest);
        // Nitro's Cloudflare preset wraps our entry with `env.ASSETS` checks
        // that crash when the preview/prerender step calls fetch(request)
        // without an env argument. Make the access null-safe so SPA prerender
        // succeeds locally without changing the Cloudflare runtime behavior.
        try {
          let contents = readFileSync(dest, "utf8");
          // 1) Guard against missing `env` (SPA prerender/preview calls fetch
          //    without CF bindings).
          contents = contents.replace(/if\s*\(\s*env\.ASSETS\s*&&/g, "if (env && env.ASSETS &&");
          // 2) The srvx NodeRequest used by the preview server exposes `ip`
          //    as a getter-only property; nitro's Cloudflare adapter tries to
          //    assign it and crashes. Skip the assignment when it's not writable.
          contents = contents.replace(
            /req\.ip\s*=\s*cfReq\.headers\.get\("cf-connecting-ip"\)\s*\|\|\s*void 0;/,
            'try { req.ip = cfReq.headers.get("cf-connecting-ip") || void 0; } catch { /* preview: ip is read-only */ }',
          );
          writeFileSync(dest, contents);
        } catch {
          /* best-effort */
        }
      }
    },
  };
}

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    // SPA mode: emit a static client shell into dist/client so Capacitor can
    // bundle the app into a native WebView (no SSR at runtime on device).
    // "/" throws a redirect, so we mask prerendering on a neutral route that
    // renders cleanly; the client router takes over after boot.
    spa: {
      enabled: true,
      maskPath: "/welcome",
    },
  },
  vite: {
    plugins: [aliasNitroServerEntry()],
  },
});
