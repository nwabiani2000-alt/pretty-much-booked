#!/usr/bin/env node
/** Install pre-commit hook that runs secret-scan.mjs */
import { chmodSync, mkdirSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const hookDir = join(process.cwd(), ".git", "hooks");
if (!existsSync(join(process.cwd(), ".git"))) {
  console.warn("install-git-hooks: no .git — skip");
  process.exit(0);
}
mkdirSync(hookDir, { recursive: true });
const hook = join(hookDir, "pre-commit");
const body = `#!/bin/sh
# PMB secret scan (blocks sk_live, passwords, private keys, etc.)
node scripts/secret-scan.mjs || exit 1
`;
writeFileSync(hook, body, "utf8");
chmodSync(hook, 0o755);
console.log("Installed .git/hooks/pre-commit → secret-scan");
