# Plan: Restructure miden-turnkey to Match miden-para Structure

## Overview

Restructure `miden-turnkey` from a single-package ESM-only library into a monorepo with:
1. Root `miden-turnkey` package with CJS/ESM/types builds
2. `packages/use-miden-turnkey-react/` - React hook wrapper
3. `packages/create-miden-turnkey-react/` - Vite scaffolding CLI

**Package Manager:** Migrate from pnpm to **yarn 1.22.22** (matching miden-para)

## Target Directory Structure

```
miden-turnkey/
├── src/                              # Core SDK source (unchanged)
│   ├── index.ts
│   ├── midenClient.ts
│   ├── types.ts
│   └── utils.ts
├── packages/
│   ├── use-miden-turnkey-react/      # React hook wrapper
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   └── useTurnkeyMiden.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── tsup.config.ts
│   │   └── README.md
│   └── create-miden-turnkey-react/   # Vite scaffolding CLI
│       ├── bin/
│       │   └── create-miden-turnkey-react.mjs
│       ├── template/
│       │   ├── vite.config.ts
│       │   └── src/
│       │       ├── App.tsx
│       │       └── polyfills.ts
│       ├── package.json
│       └── README.md
├── examples/
│   └── react/                        # Next.js example (existing)
├── scripts/
│   ├── build.mjs                     # esbuild config
│   └── postpack.mjs                  # Post-publish hook
├── dist/
│   ├── cjs/                          # CommonJS build
│   ├── esm/                          # ES Modules build
│   └── types/                        # TypeScript declarations
├── package.json
├── tsconfig.json
└── README.md
```

---

## Phase 0: Migrate from pnpm to yarn

### 0.1 Remove pnpm artifacts
- Delete `pnpm-lock.yaml`
- Update `packageManager` field in package.json to `yarn@1.22.22`

### 0.2 Initialize yarn
- Run `yarn install` to generate `yarn.lock`

---

## Phase 1: Update Root Package Build System

### 1.1 Update root package.json
- Add dual CJS/ESM exports
- Add esbuild and glob as devDependencies
- Add build scripts for esbuild + types
- Add prepack/postpack hooks

**Key exports configuration:**
```json
{
  "exports": {
    ".": {
      "types": "./dist/types/index.d.ts",
      "import": "./dist/esm/index.js",
      "require": "./dist/cjs/index.js"
    }
  }
}
```

