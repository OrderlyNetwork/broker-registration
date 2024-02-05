export function getVaultAddress(chainId: string): string {
  switch (chainId) {
    case '0xa4b1':
      return '0x816f722424B49Cf1275cc86DA9840Fbd5a6167e9';
    case '0xa':
      return '0x0b2c639c533813f4aa9d7837caf62653d097ff85';
    case '0x66eee':
      return '0x0EaC556c0C2321BA25b9DC01e4e3c95aD5CDCd2f';
    case '0xaa37dc':
      return '0xEfF2896077B6ff95379EfA89Ff903598190805EC';
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
