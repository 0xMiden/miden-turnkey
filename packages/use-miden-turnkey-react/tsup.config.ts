import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: {
    compilerOptions: {
      skipLibCheck: true,
    },
  },
  splitting: false,
  sourcemap: false,
  clean: true,
  external: [
    "react",
    "@demox-labs/miden-sdk",
    "@miden-sdk/miden-turnkey",
    "@turnkey/core",
    "@turnkey/react-wallet-kit",
    "@turnkey/sdk-browser",
  ],
});
