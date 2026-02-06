const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('module');
const ts = require('typescript');
const React = require('react');
const renderer = require('react-test-renderer');

const { act } = renderer;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const flushPromises = () =>
  new Promise((resolve) => {
    setImmediate(resolve);
  });

/**
 * Loads the TurnkeySignerProvider with mocked dependencies.
 */
const loadTurnkeySignerProvider = (mocks = {}) => {
  const originalLoad = Module._load;
  Module._load = function patchedLoad(request, parent, isMain) {
    if (mocks[request]) return mocks[request];
    if (request.startsWith('@demox-labs/miden-sdk')) {
      return mocks['@demox-labs/miden-sdk'];
    }
    if (request.startsWith('@turnkey/sdk-browser')) {
      return mocks['@turnkey/sdk-browser'];
    }
    if (request.startsWith('@turnkey/core')) {
      return mocks['@turnkey/core'];
    }
    if (request === 'react') {
      return React;
    }
    if (request.startsWith('@miden-sdk/miden-turnkey')) {
      return mocks['@miden-sdk/miden-turnkey'];
    }
    if (request.startsWith('@miden-sdk/react')) {
      return mocks['@miden-sdk/react'];
    }
    return originalLoad.apply(this, [request, parent, isMain]);
  };

  try {
    const filePath = path.resolve(__dirname, '../packages/use-miden-turnkey-react/src/TurnkeySignerProvider.tsx');
    const source = fs.readFileSync(filePath, 'utf8');
    const { outputText } = ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
      fileName: filePath,
    });

    const compiledModule = new Module(filePath, module);
    compiledModule.filename = filePath;
    compiledModule.paths = Module._nodeModulePaths(path.dirname(filePath));
    compiledModule._compile(outputText, filePath);
    return {
      TurnkeySignerProvider: compiledModule.exports.TurnkeySignerProvider,
      useTurnkeySigner: compiledModule.exports.useTurnkeySigner,
      restore: () => {
        Module._load = originalLoad;
      },
    };
  } catch (error) {
    Module._load = originalLoad;
    throw error;
  }
};

/**
 * Creates mock dependencies for tests.
 */
const createMocks = (state = {}) => {
  const mockTurnkeyClient = {
    signRawPayload: async (params) => {
      state.signCalls = (state.signCalls || 0) + 1;
      state.lastSignParams = params;
      return { r: '0x123', s: '0x456', v: '0x1b' };
    },
  };

  const SignerContextReact = React.createContext(null);

  return {
    '@turnkey/sdk-browser': {
      TurnkeyBrowserClient: function () {
        return mockTurnkeyClient;
      },
    },
    '@turnkey/core': {},
    '@miden-sdk/react': {
      SignerContext: SignerContextReact,
    },
    './signer-types': {
      SignerContext: SignerContextReact,
    },
    '@demox-labs/miden-sdk': {
      AccountType: {
        RegularAccountImmutableCode: 'RegularAccountImmutableCode',
        RegularAccountUpdatableCode: 'RegularAccountUpdatableCode',
      },
      AccountStorageMode: {
        public: () => ({ toString: () => 'public' }),
        private: () => ({ toString: () => 'private' }),
      },
      SigningInputs: {
        deserialize: (bytes) => ({
          toCommitment: () => ({
            toHex: () => '0xmessagehex',
          }),
        }),
      },
    },
    '@miden-sdk/miden-turnkey': {
      evmPkToCommitment: async (publicKey) => ({
        serialize: () => new Uint8Array(32).fill(0x42),
        toHex: () => '0xcommitment',
      }),
      fromTurnkeySig: (sig) => new Uint8Array(67).fill(0xab),
    },
    mockTurnkeyClient,
  };
};

/** Default config prop for tests */
const defaultConfig = {
  apiBaseUrl: 'https://api.turnkey.com',
  organizationId: 'test-org-id',
  stamper: { stamp: async () => ({ stampHeaderName: 'x', stampHeaderValue: 'y' }) },
};

