// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type { PluginOption } from "vite";

// The TanStack Start preview server plugin (used during SPA prerender) imports
// `dist/server/server.js`, but nitro writes its bundle to `.output/server/` with
// `index.mjs` as the entry. Bridge the two so the prerender step finds a handler.
//
// **Why this matters beyond convenience:** when the bridge fails, prerender does
// not fail loudly — it boots whatever stale `dist/server/server.js` is still on
// disk and emits a `_shell.html` referencing that old build's asset hashes. The
// shell then 404s its own entry chunk and the published SPA never boots. Two
// bugs used to do exactly that: the source path still pointed at the old
// `dist/server/index.mjs` (nitro had moved), and the copy was guarded by
// `!existsSync(dest)`, so it never refreshed even when it did run once.
//
// The bridge is a **shim, not a copy**: `index.mjs` imports `./_libs/*.mjs` by
// relative path, so a lone copied entry resolves nothing and copying the whole
// 5 MB tree races with nitro still writing it. Re-exporting by absolute file URL
// leaves the bundle where it belongs and can never go stale.
function aliasNitroServerEntry(): PluginOption {
  return {
    name: "fisiocare:alias-nitro-server-entry",
    apply: "build",
    enforce: "post",
    closeBundle() {
      const entry =
        [
          resolve(process.cwd(), ".output/server/index.mjs"),
          resolve(process.cwd(), "dist/server/index.mjs"),
        ].find((p) => existsSync(p));
      if (!entry) return;

      // Nitro's Cloudflare preset wraps the entry with `env.ASSETS` checks that
      // crash when the preview/prerender step calls fetch(request) without an
      // env argument, and assigns `req.ip`, which srvx exposes getter-only.
      // Patch both in place — preview-only concerns, no change to the
      // Cloudflare runtime behavior.
      try {
        const patched = readFileSync(entry, "utf8")
          .replace(/if\s*\(\s*env\.ASSETS\s*&&/g, "if (env && env.ASSETS &&")
          .replace(
            /req\.ip\s*=\s*cfReq\.headers\.get\("cf-connecting-ip"\)\s*\|\|\s*void 0;/,
            'try { req.ip = cfReq.headers.get("cf-connecting-ip") || void 0; } catch { /* preview: ip is read-only */ }',
          );
        writeFileSync(entry, patched);
      } catch {
        /* best-effort */
      }

      const dir = resolve(process.cwd(), "dist/server");
      mkdirSync(dir, { recursive: true });
      writeFileSync(
        resolve(dir, "server.js"),
        `// Gerado por vite.config.ts — ponte para o bundle do nitro.\n` +
          `export { default } from ${JSON.stringify(pathToFileURL(entry).href)};\n`,
      );
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
