import { cp, mkdir, readdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const dist = resolve(projectRoot, "dist");
const client = resolve(dist, "client");
const server = resolve(dist, "server");
const hosting = resolve(projectRoot, ".openai", "hosting.json");

await rm(client, { recursive: true, force: true });
await rm(server, { recursive: true, force: true });
await mkdir(client, { recursive: true });
await mkdir(server, { recursive: true });

for (const entry of await readdir(dist, { withFileTypes: true })) {
  if (["client", "server", ".openai"].includes(entry.name)) continue;
  await cp(resolve(dist, entry.name), resolve(client, entry.name), { recursive: true });
}

await cp(resolve(projectRoot, "worker", "index.js"), resolve(server, "index.js"));
await mkdir(resolve(dist, ".openai"), { recursive: true });
await cp(hosting, resolve(dist, ".openai", "hosting.json"));
