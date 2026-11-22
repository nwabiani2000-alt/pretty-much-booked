#!/usr/bin/env node
/**
 * Pre-commit secret scan (git-secrets style, no external binary).
 * Blocks sk_live, service_role-ish keys, password assignments, private keys.
 *
 * Usage:
 *   node scripts/secret-scan.mjs           # scan staged files
 *   node scripts/secret-scan.mjs --all     # scan tracked files
 */

import { execSync } from "child_process";
import { readFileSync, existsSync } from "fs";

const PATTERNS = [
  {
    name: "stripe_sk_live",
    re: /\bsk_live_[0-9a-zA-Z]{16,}\b/,
  },
  {
    name: "stripe_rk_live",
    re: /\brk_live_[0-9a-zA-Z]{16,}\b/,
  },
  {
    name: "stripe_sk_test_committed",
    re: /\bsk_test_[0-9a-zA-Z]{20,}\b/,
  },
  {
    name: "aws_access_key",
    re: /\bAKIA[0-9A-Z]{16}\b/,
  },
  {
    name: "generic_secret_assignment",
    // Word-boundary so ADMIN_DEMO_SECRET / getAdminSecret do not false-positive.
    re: /\b(?:password|passwd|api[_-]?key)\s*[=:]\s*['"][^'"]{8,}['"]/i,
  },
  {
    name: "literal_secret_assignment",
    re: /\bsecret\s*[=:]\s*['"][^'"]{8,}['"]/i,
  },
  {
    name: "supabase_service_role",
    // Must have a non-empty value (not .env.example blanks)
    re: /SERVICE_ROLE_KEY\s*=\s*['"]?[A-Za-z0-9._-]{20,}/,
  },
  {
    name: "private_key_block",
    re: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  },
  {
    name: "github_pat",
    re: /\bghp_[A-Za-z0-9]{20,}\b/,
  },
];

const SKIP =
  /(^|\/)(package-lock\.json|yarn\.lock|\.png$|\.webp$|\.woff2?$|\.ico$|secret-scan\.mjs$|\.md$)/i;

function listFiles(all) {
  try {
    const cmd = all
      ? "git ls-files"
      : "git diff --cached --name-only --diff-filter=ACMR";
    return execSync(cmd, { encoding: "utf8" })
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

const all = process.argv.includes("--all");
const files = listFiles(all).filter((f) => !SKIP.test(f));
let hits = 0;

for (const file of files) {
  if (!existsSync(file)) continue;
  let text;
  try {
    text = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  // Skip binary-ish
  if (text.includes("\u0000")) continue;

  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Allow placeholders in .env.example
    if (file.endsWith(".env.example") && /=\s*$/.test(line)) continue;
    if (file.endsWith(".env.example") && /=$/.test(line.trim())) continue;
    for (const p of PATTERNS) {
      if (p.re.test(line)) {
        console.error(
          `[secret-scan] BLOCKED ${p.name} in ${file}:${i + 1}`
        );
        hits += 1;
      }
    }
  }
}

if (hits > 0) {
  console.error(
    `\nsecret-scan: ${hits} finding(s). Remove secrets before commit.`
  );
  process.exit(1);
}

console.log(`secret-scan: ok (${files.length} file(s))`);
