import { getPublicKeyAsync, signAsync, utils } from '@noble/ed25519';
import { API } from '@orderly.network/types';
import { WalletState } from '@web3-onboard/core';
import {
  encodeBase58,
  ethers,
  solidityPackedKeccak256,
  BrowserProvider,
  keccak256,
  AbiCoder
} from 'ethers';

import { DelegateSigner__factory, Vault__factory } from '../abi';
import { VaultTypes } from '../abi/Vault';

import {
  getBaseUrl,
  getOffChainDomain,
  getOnChainDomain,
  getVaultAddress,
  getVerifyingAddress,
  isTestnet
} from './constants';

export * from './constants';
export * from './network';

export const usdFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });

export type Scope = 'read' | 'read,trading';

const ORDERLY_KEY_LOCAL_STORAGE = 'orderly-key';
const BROKER_ID_LOCAL_STORAGE = 'broker-id';
const CONTRACT_ADDRESS_LOCAL_STORAGE = 'contract-address';

const MESSAGE_TYPES = {
  EIP712Domain: [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' },
    { name: 'chainId', type: 'uint256' },
    { name: 'verifyingContract', type: 'address' }
  ],
  Registration: [
    { name: 'brokerId', type: 'string' },
    { name: 'chainId', type: 'uint256' },
    { name: 'timestamp', type: 'uint64' },
    { name: 'registrationNonce', type: 'uint256' }
  ],
  AddOrderlyKey: [
    { name: 'brokerId', type: 'string' },
    { name: 'chainId', type: 'uint256' },
    { name: 'orderlyKey', type: 'string' },
    { name: 'scope', type: 'string' },
    { name: 'timestamp', type: 'uint64' },
    { name: 'expiration', type: 'uint64' }
  ],
  Withdraw: [
    { name: 'brokerId', type: 'string' },
    { name: 'chainId', type: 'uint256' },
    { name: 'receiver', type: 'address' },
    { name: 'token', type: 'string' },
    { name: 'amount', type: 'uint256' },
    { name: 'withdrawNonce', type: 'uint64' },
    { name: 'timestamp', type: 'uint64' }
  ],
  SettlePnl: [
    { name: 'brokerId', type: 'string' },
    { name: 'chainId', type: 'uint256' },
    { name: 'settleNonce', type: 'uint64' },
    { name: 'timestamp', type: 'uint64' }
  ],
  DelegateSigner: [
    { name: 'delegateContract', type: 'address' },
    { name: 'brokerId', type: 'string' },
    { name: 'chainId', type: 'uint256' },
    { name: 'timestamp', type: 'uint64' },
    { name: 'registrationNonce', type: 'uint256' },
    { name: 'txHash', type: 'bytes32' }
  ],
  DelegateAddOrderlyKey: [
    { name: 'delegateContract', type: 'address' },
    { name: 'brokerId', type: 'string' },
    { name: 'chainId', type: 'uint256' },
    { name: 'orderlyKey', type: 'string' },
    { name: 'scope', type: 'string' },
    { name: 'timestamp', type: 'uint64' },
    { name: 'expiration', type: 'uint64' }
  ],
  DelegateWithdraw: [
    { name: 'delegateContract', type: 'address' },
    { name: 'brokerId', type: 'string' },
    { name: 'chainId', type: 'uint256' },
    { name: 'receiver', type: 'address' },
    { name: 'token', type: 'string' },
    { name: 'amount', type: 'uint256' },
    { name: 'withdrawNonce', type: 'uint64' },
    { name: 'timestamp', type: 'uint64' }
  ],
  DelegateSettlePnl: [
    { name: 'delegateContract', type: 'address' },
    { name: 'brokerId', type: 'string' },
    { name: 'chainId', type: 'uint256' },
    { name: 'settleNonce', type: 'uint64' },
    { name: 'timestamp', type: 'uint64' }
  ]
};

