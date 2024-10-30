import type { Chain } from '@web3-onboard/common';

type SupportedChain = Chain & { network: 'mainnet' | 'testnet'; icon: string };

export const supportedChains: SupportedChain[] = [
  {
    network: 'mainnet',
    icon: './assets/ethereum.svg',
    id: '0x1',
    token: 'ETH',
    label: 'Ethereum',
    rpcUrl: 'https://arbitrum-one.publicnode.com'
  },
  {
    network: 'mainnet',
    icon: './assets/arbitrum.svg',
    id: '0xa4b1',
    token: 'ETH',
    label: 'Arbitrum One',
    rpcUrl: 'https://ethereum-rpc.publicnode.com'
  },
  {
    network: 'mainnet',
    icon: './assets/optimism.svg',
    id: '0xa',
    token: 'ETH',
    label: 'OP Mainnet',
    rpcUrl: 'https://mainnet.optimism.io'
  },
  {
    network: 'mainnet',
    icon: './assets/base.svg',
    id: '0x2105',
    token: 'ETH',
    label: 'Base',
    rpcUrl: 'https://base-rpc.publicnode.com'
  },
  {
    network: 'mainnet',
    icon: './assets/mantle.svg',
    id: '0x1388',
    token: 'MNT',
    label: 'Mantle',
    rpcUrl: 'https://rpc.mantle.xyz'
  },
  {
    network: 'mainnet',
    icon: './assets/sei.svg',
    id: '0x531',
    token: 'SEI',
    label: 'Sei',
    rpcUrl: 'https://evm-rpc.sei-apis.com'
  },
  {
    network: 'testnet',
    icon: './assets/sepolia.svg',
    id: '0xaa36a7',
    token: 'ETH',
    label: 'Sepolia',
    rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com'
  },
  {
    network: 'testnet',
    icon: './assets/arbitrum_sepolia.svg',
    id: '0x66eee',
    token: 'ETH',
    label: 'Arbitrum Sepolia',
    rpcUrl: 'https://arbitrum-sepolia.publicnode.com'
  },
  {
    network: 'testnet',
    icon: './assets/optimism_sepolia.svg',
    id: '0xaa37dc',
    token: 'ETH',
    label: 'OP Sepolia',
    rpcUrl: 'https://optimism-sepolia.publicnode.com'
  },
  {
    network: 'testnet',
    icon: './assets/base_sepolia.svg',
    id: '0x14a34',
    token: 'ETH',
    label: 'Base Sepolia',
    rpcUrl: 'https://base-sepolia-rpc.publicnode.com'
  },
  {
    network: 'testnet',
    icon: './assets/mantle_sepolia.svg',
    id: '0x138b',
    token: 'MNT',
    label: 'Mantle Sepolia',
    rpcUrl: 'https://rpc.sepolia.mantle.xyz'
  },
  {
    network: 'testnet',
    icon: './assets/sei_testnet.svg',
    id: '0xae3f3',
    token: 'SEI',
    label: 'Sei Devnet',
    rpcUrl: 'https://evm-rpc-arctic-1.sei-apis.com'
  }
];

export const supportedChainIds = supportedChains.map(({ id }) => Number(id));
