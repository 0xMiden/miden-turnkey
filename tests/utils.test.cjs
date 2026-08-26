const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('module');
const ts = require('typescript');

/** Transpiles src/utils.ts and loads it with the given module mocks. */
const loadUtils = (mocks = {}) => {
  const originalLoad = Module._load;
  Module._load = function patchedLoad(request, parent, isMain) {
    if (mocks[request]) return mocks[request];
    if (request.startsWith('@miden-sdk/miden-sdk')) {
      return mocks['@miden-sdk/miden-sdk'];
    }
    return originalLoad.apply(this, [request, parent, isMain]);
  };

  try {
    const filePath = path.resolve(__dirname, '../src/utils.ts');
    const source = fs.readFileSync(filePath, 'utf8');
    const { outputText } = ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
      },
      fileName: filePath,
    });

    const compiledModule = new Module(filePath, module);
    compiledModule.filename = filePath;
    compiledModule.paths = Module._nodeModulePaths(path.dirname(filePath));
    compiledModule._compile(outputText, filePath);
    return compiledModule.exports;
  } finally {
    Module._load = originalLoad;
  }
};

// ---------------------------------------------------------------------------
// ECDSA public-key commitment — golden vectors.
//
// Generated from @miden-sdk/miden-sdk@0.15.9. For every vector,
//   AuthSecretKey.ecdsaWithRNG(seed).publicKey().toCommitment()
//     === Poseidon2.hashElements(felts)
// where `felts` is the preimage this module builds. Both halves are pinned so
// a drift in either is caught:
//
//   * `felts`      — the preimage. 0.16 replaces this 9-felt packing of the
//                    compressed SEC1 key with 16 felts of qx||qy, so these
//                    vectors must be regenerated when the SDK moves.
//   * hash family  — the protocol commits with Poseidon2. Committing with
//                    Rpo256 yields a valid-looking Word that is simply wrong
//                    and only surfaces as an auth rejection at transaction
//                    time. That was the bug these vectors exist to prevent.
//
// Vectors pin the public key rather than the RNG seed: seed -> key derivation
// is version-dependent, key -> commitment is the thing under test.
// ---------------------------------------------------------------------------

const COMMITMENT_VECTORS = [
  {
    // y-parity tag 0x03
    compressed: '03985ff69b8df24415caad235e80f919a010d6a52b5d86651bba4f460fcba4b344',
    felts: [4133459971, 1156746651, 598592021, 435781726, 2782269600, 1703304491, 1179630107, 3013921551, 68],
    commitment: '0xc063b413e4013c64374ddd78133bfb033996b968543f0ed58ac2c77c4da33c90',
  },
  {
    // y-parity tag 0x03
    compressed: '031669edc8c22bde908c19adb63ec95d0e7a9db0219634c0d52b50325d62abeb9f',
    felts: [3983087107, 3727409864, 2904132752, 1573469878, 2963110414, 3224671777, 844114901, 3953877597, 159],
    commitment: '0x2ef46fd60857c0eb63d067d8b6d33856b8ee9fd388879af5b9bb03e48fd6f191',
  },
  {
    // y-parity tag 0x02
    compressed: '02720e6952c52213f93130865938f38e6e0f9497d7ce653eee7b32883e0cf5f8e5',
    felts: [1762554370, 321045842, 2251305465, 2398304345, 2543062894, 1046859479, 2285009902, 4176809022, 229],
    commitment: '0x2074ddd9877ab64a5f15efc7161c86acccc762955d2fc7f846ac1e634fbd42e9',
  },
  {
    // y-parity tag 0x02
    compressed: '02f63531e49db17b4d19d6e2cdf4ec386f1a3533aa4a8e48dd406e3f047dd40160',
    felts: [825619970, 2075237860, 3805681997, 955053261, 859118191, 1217284778, 1064190173, 30702852, 96],
    commitment: '0x8e4275e41ca20c833a89d1edf8ab12bb54b783ae63e3a557b594f753b6801d01',
  },
];

/** Minimal stand-in for the SDK's hashing surface that records what was called. */
const makeSdkSpy = () => {
  const calls = { poseidon2: [], rpo256: [] };
  const record = (bucket) => (feltArray) => {
    calls[bucket].push(feltArray.values.map((felt) => Number(felt.value)));
    return { toHex: () => `0x${bucket}` };
  };
  return {
    calls,
    sdk: {
      Felt: class Felt {
        constructor(value) {
          this.value = value;
        }
      },
      FeltArray: class FeltArray {
        constructor(values) {
          this.values = values;
        }
      },
      Poseidon2: { hashElements: record('poseidon2') },
      Rpo256: { hashElements: record('rpo256') },
    },
  };
};

// `evmPkToCommitment` reaches the SDK through `await import(...)`, which
// TypeScript lowers to `Promise.resolve().then(() => require(...))`. That
// require therefore runs AFTER loadUtils has restored Module._load, so the
// mock has to stay installed across the await rather than only across the
// module compile.
const withMockedSdk = async (sdk, run) => {
  const originalLoad = Module._load;
  Module._load = function patchedLoad(request, parent, isMain) {
    if (request.startsWith('@miden-sdk/miden-sdk')) return sdk;
    return originalLoad.apply(this, [request, parent, isMain]);
  };
  try {
    return await run();
  } finally {
    Module._load = originalLoad;
  }
};

test('evmPkToCommitment builds the pinned Poseidon2 preimage', async () => {
  for (const vector of COMMITMENT_VECTORS) {
    const { sdk, calls } = makeSdkSpy();
    const { evmPkToCommitment } = loadUtils({ '@miden-sdk/miden-sdk': sdk });

    await withMockedSdk(sdk, () => evmPkToCommitment(vector.compressed));

    assert.deepEqual(
      calls.poseidon2[0],
      vector.felts,
      `preimage drifted for ${vector.compressed}`
    );
  }
});

test('evmPkToCommitment hashes with Poseidon2 and never Rpo256', async () => {
  for (const vector of COMMITMENT_VECTORS) {
    const { sdk, calls } = makeSdkSpy();
    const { evmPkToCommitment } = loadUtils({ '@miden-sdk/miden-sdk': sdk });

    await withMockedSdk(sdk, () => evmPkToCommitment(vector.compressed));

    assert.strictEqual(calls.poseidon2.length, 1, 'expected exactly one Poseidon2 hash');
    assert.strictEqual(
      calls.rpo256.length,
      0,
      'commitments must not be hashed with Rpo256 — the protocol commits with Poseidon2'
    );
  }
});