export const exampleDelegateContract = '0xa4394b62261061c629800c6d86d153a9f38f0cbb';

export type DelegateSignerResponse = {
  // TODO no GET yet available
  // account_id: string;
  user_id: number;
  valid_signer: string;
};

export async function registerAccount(
  wallet: WalletState,
  chainId: string,
  brokerId: string
): Promise<string> {
  const nonceRes = await fetch(`${getBaseUrl(chainId)}/v1/registration_nonce`);
  const nonceJson = await nonceRes.json();
  const registrationNonce = nonceJson.data.registration_nonce as string;

  const registerMessage = {
    brokerId,
    chainId: Number(chainId),
    timestamp: Date.now(),
    registrationNonce
  };

  const provider = new BrowserProvider(wallet.provider);
  const signer = await provider.getSigner();
  const signature = await signer.signTypedData(
    getOffChainDomain(chainId),
    {
      Registration: MESSAGE_TYPES.Registration
    },
    registerMessage
  );

  const registerRes = await fetch(`${getBaseUrl(chainId)}/v1/register_account`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: registerMessage,
      signature,
      userAddress: wallet.accounts[0].address
    })
  });
  const registerJson = await registerRes.json();
  if (!registerJson.success) {
    throw new Error(registerJson.message);
  }
  return registerJson.data.account_id;
}

export async function addOrderlyKey(
  wallet: WalletState,
  chainId: string,
  brokerId: string,
  scope: Scope,
  accountId: string
): Promise<Uint8Array> {
  const privateKey = utils.randomPrivateKey();
  const orderlyKey = `ed25519:${encodeBase58(await getPublicKeyAsync(privateKey))}`;
  const timestamp = Date.now();
  const addKeyMessage = {
    brokerId,
    chainId: Number(chainId),
    orderlyKey,
    scope,
    timestamp,
    expiration: timestamp + 1_000 * 60 * 60 * 24 * 365 // 1 year
  };
  const provider = new BrowserProvider(wallet.provider);
  const signer = await provider.getSigner();
  const signature = await signer.signTypedData(
    getOffChainDomain(chainId),
    {
      AddOrderlyKey: MESSAGE_TYPES.AddOrderlyKey
    },
    addKeyMessage
  );

  const keyRes = await fetch(`${getBaseUrl(chainId)}/v1/orderly_key`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: addKeyMessage,
      signature,
      userAddress: wallet.accounts[0].address
    })
  });
  const keyJson = await keyRes.json();
  if (!keyJson.success) {
    throw new Error(keyJson.message);
  }
  window.localStorage.setItem(
    `${ORDERLY_KEY_LOCAL_STORAGE}:${accountId}:${isTestnet(chainId) ? 'testnet' : 'mainnet'}`,
    base64EncodeURL(privateKey)
  );
  return privateKey;
}

export async function registerExampleDelegateSigner(
  wallet: WalletState,
  brokerId: string,
  chainId: string,
  address: string
): Promise<string> {
  const provider = new BrowserProvider(wallet.provider);
  const signer = await provider.getSigner();
  const contract = DelegateSigner__factory.connect(exampleDelegateContract, signer);
  const res = await contract.delegate(getVaultAddress(chainId), {
    brokerHash: solidityPackedKeccak256(['string'], [brokerId]),
    delegateSigner: address
  });
  return res.hash;
}

