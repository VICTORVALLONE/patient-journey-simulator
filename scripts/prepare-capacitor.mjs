// Capacitor requires an `index.html` entry in webDir. TanStack Start's SPA mode
// emits the client shell as `_shell.html`, so copy it to index.html after build.
import { copyFile, access } from "node:fs/promises";
import { constants } from "node:fs";

const CLIENT_DIR = "dist/client";
const SHELL = `${CLIENT_DIR}/_shell.html`;
const INDEX = `${CLIENT_DIR}/index.html`;

try {
  await access(SHELL, constants.F_OK);
} catch {
  console.error(`[capacitor] ${SHELL} not found — run \`vite build\` first.`);
  process.exit(1);
}

await copyFile(SHELL, INDEX);
console.log(`[capacitor] copied ${SHELL} -> ${INDEX}`);
