import { mkdirSync, readdirSync, renameSync, existsSync } from "fs";
import { join } from "path";

const buildDir = "build";

// Create build directory if it doesn't exist
if (!existsSync(buildDir)) {
  mkdirSync(buildDir, { recursive: true });
}

// Find and move tarball to build directory
const files = readdirSync(".");
const tarball = files.find((f) => f.endsWith(".tgz"));

if (tarball) {
  const dest = join(buildDir, tarball);
  renameSync(tarball, dest);
  console.log(`Moved ${tarball} to ${dest}`);
} else {
  console.log("No tarball found to move");
}
