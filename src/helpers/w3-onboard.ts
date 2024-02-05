import Onboard from '@web3-onboard/core';
import walletConnectModule from '@web3-onboard/walletconnect';

const wcInitOptions = {
  projectId: '2179ab00c0afb9d78c9c0a3097278d1b',
  requiredChains: [1],
  optionalChains: [42161, 8453, 10, 137, 56],
  dappUrl: 'https://orderlynetwork.github.io/examples'
};

// initialize the module with options
const walletConnect = walletConnectModule(wcInitOptions);

// can also initialize with no options...

const onboard = Onboard({
  // ... other Onboard options
  wallets: [
    walletConnect
    //... other wallets
  ],
  chains: [
    {
      id: '0x1',
      token: 'ETH',
      label: 'Ethereum Mainnet',
      rpcUrl: MAINNET_RPC_URL
    }
  ]
});

const connectedWallets = await onboard.connectWallet();

// Assuming only wallet connect is connected, index 0
// `instance` will give insight into the WalletConnect info
// such as namespaces, methods, chains, etc per wallet connected
const { instance } = connectedWallets[0];

console.log(connectedWallets);
