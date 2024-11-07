import { match } from 'ts-pattern';

import { SupportedChainIds, supportedChains } from './network';

export function isTestnet(chainId: string): boolean {
  return supportedChains.find((chain) => chain.id === chainId)?.network === 'testnet';
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
      // sepolia
      .with('0xaa36a7', () => '0x0EaC556c0C2321BA25b9DC01e4e3c95aD5CDCd2f')
      // arbitrum sepolia
      .with('0x66eee', () => '0x0EaC556c0C2321BA25b9DC01e4e3c95aD5CDCd2f')
      // optimism sepolia
      .with('0xaa37dc', () => '0xEfF2896077B6ff95379EfA89Ff903598190805EC')
      // base sepolia
      .with('0x14a34', () => '0xdc7348975aE9334DbdcB944DDa9163Ba8406a0ec')
      // mantle sepolia
      .with('0x138b', () => '0xfb0E5f3D16758984E668A3d76f0963710E775503')
      // sei devnet
      .with('0xae3f3', () => '0xA603f6e124259d37e43dd5008cB7613164D6a6e3')
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
      // sepolia
      .with('0xaa36a7', () => '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238')
      // arbitrum sepolia
      .with('0x66eee', () => '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d')
      // optimism sepolia
      .with('0xaa37dc', () => '0x5fd84259d66Cd46123540766Be93DFE6D43130D7')
      // base sepolia
      .with('0x14a34', () => '0x036CbD53842c5426634e7929541eC2318f3dCF7e')
      // mantle sepolia
      .with('0x138b', () => '0xAcab8129E2cE587fD203FD770ec9ECAFA2C88080')
      // sei devnet
      .with('0xae3f3', () => '0xd5164A5a83c64E59F842bC091E06614b84D95fF5')
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
