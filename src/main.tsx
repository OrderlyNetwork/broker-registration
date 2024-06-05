import { Theme } from '@radix-ui/themes';
import safeModule from '@web3-onboard/gnosis';
import injectedModule from '@web3-onboard/injected-wallets';
import { Web3OnboardProvider, init } from '@web3-onboard/react';
import walletConnectModule from '@web3-onboard/walletconnect';
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App.tsx';
import { supportedChains } from './helpers';

import './index.css';
import '@radix-ui/themes/styles.css';

const injected = injectedModule();
const walletConnect = walletConnectModule({
  projectId: '2179ab00c0afb9d78c9c0a3097278d1b',
  requiredChains: [10, 42161],
  optionalChains: [421614, 11155420],
  dappUrl: 'https://orderlynetwork.github.io/broker-registration'
});
const safe = safeModule();

const web3Onboard = init({
  wallets: [injected, walletConnect, safe],
  chains: supportedChains.map(({ id, token, label, rpcUrl }) => ({
    id,
    token,
    label,
    rpcUrl
  })),
  appMetadata: {
    name: 'Orderly Broker Registration',
    description: 'Register any address in Orderly Network infrastructure'
  },
  accountCenter: {
    desktop: { enabled: false },
    mobile: { enabled: false }
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Theme>
      <Web3OnboardProvider web3Onboard={web3Onboard}>
        <App />
      </Web3OnboardProvider>
    </Theme>
  </React.StrictMode>
);