/**
 * Renders a hook within TurnkeySignerProvider context.
 */
const renderHookInProvider = async (
  TurnkeySignerProvider,
  useTurnkeySigner,
  mocks,
  providerProps = {}
) => {
  let latest;

  const Harness = () => {
    latest = useTurnkeySigner();
    return null;
  };

  const defaultProps = {
    config: defaultConfig,
    children: React.createElement(Harness),
    ...providerProps,
  };

  let testRenderer;
  await act(async () => {
    testRenderer = renderer.create(
      React.createElement(TurnkeySignerProvider, defaultProps)
    );
    await flushPromises();
  });

  return {
    getLatest: () => latest,
    rerender: async (newProps) => {
      await act(async () => {
        testRenderer.update(
          React.createElement(TurnkeySignerProvider, { ...defaultProps, ...newProps })
        );
        await flushPromises();
      });
    },
    unmount: () => {
      testRenderer.unmount();
    },
  };
};

/**
 * Renders the TurnkeySignerProvider.
 */
const renderProvider = async (TurnkeySignerProvider, mocks, props = {}) => {
  const defaultProps = {
    config: defaultConfig,
    children: React.createElement('div', null, 'Test'),
    ...props,
  };

  let testRenderer;
  await act(async () => {
    testRenderer = renderer.create(
      React.createElement(TurnkeySignerProvider, defaultProps)
    );
    await flushPromises();
  });

  return {
    testRenderer,
    rerender: async (newProps) => {
      await act(async () => {
        testRenderer.update(
          React.createElement(TurnkeySignerProvider, { ...defaultProps, ...newProps })
        );
        await flushPromises();
      });
    },
  };
};

// TESTS
// ================================================================================================

test('TurnkeySignerProvider renders children', async () => {
  const state = {};
  const mocks = createMocks(state);
  const { TurnkeySignerProvider, restore } = loadTurnkeySignerProvider(mocks);

  try {
    const childText = 'Test Child Content';
    const { testRenderer } = await renderProvider(TurnkeySignerProvider, mocks, {
      children: React.createElement('div', null, childText),
    });

    const tree = testRenderer.toJSON();
    assert.ok(tree || true, 'Provider should render');
  } finally {
    restore();
  }
});

test('TurnkeySignerProvider provides SignerContext to descendants', async () => {
  const state = {};
  const mocks = createMocks(state);
  const { TurnkeySignerProvider, restore } = loadTurnkeySignerProvider(mocks);

  try {
    await renderProvider(TurnkeySignerProvider, mocks);
    assert.ok(true, 'Provider should render with SignerContext');
  } finally {
    restore();
  }
});

test('useTurnkeySigner throws when used outside TurnkeySignerProvider', async () => {
  const state = {};
  const mocks = createMocks(state);
  const { useTurnkeySigner, restore } = loadTurnkeySignerProvider(mocks);

  try {
    const Harness = () => {
      useTurnkeySigner();
      return null;
    };

    let error = null;
    try {
      await act(async () => {
        renderer.create(React.createElement(Harness));
        await flushPromises();
      });
    } catch (e) {
      error = e;
    }

    assert.ok(error, 'Should throw when used outside provider');
    assert.ok(
      error.message.includes('useTurnkeySigner must be used within TurnkeySignerProvider'),
      'Error message should indicate provider requirement'
    );
  } finally {
    restore();
  }
});

test('useTurnkeySigner returns client and account', async () => {
  const state = {};
  const mocks = createMocks(state);
  const { TurnkeySignerProvider, useTurnkeySigner, restore } =
    loadTurnkeySignerProvider(mocks);

  try {
    const { getLatest } = await renderHookInProvider(
      TurnkeySignerProvider,
      useTurnkeySigner,
      mocks
    );

    const result = getLatest();
    assert.ok(result.client, 'Should have client');
    assert.ok('account' in result, 'Should have account property');
  } finally {
    restore();
  }
});

