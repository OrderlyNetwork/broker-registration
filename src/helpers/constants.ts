import { match } from 'ts-pattern';

import { SupportedChainIds } from './network';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function isTestnet(chainId: string): boolean {
  return false;
}

export function getVaultAddress(chainId: SupportedChainIds): string {
  return (
    match(chainId)
      // ethereum
      .with('0x1', () => '0x816f722424b49cf1275cc86da9840fbd5a6167e9')
      // arbitrum
      .with('0xa4b1', () => '0x816f722424B49Cf1275cc86DA9840Fbd5a6167e9')
      // optimism
      .with('0xa', () => '0x816f722424b49cf1275cc86da9840fbd5a6167e9')
      // base
      .with('0x2105', () => '0x816f722424b49cf1275cc86da9840fbd5a6167e9')
      // mantle
      .with('0x1388', () => '0x816f722424b49cf1275cc86da9840fbd5a6167e9')
      // sei
      .with('0x531', () => '0x816f722424B49Cf1275cc86DA9840Fbd5a6167e9')
      // bsc
      .with('0x38', () => '0x816f722424B49Cf1275cc86DA9840Fbd5a6167e9')
      // mode
      .with('0x868b', () => '0x816f722424B49Cf1275cc86DA9840Fbd5a6167e9')
      .exhaustive()
  );
}

export function getVerifyingAddress(chainId: SupportedChainIds): string {
  return match(isTestnet(chainId))
    .with(false, () => '0x6F7a338F2aA472838dEFD3283eB360d4Dff5D203')
    .with(true, () => '0x1826B75e2ef249173FC735149AE4B8e9ea10abff')
    .exhaustive();
}

export function getUSDCAddress(chainId: SupportedChainIds): string {
  return (
    match(chainId as SupportedChainIds)
      // ethereum
      .with('0x1', () => '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48')
      // arbitrum
      .with('0xa4b1', () => '0xaf88d065e77c8cC2239327C5EDb3A432268e5831')
      // optimism
      .with('0xa', () => '0x0b2c639c533813f4aa9d7837caf62653d097ff85')
      // base
      .with('0x2105', () => '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913')
      // mantle
      .with('0x1388', () => '0x09bc4e0d864854c6afb6eb9a9cdf58ac190d0df9')
      // sei
      .with('0x531', () => '0x3894085Ef7Ff0f0aeDf52E2A2704928d1Ec074F1')
      // bsc
      .with('0x38', () => '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d')
      // mode
      .with('0x868b', () => '0xd988097fb8612cc24eeC14542bC03424c656005f')
      .exhaustive()
  );
}

export function getBaseUrl(chainId: SupportedChainIds): string {
  return match(isTestnet(chainId))
    .with(false, () => 'https://api-evm.orderly.org')
    .with(true, () => 'https://testnet-api-evm.orderly.org')
    .exhaustive();
}

export type EIP712Domain = {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: string;
};

export function getOffChainDomain(chainId: SupportedChainIds): EIP712Domain {
  return {
    name: 'Orderly',
    version: '1',
    chainId: Number(chainId),
    verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
  };
}

export function getOnChainDomain(chainId: SupportedChainIds): EIP712Domain {
  return {
    name: 'Orderly',
    version: '1',
    chainId: Number(chainId),
    verifyingContract: getVerifyingAddress(chainId)
  };
}
