import { readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";
import { join } from "path";

const pkgPath = join(import.meta.dirname, "..", "package.json");
const original = readFileSync(pkgPath, "utf-8");
const pkg = JSON.parse(original);

// Strip workspace-only fields before publishing
delete pkg.private;
delete pkg.workspaces;

try {
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  const args = process.argv.slice(2).join(" ");
  execSync(`npm publish ${args}`, { stdio: "inherit", cwd: join(import.meta.dirname, "..") });
} finally {
  // Always restore original package.json
  writeFileSync(pkgPath, original);
}
