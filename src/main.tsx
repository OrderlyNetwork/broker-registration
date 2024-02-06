import { OrderlyConfigProvider } from '@orderly.network/hooks';
import { Theme } from '@radix-ui/themes';
import injectedModule from '@web3-onboard/injected-wallets';
import { Web3OnboardProvider, init } from '@web3-onboard/react';
import walletConnectModule from '@web3-onboard/walletconnect';
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App.tsx';

import './index.css';
import '@radix-ui/themes/styles.css';

const injected = injectedModule();
const walletConnect = walletConnectModule({
  projectId: '2179ab00c0afb9d78c9c0a3097278d1b',
  requiredChains: [10, 42161],
  optionalChains: [421614, 11155420],
  dappUrl: 'https://orderlynetwork.github.io/delegate-signer'
});

const web3Onboard = init({
  wallets: [injected, walletConnect],
  chains: [
    {
      id: '0xa4b1',
      token: 'ETH',
      label: 'Arbitrum One',
      rpcUrl: 'https://arbitrum-one.publicnode.com'
    },
    {
      id: '0xa',
      token: 'ETH',
      label: 'OP Mainnet',
      rpcUrl: 'https://mainnet.optimism.io'
    },
    {
      id: '0x66eee',
      token: 'ETH',
      label: 'Arbitrum Sepolia',
      rpcUrl: 'https://arbitrum-sepolia.publicnode.com'
    },
    {
      id: '0xaa37dc',
      token: 'ETH',
      label: 'OP Sepolia',
      rpcUrl: 'https://optimism-sepolia.publicnode.com'
    }
  ],
  appMetadata: {
    name: 'Orderly Delegate Signer',
    description: 'Delegate Signer functions for multisig wallets'
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
        <OrderlyConfigProvider networkId="testnet" brokerId="woofi_dex">
          <App />
        </OrderlyConfigProvider>
      </Web3OnboardProvider>
    </Theme>
  </React.StrictMode>
);