### 1.2 Create scripts/build.mjs
- Use esbuild to compile src/** files
- Output both ESM and CJS with appropriate package.json in each

### 1.3 Create scripts/postpack.mjs
- Move generated tarball to build/ directory after npm pack

### 1.4 Update tsconfig.json
- Exclude packages directory from compilation

---

## Phase 2: Create use-miden-turnkey-react Package

### Files to create:
- `packages/use-miden-turnkey-react/package.json` - npm package config with peer deps
- `packages/use-miden-turnkey-react/tsconfig.json` - TypeScript config
- `packages/use-miden-turnkey-react/tsup.config.ts` - Build with tsup (cjs, esm, dts)
- `packages/use-miden-turnkey-react/src/index.ts` - Export hook
- `packages/use-miden-turnkey-react/src/useTurnkeyMiden.ts` - Main hook implementation
- `packages/use-miden-turnkey-react/README.md` - Usage docs

### Hook API:
```typescript
function useTurnkeyMiden(
  nodeUrl: string,
  storageMode?: 'public' | 'private',
  opts?: UseTurnkeyMidenOpts
): {
  client: WebClient | null;
  accountId: string;
  turnkey: TurnkeyContext;
  embeddedWallets: Wallet[];
  nodeUrl: string;
  opts: UseTurnkeyMidenOpts;
}
```

### Peer dependencies:
- `@demox-labs/miden-sdk@^0.12.5`
- `@turnkey/react-wallet-kit@^1.6.2`
- `miden-turnkey@^1.0.0`
- `react@^18.0.0 || ^19.0.0`

---

## Phase 3: Create create-miden-turnkey-react Package

### Files to create:
- `packages/create-miden-turnkey-react/package.json` - CLI package config with bin entry
- `packages/create-miden-turnkey-react/bin/create-miden-turnkey-react.mjs` - CLI entry point
- `packages/create-miden-turnkey-react/template/vite.config.ts` - Vite config with WASM handling
- `packages/create-miden-turnkey-react/template/src/App.tsx` - Starter app with useTurnkeyMiden
- `packages/create-miden-turnkey-react/template/src/polyfills.ts` - Buffer/process globals
- `packages/create-miden-turnkey-react/README.md` - Usage docs

### CLI functionality:
1. Run `npm create vite@latest` with react-ts template
2. Overwrite vite.config.ts with Miden-compatible config
3. Replace App.tsx with TurnkeyProvider + useTurnkeyMiden starter
4. Add polyfills.ts and inject into main.tsx
5. Add all Turnkey/Miden dependencies to package.json
6. Create .npmrc with legacy-peer-deps=true
7. Auto-detect and run package manager

### Usage:
```bash
npm create miden-turnkey-react@latest my-app
```

---

## Phase 4: Migrate examples/react to use miden-turnkey-react

### 4.1 Update examples/react/package.json
- Add `miden-turnkey-react` as dependency
- Keep existing Turnkey dependencies

### 4.2 Update examples/react/hooks/use-miden.ts
- Replace custom hook implementation with `useTurnkeyMiden` from `miden-turnkey-react`
- Simplify the hook to wrap/re-export the package hook

### 4.3 Update components as needed
- Ensure components work with the new hook return type
- The hook API should be compatible, minimal changes expected

---

## Phase 5: Create/Update READMEs

### Root README.md
- Overview of the monorepo
- Links to sub-packages
- Installation and build instructions
- Peer dependencies

### Package READMEs
- Each package gets its own README with install, usage examples, and build instructions

---

## Phase 6: Update .gitignore

Add patterns for:
- `packages/*/node_modules/`
- `packages/*/dist/`
- `build/`
- `*.tgz`

---

## Critical Files to Modify

| File | Action |
|------|--------|
| `/package.json` | Update exports, scripts, add devDependencies, switch to yarn |
| `/tsconfig.json` | Exclude packages directory |
| `/.gitignore` | Add new patterns |
| `/README.md` | Rewrite with monorepo structure |
| `/examples/react/package.json` | Add miden-turnkey-react dependency |
| `/examples/react/hooks/use-miden.ts` | Use useTurnkeyMiden from package |

## Critical Files to Create

| File | Purpose |
|------|---------|
| `/scripts/build.mjs` | esbuild configuration |
| `/scripts/postpack.mjs` | Tarball management |
| `/packages/use-miden-turnkey-react/*` | React hook package |
| `/packages/create-miden-turnkey-react/*` | Vite CLI package |

---

## Verification Plan

1. **Root package build:**
   ```bash
   yarn install
   yarn build
   # Verify dist/cjs/, dist/esm/, dist/types/ exist
   ```

2. **React hook package build:**
   ```bash
   cd packages/use-miden-turnkey-react
   yarn install
   yarn build
   # Verify dist/index.cjs, dist/index.mjs, dist/index.d.ts exist
   ```

3. **CLI package test:**
   ```bash
   node packages/create-miden-turnkey-react/bin/create-miden-turnkey-react.mjs test-app --skip-install
   # Verify test-app/ is created with correct files
   ```

4. **Integration test:**
   ```bash
   cd test-app
   yarn install
   yarn dev
   # Verify app starts and TurnkeyProvider renders
   ```

---

## Notes

- This repo is **Turnkey-only** - no Para integration
- miden-para is used purely as a structural reference
- examples/react will be migrated to use the new `miden-turnkey-react` package
