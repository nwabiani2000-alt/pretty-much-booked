/**
 * Incident log — append-only JSONL (file when writable) + in-memory ring.
 * Never delete entries during an active incident.
 */

import { appendFileSync, mkdirSync, readFileSync, existsSync } from "fs";
import { join } from "path";

export type IncidentSeverity = "P1" | "P2" | "P3" | "P4";

export type IncidentEntry = {
  id: string;
  at: string;
  severity: IncidentSeverity;
  kind: string;
  message: string;
  meta?: Record<string, unknown>;
};

const memory: IncidentEntry[] = [];
const MAX_MEM = 500;

function dataDir(): string {
  return join(process.cwd(), ".data", "incidents");
}

function logPath(): string {
  return join(dataDir(), "incidents.jsonl");
}

function nextId(): string {
  const d = new Date();
  const y = d.getUTCFullYear();
  const seq = String(memory.length + 1).padStart(3, "0");
  return `INC-${y}-${seq}-${Date.now().toString(36)}`;
}

export function logIncident(
  kind: string,
  message: string,
  severity: IncidentSeverity = "P3",
  meta?: Record<string, unknown>
): IncidentEntry {
  const entry: IncidentEntry = {
    id: nextId(),
    at: new Date().toISOString(),
    severity,
    kind,
    message,
    meta,
  };
  memory.unshift(entry);
  if (memory.length > MAX_MEM) memory.length = MAX_MEM;
  try {
    mkdirSync(dataDir(), { recursive: true });
    appendFileSync(logPath(), JSON.stringify(entry) + "\n", "utf8");
  } catch {
    /* mock-safe: memory only */
  }
  console.warn(`[incident] ${entry.severity} ${kind}: ${message}`, meta ?? "");
  return entry;
}

export function listIncidents(limit = 50): IncidentEntry[] {
  if (memory.length > 0) return memory.slice(0, limit);
  try {
    if (!existsSync(logPath())) return [];
    const lines = readFileSync(logPath(), "utf8")
      .trim()
      .split("\n")
      .filter(Boolean);
    return lines
      .reverse()
      .slice(0, limit)
      .map((l) => JSON.parse(l) as IncidentEntry);
  } catch {
    return [];
  }
}
