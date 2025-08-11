import type { Chain } from '@web3-onboard/common';

type SupportedChain = Chain & { network: 'mainnet' | 'testnet'; icon: string };

export const supportedChains = [
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
    network: 'mainnet',
    icon: './assets/bnb.svg',
    id: '0x38',
    token: 'BNB',
    label: 'BSC',
    rpcUrl: 'https://binance.llamarpc.com'
  },
  {
    network: 'mainnet',
    icon: 'https://app.mode.network/assets/icons/mode_yellow.svg',
    id: '0x868b',
    token: 'ETH',
    label: 'Mode',
    rpcUrl: 'https://mainnet.mode.network'
  }
] as const satisfies SupportedChain[];

export const supportedChainIds = supportedChains.map(({ id }) => id);
export type SupportedChainIds = (typeof supportedChainIds)[0];
