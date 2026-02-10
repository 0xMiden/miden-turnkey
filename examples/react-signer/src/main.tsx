import './polyfills';
import { createRoot } from 'react-dom/client';
import { TurnkeySignerProvider } from '@miden-sdk/miden-turnkey-react';
import { MidenProvider } from '@miden-sdk/react';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <TurnkeySignerProvider>
    <MidenProvider config={{ rpcUrl: 'devnet', prover: 'devnet' }}>
      <App />
    </MidenProvider>
  </TurnkeySignerProvider>
);
