import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: false,
  clean: true,
  external: [
    "react",
    "@demox-labs/miden-sdk",
    "@turnkey/react-wallet-kit",
    "@miden-sdk/miden-turnkey",
  ],
});
