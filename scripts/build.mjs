import * as esbuild from "esbuild";
import { glob } from "glob";
import { writeFileSync } from "fs";
import { join } from "path";

const entryPoints = await glob("src/**/*.ts");

// Build ESM
await esbuild.build({
  entryPoints,
  outdir: "dist/esm",
  bundle: false,
  sourcemap: false,
  minify: false,
  format: "esm",
  platform: "neutral",
  target: "es2020",
});

// Write ESM package.json
writeFileSync(
  join("dist", "esm", "package.json"),
  JSON.stringify({ type: "module" }, null, 2)
);

// Build CJS
await esbuild.build({
  entryPoints,
  outdir: "dist/cjs",
  bundle: false,
  sourcemap: false,
  minify: false,
  format: "cjs",
  platform: "neutral",
  target: "es2020",
});

// Write CJS package.json
writeFileSync(
  join("dist", "cjs", "package.json"),
  JSON.stringify({ type: "commonjs" }, null, 2)
);

console.log("Build complete: dist/esm and dist/cjs");
