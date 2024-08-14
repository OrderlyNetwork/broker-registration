import { match } from 'ts-pattern';

type SupportedChainIds =
  | '0x1' // ethereum
  | '0xa4b1' // arbitrum
  | '0xa' // optimism
  | '0x2105' // base
  | '0xaa36a7' // sepolia
  | '0x66eee' // arbitrum sepolia
  | '0xaa37dc' // optimism sepolia
  | '0x14a34'; // base sepolia

export function isTestnet(chainId: string): boolean {
  return match(chainId as SupportedChainIds)
    .with('0x1', '0xa4b1', '0xa', '0x2105', () => false)
    .with('0xaa36a7', '0x66eee', '0xaa37dc', '0x14a34', () => true)
    .otherwise(() => {
      console.warn(`unrecognized chainId ${chainId}`);
      return true;
    });
}

export function getVaultAddress(chainId: string): string {
  return match(chainId as SupportedChainIds)
    .with('0x1', () => '0x816f722424b49cf1275cc86da9840fbd5a6167e9')
    .with('0xa4b1', () => '0x816f722424B49Cf1275cc86DA9840Fbd5a6167e9')
    .with('0xa', () => '0x816f722424b49cf1275cc86da9840fbd5a6167e9')
    .with('0x2105', () => '0x816f722424b49cf1275cc86da9840fbd5a6167e9')
    .with('0xaa36a7', () => '0x0EaC556c0C2321BA25b9DC01e4e3c95aD5CDCd2f')
    .with('0x66eee', () => '0x0EaC556c0C2321BA25b9DC01e4e3c95aD5CDCd2f')
    .with('0xaa37dc', () => '0xEfF2896077B6ff95379EfA89Ff903598190805EC')
    .with('0x14a34', () => '0xdc7348975aE9334DbdcB944DDa9163Ba8406a0ec')
    .otherwise(() => {
      console.warn(`unrecognized chainId ${chainId}`);
      return '';
    });
}

export function getVerifyingAddress(chainId: string): string {
  return match(isTestnet(chainId))
    .with(false, () => '0x6F7a338F2aA472838dEFD3283eB360d4Dff5D203')
    .with(true, () => '0x1826B75e2ef249173FC735149AE4B8e9ea10abff')
    .exhaustive();
}

export function getUSDCAddress(chainId: string): string {
  return match(chainId as SupportedChainIds)
    .with('0x1', () => '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48')
    .with('0xa4b1', () => '0xaf88d065e77c8cC2239327C5EDb3A432268e5831')
    .with('0xa', () => '0x0b2c639c533813f4aa9d7837caf62653d097ff85')
    .with('0x2105', () => '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913')
    .with('0xaa36a7', () => '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238')
    .with('0x66eee', () => '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d')
    .with('0xaa37dc', () => '0x5fd84259d66Cd46123540766Be93DFE6D43130D7')
    .with('0x14a34', () => '0x036CbD53842c5426634e7929541eC2318f3dCF7e')
    .otherwise(() => '');
}

export function getBaseUrl(chainId: string): string {
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

export function getOffChainDomain(chainId: string): EIP712Domain {
  return {
    name: 'Orderly',
    version: '1',
    chainId: Number(chainId),
    verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
  };
}

export function getOnChainDomain(chainId: string): EIP712Domain {
  return {
    name: 'Orderly',
    version: '1',
    chainId: Number(chainId),
    verifyingContract: getVerifyingAddress(chainId)
  };
}