export async function announceDelegateSigner(
  wallet: WalletState,
  chainId: string,
  brokerId: string,
  delegateContract: string,
  txHash: ethers.BytesLike
): Promise<DelegateSignerResponse> {
  const nonceRes = await fetch(`${getBaseUrl(chainId)}/v1/registration_nonce`);
  const nonceJson = await nonceRes.json();
  const registrationNonce = nonceJson.data.registration_nonce as string;

  const delegateSignerMessage = {
    delegateContract,
    brokerId,
    chainId: Number(chainId),
    timestamp: Date.now(),
    registrationNonce: Number(registrationNonce),
    txHash
  };

  const provider = new BrowserProvider(wallet.provider);
  const signer = await provider.getSigner();
  const signature = await signer.signTypedData(
    getOffChainDomain(chainId),
    { DelegateSigner: MESSAGE_TYPES.DelegateSigner },
    delegateSignerMessage
  );

  const delegateSignerRes = await fetch(`${getBaseUrl(chainId)}/v1/delegate_signer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: delegateSignerMessage,
      signature,
      userAddress: wallet.accounts[0].address
    })
  });
  const registerJson = await delegateSignerRes.json();
  if (!registerJson.success) {
    throw new Error(registerJson.message);
  }
  return registerJson.data;
}

export async function delegateAddOrderlyKey(
  wallet: WalletState,
  chainId: string,
  brokerId: string,
  delegateContract: string,
  accountId: string,
  scope: Scope
): Promise<Uint8Array> {
  const privateKey = utils.randomPrivateKey();
  const orderlyKey = `ed25519:${encodeBase58(await getPublicKeyAsync(privateKey))}`;
  const timestamp = Date.now();
  const addKeyMessage = {
    delegateContract,
    brokerId,
    chainId: Number(chainId),
    orderlyKey,
    scope,
    timestamp,
    expiration: timestamp + 1_000 * 60 * 60 * 24 * 365 // 1 year
  };

  const provider = new BrowserProvider(wallet.provider);
  const signer = await provider.getSigner();
  const signature = await signer.signTypedData(
    getOffChainDomain(chainId),
    { DelegateAddOrderlyKey: MESSAGE_TYPES.DelegateAddOrderlyKey },
    addKeyMessage
  );

  const keyRes = await fetch(`${getBaseUrl(chainId)}/v1/delegate_orderly_key`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: addKeyMessage,
      signature,
      userAddress: wallet.accounts[0].address
    })
  });
  const keyJson = await keyRes.json();
  if (!keyJson.success) {
    throw new Error(keyJson.message);
  }
  window.localStorage.setItem(
    `${ORDERLY_KEY_LOCAL_STORAGE}:${accountId}:${isTestnet(chainId) ? 'testnet' : 'mainnet'}`,
    base64EncodeURL(privateKey)
  );
  return privateKey;
}

export async function delegateDeposit(
  wallet: WalletState,
  chainId: string,
  brokerId: string,
  delegateContract: string,
  amount: string,
  contractAddress: string,
  accountId: string
): Promise<void> {
  const provider = new BrowserProvider(wallet.provider);
  const signer = await provider.getSigner();
  const contract = Vault__factory.connect(getVaultAddress(chainId), signer);

  const depositInput = {
    brokerHash: solidityPackedKeccak256(['string'], [brokerId]),
    tokenAmount: amount,
    tokenHash: solidityPackedKeccak256(['string'], ['USDC']),
    accountId
  } satisfies VaultTypes.VaultDepositFEStruct;
  const depositFee = await contract.getDepositFee(contractAddress, depositInput);

  await contract.depositTo(delegateContract, depositInput, { value: depositFee });
}

export async function delegateWithdraw(
  wallet: WalletState,
  chainId: string,
  brokerId: string,
  delegateContract: string,
  accountId: string,
  orderlyKey: Uint8Array,
  amount: string,
  receiver: string
): Promise<void> {
  const nonceRes = await signAndSendRequest(
    accountId,
    orderlyKey,
    `${getBaseUrl(chainId)}/v1/withdraw_nonce`
  );
  const nonceJson = await nonceRes.json();
  const withdrawNonce = nonceJson.data.withdraw_nonce as string;

  const delegateWithdrawMessage = {
    delegateContract,
    brokerId,
    chainId: Number(chainId),
    receiver,
    token: 'USDC',
    amount: Number(amount),
    timestamp: Date.now(),
    withdrawNonce
  };

  const provider = new BrowserProvider(wallet.provider);
  const signer = await provider.getSigner();
  const signature = await signer.signTypedData(
    getOnChainDomain(chainId),
    { DelegateWithdraw: MESSAGE_TYPES.DelegateWithdraw },
    delegateWithdrawMessage
  );

  const delegateWithdrawRes = await signAndSendRequest(
    accountId,
    orderlyKey,
    `${getBaseUrl(chainId)}/v1/delegate_withdraw_request`,
    {
      method: 'POST',
      body: JSON.stringify({
        message: delegateWithdrawMessage,
        signature,
        userAddress: wallet.accounts[0].address,
        verifyingContract: getVerifyingAddress(chainId)
      })
    }
  );
  const withdrawJson = await delegateWithdrawRes.json();
  if (!withdrawJson.success) {
    throw new Error(withdrawJson.message);
  }
}

export async function delegateSettlePnL(
  wallet: WalletState,
  chainId: string,
  brokerId: string,
  delegateContract: string,
  accountId: string,
  orderlyKey: Uint8Array
): Promise<void> {
  const nonceRes = await signAndSendRequest(
    accountId,
    orderlyKey,
    `${getBaseUrl(chainId)}/v1/settle_nonce`
  );
  const nonceJson = await nonceRes.json();
  const settleNonce = nonceJson.data.settle_nonce as string;

  const delegateSettlePnLMessage = {
    delegateContract,
    brokerId,
    chainId: Number(chainId),
    timestamp: Date.now(),
    settleNonce
  };

  const provider = new BrowserProvider(wallet.provider);
  const signer = await provider.getSigner();
  const signature = await signer.signTypedData(
    getOnChainDomain(chainId),
    { DelegateSettlePnl: MESSAGE_TYPES.DelegateSettlePnl },
    delegateSettlePnLMessage
  );

  const delegateSignerRes = await signAndSendRequest(
    accountId,
    orderlyKey,
    `${getBaseUrl(chainId)}/v1/delegate_settle_pnl`,
    {
      method: 'POST',
      body: JSON.stringify({
        message: delegateSettlePnLMessage,
        signature,
        userAddress: wallet.accounts[0].address,
        verifyingContract: getVerifyingAddress(chainId)
      })
    }
  );
  const registerJson = await delegateSignerRes.json();
  if (!registerJson.success) {
    throw new Error(registerJson.message);
  }
}

export async function settlePnL(
  wallet: WalletState,
  chainId: string,
  brokerId: string,
  accountId: string,
  orderlyKey: Uint8Array
): Promise<void> {
  const nonceRes = await signAndSendRequest(
    accountId,
    orderlyKey,
    `${getBaseUrl(chainId)}/v1/settle_nonce`
  );
  const nonceJson = await nonceRes.json();
  const settleNonce = nonceJson.data.settle_nonce as string;

  const settlePnLMessage = {
    brokerId,
    chainId: Number(chainId),
    timestamp: Date.now(),
    settleNonce
  };

  const provider = new BrowserProvider(wallet.provider);
  const signer = await provider.getSigner();
  const signature = await signer.signTypedData(
    getOnChainDomain(chainId),
    { SettlePnl: MESSAGE_TYPES.SettlePnl },
    settlePnLMessage
  );

  const res = await signAndSendRequest(
    accountId,
    orderlyKey,
    `${getBaseUrl(chainId)}/v1/settle_pnl`,
    {
      method: 'POST',
      body: JSON.stringify({
        signature,
        message: settlePnLMessage,
        userAddress: wallet.accounts[0].address,
        verifyingContract: getVerifyingAddress(chainId)
      })
    }
  );
  const registerJson = await res.json();
  if (!registerJson.success) {
    throw new Error(registerJson.message);
  }
}

export async function getClientHolding(
  chainId: string,
  accountId: string,
  orderlyKey: Uint8Array
): Promise<number> {
  const res = await signAndSendRequest(
    accountId,
    orderlyKey,
    `${getBaseUrl(chainId)}/v1/client/holding`
  );
  if (!res.ok) {
    throw new Error(`Could not fetch client holding`);
  }
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.message);
  }
  const holdings = json.data.holding as API.Holding[];
  return holdings.find(({ token }) => token === 'USDC')?.holding ?? 0;
}

export async function getUnsettledPnL(chainId: string, accountId: string, orderlyKey: Uint8Array) {
  const res = await signAndSendRequest(
    accountId,
    orderlyKey,
    `${getBaseUrl(chainId)}/v1/positions`
  );
  if (!res.ok) {
    throw new Error(`Could not fetch client holding`);
  }
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.message);
  }
  const positions = json.data.rows as API.Position[];
  return positions.reduce((acc, position) => acc + position.unsettled_pnl, 0);
}

async function signAndSendRequest(
  accountId: string,
  orderlyKey: Uint8Array | string,
  input: URL | string,
  init?: RequestInit | undefined
): Promise<Response> {
  const timestamp = Date.now();
  const encoder = new TextEncoder();

  const url = new URL(input);
  let message = `${String(timestamp)}${init?.method ?? 'GET'}${url.pathname}`;
  if (init?.body) {
    message += init.body;
  }
  const orderlySignature = await signAsync(encoder.encode(message), orderlyKey);

  return fetch(input, {
    headers: {
      'Content-Type':
        init?.method !== 'GET' && init?.method !== 'DELETE'
          ? 'application/json'
          : 'application/x-www-form-urlencoded',
      'orderly-timestamp': String(timestamp),
      'orderly-account-id': accountId,
      'orderly-key': `ed25519:${encodeBase58(await getPublicKeyAsync(orderlyKey))}`,
      'orderly-signature': base64EncodeURL(orderlySignature),
      ...(init?.headers ?? {})
    },
    ...(init ?? {})
  });
}

export function getAccountId(address: string, brokerId: string) {
  const abicoder = AbiCoder.defaultAbiCoder();
  return keccak256(
    abicoder.encode(
      ['address', 'bytes32'],
      [address, solidityPackedKeccak256(['string'], [brokerId])]
    )
  );
}

export function loadOrderlyKey(accountId: string, chainId: string): Uint8Array | undefined {
  const key = window.localStorage.getItem(
    `${ORDERLY_KEY_LOCAL_STORAGE}:${accountId}:${isTestnet(chainId) ? 'testnet' : 'mainnet'}`
  );
  if (!key) return;
  return base64DecodeURL(key);
}

export function loadBrokerId(chainId: string): string {
  return window.localStorage.getItem(`${BROKER_ID_LOCAL_STORAGE}:${chainId}`) ?? '';
}

export function saveBrokerId(chainId: string, brokerId: string) {
  return window.localStorage.setItem(`${BROKER_ID_LOCAL_STORAGE}:${chainId}`, brokerId);
}

export function loadContractAddress(chainId: string): string {
  return window.localStorage.getItem(`${CONTRACT_ADDRESS_LOCAL_STORAGE}:${chainId}`) ?? '';
}

export function saveContractAddress(chainId: string, contractAddress: string) {
  return window.localStorage.setItem(
    `${CONTRACT_ADDRESS_LOCAL_STORAGE}:${chainId}`,
    contractAddress
  );
}

function base64EncodeURL(byteArray: Uint8Array) {
  return btoa(
    Array.from(new Uint8Array(byteArray))
      .map((val) => {
        return String.fromCharCode(val);
      })
      .join('')
  )
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function base64DecodeURL(b64urlstring: string): Uint8Array {
  return new Uint8Array(
    atob(b64urlstring.replace(/-/g, '+').replace(/_/g, '/'))
      .split('')
      .map((val) => {
        return val.charCodeAt(0);
      })
  );
}
