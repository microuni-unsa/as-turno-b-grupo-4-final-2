#!/usr/bin/env bun
/**
 * Prunes stale omp session/memory state inside the agent container.
 * - Deletes sessions/--app--/* older than --days (default 7), keeping explicitly
 *   pinned IDs (--keep <id-prefix>, repeatable).
 * - Wipes memories/--app-- (daemon re-derives from fresh sessions; seed re-applied
 *   by entrypoint when missing/stale).
 * - Asserts no stale markers remain (default: "filtrar solo G4-", "filtro G4-").
 *
 * Usage: docker compose exec agent bun scripts/prune-omp-state.ts [--days 7] [--keep <id>] [--apply]
 * Default is dry-run; --apply performs deletions.
 */
import { readdirSync, rmSync, readFileSync, existsSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const AGENT_DIR = join(homedir(), ".omp", "agent");
const SESSIONS_DIR = join(AGENT_DIR, "sessions", "--app--");
const MEMORIES_DIR = join(AGENT_DIR, "memories", "--app--");
const STALE_MARKERS = ["filtrar solo G4-", "filtro G4-", "filtrar/escribir solo G4-"];

interface Args {
  days: number;
  keep: string[];
  apply: boolean;
}

function parseArgs(argv: string[]): Args {
  const args: Args = { days: 7, keep: [], apply: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--days" && i + 1 < argv.length) {
      args.days = Number(argv[++i]);
      if (!Number.isInteger(args.days) || args.days < 0) {
        console.error("error: --days must be a non-negative integer");
        process.exit(2);
      }
    } else if (a === "--keep" && i + 1 < argv.length) {
      args.keep.push(argv[++i]);
    } else if (a === "--apply") {
      args.apply = true;
    } else if (a === "--help" || a === "-h") {
      console.log(
        "Usage: bun scripts/prune-omp-state.ts [--days 7] [--keep <id-prefix>] [--apply]\n" +
          "Dry-run by default; --apply performs deletions.",
      );
      process.exit(0);
    } else {
      console.error(`error: unknown argument '${a}'`);
      process.exit(2);
    }
  }
  return args;
}

function isPinned(name: string, keep: string[]): boolean {
  return keep.some((k) => name.includes(k));
}

function findStaleMarkers(root: string, markers: string[]): string[] {
  const hits: string[] = [];
  if (!existsSync(root)) return hits;
  for (const entry of readdirSync(root, { withFileTypes: true, recursive: true })) {
    if (!entry.isFile()) continue;
    const p = join(entry.parentPath, entry.name);
    let content: string;
    try {
      content = readFileSync(p, "utf8");
    } catch {
      continue;
    }
    for (const m of markers) {
      if (content.includes(m)) {
        hits.push(`${p}: ${m}`);
        break;
      }
    }
  }
  return hits;
}

const args = parseArgs(Bun.argv.slice(2));
const cutoff = Date.now() - args.days * 24 * 60 * 60 * 1000;

let prunedSessions = 0;
let keptSessions = 0;
if (existsSync(SESSIONS_DIR)) {
  for (const name of readdirSync(SESSIONS_DIR)) {
    const p = join(SESSIONS_DIR, name);
    const mtime = statSync(p).mtimeMs;
    if (mtime >= cutoff || isPinned(name, args.keep)) {
      keptSessions++;
      continue;
    }
    console.log(`${args.apply ? "prune" : "would-prune"} session: ${name}`);
    if (args.apply) rmSync(p, { recursive: true, force: true });
    prunedSessions++;
  }
} else {
  console.log(`sessions dir missing (nothing to prune): ${SESSIONS_DIR}`);
}

if (existsSync(MEMORIES_DIR)) {
  console.log(`${args.apply ? "wipe" : "would-wipe"} memories: ${MEMORIES_DIR}`);
  if (args.apply) rmSync(MEMORIES_DIR, { recursive: true, force: true });
} else {
  console.log(`memories dir missing (already clean): ${MEMORIES_DIR}`);
}

if (args.apply) {
  const hits = [...findStaleMarkers(SESSIONS_DIR, STALE_MARKERS)];
  if (hits.length > 0) {
    console.error("STALE MARKERS REMAIN:");
    for (const h of hits) console.error(`  ${h}`);
    process.exit(1);
  }
  console.log("stale-marker assert: clean");
}

console.log(
  `done (${args.apply ? "applied" : "dry-run"}): ${prunedSessions} sessions pruned, ${keptSessions} kept.`,
);