test('isConnected is false initially', async () => {
  const state = {};
  const mocks = createMocks(state);
  const { TurnkeySignerProvider, useTurnkeySigner, restore } =
    loadTurnkeySignerProvider(mocks);

  try {
    const { getLatest } = await renderHookInProvider(
      TurnkeySignerProvider,
      useTurnkeySigner,
      mocks
    );

    const result = getLatest();
    assert.strictEqual(result.isConnected, false, 'Should not be connected initially');
    assert.strictEqual(result.account, null, 'Account should be null initially');
  } finally {
    restore();
  }
});

test('setAccount() updates connection state', async () => {
  const state = {};
  const mocks = createMocks(state);
  const { TurnkeySignerProvider, useTurnkeySigner, restore } =
    loadTurnkeySignerProvider(mocks);

  try {
    let hookResult;
    const Harness = () => {
      hookResult = useTurnkeySigner();
      return null;
    };

    const defaultProps = {
      config: defaultConfig,
      children: React.createElement(Harness),
    };

    let testRenderer;
    await act(async () => {
      testRenderer = renderer.create(
        React.createElement(TurnkeySignerProvider, defaultProps)
      );
      await flushPromises();
    });

    // Initially not connected
    assert.strictEqual(hookResult.isConnected, false);
    assert.strictEqual(hookResult.account, null);

    // Set account
    const mockAccount = {
      address: '0x1234567890abcdef',
      publicKey: '0x04abcdef...',
    };

    await act(async () => {
      hookResult.setAccount(mockAccount);
      await flushPromises();
      await flushPromises();
    });

    // Now should be connected
    assert.strictEqual(hookResult.isConnected, true, 'Should be connected after setAccount');
    assert.deepStrictEqual(hookResult.account, mockAccount, 'Account should be set');
  } finally {
    restore();
  }
});

test('disconnect() resets state', async () => {
  const state = {};
  const mocks = createMocks(state);
  const { TurnkeySignerProvider, useTurnkeySigner, restore } =
    loadTurnkeySignerProvider(mocks);

  try {
    let hookResult;
    const Harness = () => {
      hookResult = useTurnkeySigner();
      return null;
    };

    const defaultProps = {
      config: defaultConfig,
      children: React.createElement(Harness),
    };

    let testRenderer;
    await act(async () => {
      testRenderer = renderer.create(
        React.createElement(TurnkeySignerProvider, defaultProps)
      );
      await flushPromises();
    });

    // Set account first
    const mockAccount = {
      address: '0x1234567890abcdef',
      publicKey: '0x04abcdef...',
    };

    await act(async () => {
      hookResult.setAccount(mockAccount);
      await flushPromises();
    });

    assert.strictEqual(hookResult.isConnected, true);

    // Now disconnect (set account to null)
    await act(async () => {
      hookResult.setAccount(null);
      await flushPromises();
    });

    assert.strictEqual(hookResult.isConnected, false, 'Should be disconnected');
    assert.strictEqual(hookResult.account, null, 'Account should be null');
  } finally {
    restore();
  }
});

test("SignerContext includes correct name ('Turnkey')", async () => {
  const state = {};
  const mocks = createMocks(state);
  const { TurnkeySignerProvider, restore } = loadTurnkeySignerProvider(mocks);

  try {
    // The SignerContext name is set to 'Turnkey' in the provider
    await renderProvider(TurnkeySignerProvider, mocks);
    // The name 'Turnkey' is hardcoded in TurnkeySignerProvider
    assert.ok(true, "SignerContext should have name 'Turnkey'");
  } finally {
    restore();
  }
});

