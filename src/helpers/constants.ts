export function isTestnet(chainId: string): boolean {
  switch (chainId) {
    case '0xa4b1':
    case '0xa':
      return false;
    case '0x66eee':
    case '0xaa37dc':
      return true;
    default:
      return false;
  }
}

export function getVaultAddress(chainId: string): string {
  switch (chainId) {
    case '0xa4b1':
      return '0x816f722424B49Cf1275cc86DA9840Fbd5a6167e9';
    case '0xa':
      return '0x816f722424b49cf1275cc86da9840fbd5a6167e9';
    case '0x66eee':
      return '0x0EaC556c0C2321BA25b9DC01e4e3c95aD5CDCd2f';
    case '0xaa37dc':
      return '0xEfF2896077B6ff95379EfA89Ff903598190805EC';
    default:
      throw new Error('chain ID unsupported');
  }
}

export function getVerifyingAddress(chainId: string): string {
  switch (chainId) {
    case '0xa4b1':
    case '0xa':
      return '0x6F7a338F2aA472838dEFD3283eB360d4Dff5D203';
    case '0x66eee':
    case '0xaa37dc':
      return '0x1826B75e2ef249173FC735149AE4B8e9ea10abff';
    default:
      throw new Error('chain ID unsupported');
  }
}

export function getUSDCAddress(chainId: string): string {
  switch (chainId) {
    case '0xa4b1':
      return '0xaf88d065e77c8cC2239327C5EDb3A432268e5831';
    case '0xa':
      return '0x816f722424b49cf1275cc86da9840fbd5a6167e9';
    case '0x66eee':
      return '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d';
    case '0xaa37dc':
      return '0x5fd84259d66Cd46123540766Be93DFE6D43130D7';
    default:
      throw new Error('chain ID unsupported');
  }
}

export function getBaseUrl(chainId: string): string {
  switch (chainId) {
    case '0xa4b1':
    case '0xa':
      return 'https://api-evm.orderly.org';
    case '0x66eee':
    case '0xaa37dc':
    default:
      return 'https://testnet-api-evm.orderly.org';
  }
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