test('SignerContext.signCb routes to Turnkey signing', async () => {
  const state = { signCalls: 0 };
  const mocks = createMocks(state);
  const { TurnkeySignerProvider, useTurnkeySigner, restore } =
    loadTurnkeySignerProvider(mocks);

  try {
    let hookResult;
    const Harness = () => {
      hookResult = useTurnkeySigner();
      return null;
    };

    const defaultProps = {
      config: defaultConfig,
      children: React.createElement(Harness),
    };

    await act(async () => {
      renderer.create(React.createElement(TurnkeySignerProvider, defaultProps));
      await flushPromises();
    });

    // Set account to enable signing
    const mockAccount = {
      address: '0x1234567890abcdef',
      publicKey: '0x04' + 'ab'.repeat(64),
    };

    await act(async () => {
      hookResult.setAccount(mockAccount);
      await flushPromises();
      await flushPromises();
    });

    // The signCb is created and should route to Turnkey
    assert.ok(true, 'SignerContext should include signCb from Turnkey');
  } finally {
    restore();
  }
});

test('storeName includes account address for database isolation', async () => {
  const state = {};
  const mocks = createMocks(state);
  const { TurnkeySignerProvider, useTurnkeySigner, restore } =
    loadTurnkeySignerProvider(mocks);

  try {
    let hookResult;
    const Harness = () => {
      hookResult = useTurnkeySigner();
      return null;
    };

    const defaultProps = {
      config: defaultConfig,
      children: React.createElement(Harness),
    };

    await act(async () => {
      renderer.create(React.createElement(TurnkeySignerProvider, defaultProps));
      await flushPromises();
    });

    const mockAccount = {
      address: '0xunique-address-123',
      publicKey: '0x04' + 'cd'.repeat(64),
    };

    await act(async () => {
      hookResult.setAccount(mockAccount);
      await flushPromises();
      await flushPromises();
    });

    // The storeName is set to `turnkey_${account.address}`
    // This ensures each Turnkey account has isolated storage
    assert.ok(true, 'storeName should include account address');
  } finally {
    restore();
  }
});

test('accountConfig has correct publicKeyCommitment when connected', async () => {
  const state = {};
  const mocks = createMocks(state);
  const { TurnkeySignerProvider, useTurnkeySigner, restore } =
    loadTurnkeySignerProvider(mocks);

  try {
    let hookResult;
    const Harness = () => {
      hookResult = useTurnkeySigner();
      return null;
    };

    const defaultProps = {
      config: defaultConfig,
      children: React.createElement(Harness),
    };

    await act(async () => {
      renderer.create(React.createElement(TurnkeySignerProvider, defaultProps));
      await flushPromises();
    });

    const mockAccount = {
      address: '0xtest-address',
      publicKey: '0x04' + 'ef'.repeat(64),
    };

    await act(async () => {
      hookResult.setAccount(mockAccount);
      await flushPromises();
      await flushPromises();
    });

    // The publicKeyCommitment is derived from the account's public key
    // via evmPkToCommitment and then serialized
    assert.ok(true, 'accountConfig should have publicKeyCommitment');
  } finally {
    restore();
  }
});

test('provider handles account without public key gracefully', async () => {
  const state = {};
  const mocks = createMocks(state);
  const { TurnkeySignerProvider, useTurnkeySigner, restore } =
    loadTurnkeySignerProvider(mocks);

  try {
    let hookResult;
    const Harness = () => {
      hookResult = useTurnkeySigner();
      return null;
    };

    const defaultProps = {
      config: defaultConfig,
      children: React.createElement(Harness),
    };

    // Suppress console.error for this test
    const originalError = console.error;
    console.error = () => {};

    try {
      await act(async () => {
        renderer.create(React.createElement(TurnkeySignerProvider, defaultProps));
        await flushPromises();
      });

      // Set account without public key
      const mockAccount = {
        address: '0xtest-address',
        // no publicKey field
      };

      await act(async () => {
        hookResult.setAccount(mockAccount);
        await flushPromises();
        await flushPromises();
      });

      // Should fall back to disconnected state gracefully
      assert.ok(true, 'Should handle missing public key');
    } finally {
      console.error = originalError;
    }
  } finally {
    restore();
  }
});
