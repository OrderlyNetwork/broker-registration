/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  EventFragment,
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener
} from 'ethers';
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedLogDescription,
  TypedListener,
  TypedContractMethod
} from './common';

export declare namespace VaultTypes {
  export type VaultDepositFEStruct = {
    accountId: BytesLike;
    brokerHash: BytesLike;
    tokenHash: BytesLike;
    tokenAmount: BigNumberish;
  };

  export type VaultDepositFEStructOutput = [
    accountId: string,
    brokerHash: string,
    tokenHash: string,
    tokenAmount: bigint
  ] & {
    accountId: string;
    brokerHash: string;
    tokenHash: string;
    tokenAmount: bigint;
  };

  export type VaultWithdrawStruct = {
    accountId: BytesLike;
    brokerHash: BytesLike;
    tokenHash: BytesLike;
    tokenAmount: BigNumberish;
    fee: BigNumberish;
    sender: AddressLike;
    receiver: AddressLike;
    withdrawNonce: BigNumberish;
  };

  export type VaultWithdrawStructOutput = [
    accountId: string,
    brokerHash: string,
    tokenHash: string,
    tokenAmount: bigint,
    fee: bigint,
    sender: string,
    receiver: string,
    withdrawNonce: bigint
  ] & {
    accountId: string;
    brokerHash: string;
    tokenHash: string;
    tokenAmount: bigint;
    fee: bigint;
    sender: string;
    receiver: string;
    withdrawNonce: bigint;
  };
}

export declare namespace RebalanceTypes {
  export type RebalanceBurnCCDataStruct = {
    dstDomain: BigNumberish;
    rebalanceId: BigNumberish;
    amount: BigNumberish;
    tokenHash: BytesLike;
    srcChainId: BigNumberish;
    dstChainId: BigNumberish;
    dstVaultAddress: AddressLike;
  };

  export type RebalanceBurnCCDataStructOutput = [
    dstDomain: bigint,
    rebalanceId: bigint,
    amount: bigint,
    tokenHash: string,
    srcChainId: bigint,
    dstChainId: bigint,
    dstVaultAddress: string
  ] & {
    dstDomain: bigint;
    rebalanceId: bigint;
    amount: bigint;
    tokenHash: string;
    srcChainId: bigint;
    dstChainId: bigint;
    dstVaultAddress: string;
  };

  export type RebalanceMintCCDataStruct = {
    rebalanceId: BigNumberish;
    amount: BigNumberish;
    tokenHash: BytesLike;
    srcChainId: BigNumberish;
    dstChainId: BigNumberish;
    messageBytes: BytesLike;
    messageSignature: BytesLike;
  };

  export type RebalanceMintCCDataStructOutput = [
    rebalanceId: bigint,
    amount: bigint,
    tokenHash: string,
    srcChainId: bigint,
    dstChainId: bigint,
    messageBytes: string,
    messageSignature: string
  ] & {
    rebalanceId: bigint;
    amount: bigint;
    tokenHash: string;
    srcChainId: bigint;
    dstChainId: bigint;
    messageBytes: string;
    messageSignature: string;
  };
}

export interface VaultInterface extends Interface {
  getFunction(
    nameOrSignature:
      | 'allowedToken'
      | 'changeTokenAddressAndAllow'
      | 'crossChainManagerAddress'
      | 'deposit'
      | 'depositFeeEnabled'
      | 'depositId'
      | 'depositTo'
      | 'emergencyPause'
      | 'emergencyUnpause'
      | 'enableDepositFee'
      | 'getAllAllowedBroker'
      | 'getAllAllowedToken'
      | 'getAllowedBroker'
      | 'getAllowedToken'
      | 'getDepositFee'
      | 'initialize'
      | 'messageTransmitterContract'
      | 'owner'
      | 'paused'
      | 'rebalanceBurn'
      | 'rebalanceMint'
      | 'renounceOwnership'
      | 'setAllowedBroker'
      | 'setAllowedToken'
      | 'setCrossChainManager'
      | 'setRebalanceMessengerContract'
      | 'setTokenMessengerContract'
      | 'tokenMessengerContract'
      | 'transferOwnership'
      | 'withdraw'
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic:
      | 'AccountDeposit'
      | 'AccountDepositTo'
      | 'AccountWithdraw'
      | 'ChangeCrossChainManager'
      | 'ChangeTokenAddressAndAllow'
      | 'Initialized'
      | 'OwnershipTransferred'
      | 'Paused'
      | 'SetAllowedBroker'
      | 'SetAllowedToken'
      | 'Unpaused'
  ): EventFragment;

  encodeFunctionData(functionFragment: 'allowedToken', values: [BytesLike]): string;
  encodeFunctionData(
    functionFragment: 'changeTokenAddressAndAllow',
    values: [BytesLike, AddressLike]
  ): string;
  encodeFunctionData(functionFragment: 'crossChainManagerAddress', values?: undefined): string;
  encodeFunctionData(
    functionFragment: 'deposit',
    values: [VaultTypes.VaultDepositFEStruct]
  ): string;
  encodeFunctionData(functionFragment: 'depositFeeEnabled', values?: undefined): string;
  encodeFunctionData(functionFragment: 'depositId', values?: undefined): string;
  encodeFunctionData(
    functionFragment: 'depositTo',
    values: [AddressLike, VaultTypes.VaultDepositFEStruct]
  ): string;
  encodeFunctionData(functionFragment: 'emergencyPause', values?: undefined): string;
  encodeFunctionData(functionFragment: 'emergencyUnpause', values?: undefined): string;
  encodeFunctionData(functionFragment: 'enableDepositFee', values: [boolean]): string;
  encodeFunctionData(functionFragment: 'getAllAllowedBroker', values?: undefined): string;
  encodeFunctionData(functionFragment: 'getAllAllowedToken', values?: undefined): string;
  encodeFunctionData(functionFragment: 'getAllowedBroker', values: [BytesLike]): string;
  encodeFunctionData(functionFragment: 'getAllowedToken', values: [BytesLike]): string;
  encodeFunctionData(
    functionFragment: 'getDepositFee',
    values: [AddressLike, VaultTypes.VaultDepositFEStruct]
  ): string;
  encodeFunctionData(functionFragment: 'initialize', values?: undefined): string;
  encodeFunctionData(functionFragment: 'messageTransmitterContract', values?: undefined): string;
  encodeFunctionData(functionFragment: 'owner', values?: undefined): string;
  encodeFunctionData(functionFragment: 'paused', values?: undefined): string;
  encodeFunctionData(
    functionFragment: 'rebalanceBurn',
    values: [RebalanceTypes.RebalanceBurnCCDataStruct]
  ): string;
  encodeFunctionData(
    functionFragment: 'rebalanceMint',
    values: [RebalanceTypes.RebalanceMintCCDataStruct]
  ): string;
  encodeFunctionData(functionFragment: 'renounceOwnership', values?: undefined): string;
  encodeFunctionData(functionFragment: 'setAllowedBroker', values: [BytesLike, boolean]): string;
  encodeFunctionData(functionFragment: 'setAllowedToken', values: [BytesLike, boolean]): string;
  encodeFunctionData(functionFragment: 'setCrossChainManager', values: [AddressLike]): string;
  encodeFunctionData(
    functionFragment: 'setRebalanceMessengerContract',
    values: [AddressLike]
  ): string;
  encodeFunctionData(functionFragment: 'setTokenMessengerContract', values: [AddressLike]): string;
  encodeFunctionData(functionFragment: 'tokenMessengerContract', values?: undefined): string;
  encodeFunctionData(functionFragment: 'transferOwnership', values: [AddressLike]): string;
  encodeFunctionData(
    functionFragment: 'withdraw',
    values: [VaultTypes.VaultWithdrawStruct]
  ): string;

  decodeFunctionResult(functionFragment: 'allowedToken', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'changeTokenAddressAndAllow', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'crossChainManagerAddress', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'deposit', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'depositFeeEnabled', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'depositId', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'depositTo', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'emergencyPause', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'emergencyUnpause', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'enableDepositFee', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'getAllAllowedBroker', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'getAllAllowedToken', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'getAllowedBroker', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'getAllowedToken', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'getDepositFee', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'initialize', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'messageTransmitterContract', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'owner', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'paused', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'rebalanceBurn', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'rebalanceMint', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'renounceOwnership', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'setAllowedBroker', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'setAllowedToken', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'setCrossChainManager', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'setRebalanceMessengerContract', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'setTokenMessengerContract', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'tokenMessengerContract', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'transferOwnership', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'withdraw', data: BytesLike): Result;
}

export namespace AccountDepositEvent {
  export type InputTuple = [
    accountId: BytesLike,
    userAddress: AddressLike,
    depositNonce: BigNumberish,
    tokenHash: BytesLike,
    tokenAmount: BigNumberish
  ];
  export type OutputTuple = [
    accountId: string,
    userAddress: string,
    depositNonce: bigint,
    tokenHash: string,
    tokenAmount: bigint
  ];
  export interface OutputObject {
    accountId: string;
    userAddress: string;
    depositNonce: bigint;
    tokenHash: string;
    tokenAmount: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace AccountDepositToEvent {
  export type InputTuple = [
    accountId: BytesLike,
    userAddress: AddressLike,
    depositNonce: BigNumberish,
    tokenHash: BytesLike,
    tokenAmount: BigNumberish
  ];
  export type OutputTuple = [
    accountId: string,
    userAddress: string,
    depositNonce: bigint,
    tokenHash: string,
    tokenAmount: bigint
  ];
  export interface OutputObject {
    accountId: string;
    userAddress: string;
    depositNonce: bigint;
    tokenHash: string;
    tokenAmount: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace AccountWithdrawEvent {
  export type InputTuple = [
    accountId: BytesLike,
    withdrawNonce: BigNumberish,
    brokerHash: BytesLike,
    sender: AddressLike,
    receiver: AddressLike,
    tokenHash: BytesLike,
    tokenAmount: BigNumberish,
    fee: BigNumberish
  ];
  export type OutputTuple = [
    accountId: string,
    withdrawNonce: bigint,
    brokerHash: string,
    sender: string,
    receiver: string,
    tokenHash: string,
    tokenAmount: bigint,
    fee: bigint
  ];
  export interface OutputObject {
    accountId: string;
    withdrawNonce: bigint;
    brokerHash: string;
    sender: string;
    receiver: string;
    tokenHash: string;
    tokenAmount: bigint;
    fee: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace ChangeCrossChainManagerEvent {
  export type InputTuple = [oldAddress: AddressLike, newAddress: AddressLike];
  export type OutputTuple = [oldAddress: string, newAddress: string];
  export interface OutputObject {
    oldAddress: string;
    newAddress: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace ChangeTokenAddressAndAllowEvent {
  export type InputTuple = [_tokenHash: BytesLike, _tokenAddress: AddressLike];
  export type OutputTuple = [_tokenHash: string, _tokenAddress: string];
  export interface OutputObject {
    _tokenHash: string;
    _tokenAddress: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace InitializedEvent {
  export type InputTuple = [version: BigNumberish];
  export type OutputTuple = [version: bigint];
  export interface OutputObject {
    version: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace OwnershipTransferredEvent {
  export type InputTuple = [previousOwner: AddressLike, newOwner: AddressLike];
  export type OutputTuple = [previousOwner: string, newOwner: string];
  export interface OutputObject {
    previousOwner: string;
    newOwner: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace PausedEvent {
  export type InputTuple = [account: AddressLike];
  export type OutputTuple = [account: string];
  export interface OutputObject {
    account: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace SetAllowedBrokerEvent {
  export type InputTuple = [_brokerHash: BytesLike, _allowed: boolean];
  export type OutputTuple = [_brokerHash: string, _allowed: boolean];
  export interface OutputObject {
    _brokerHash: string;
    _allowed: boolean;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace SetAllowedTokenEvent {
  export type InputTuple = [_tokenHash: BytesLike, _allowed: boolean];
  export type OutputTuple = [_tokenHash: string, _allowed: boolean];
  export interface OutputObject {
    _tokenHash: string;
    _allowed: boolean;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace UnpausedEvent {
  export type InputTuple = [account: AddressLike];
  export type OutputTuple = [account: string];
  export interface OutputObject {
    account: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface Vault extends BaseContract {
  connect(runner?: ContractRunner | null): Vault;
  waitForDeployment(): Promise<this>;

  interface: VaultInterface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(event?: TCEvent): Promise<this>;

  allowedToken: TypedContractMethod<[arg0: BytesLike], [string], 'view'>;

  changeTokenAddressAndAllow: TypedContractMethod<
    [_tokenHash: BytesLike, _tokenAddress: AddressLike],
    [void],
    'nonpayable'
  >;

  crossChainManagerAddress: TypedContractMethod<[], [string], 'view'>;

  deposit: TypedContractMethod<[data: VaultTypes.VaultDepositFEStruct], [void], 'payable'>;

  depositFeeEnabled: TypedContractMethod<[], [boolean], 'view'>;

  depositId: TypedContractMethod<[], [bigint], 'view'>;

  depositTo: TypedContractMethod<
    [receiver: AddressLike, data: VaultTypes.VaultDepositFEStruct],
    [void],
    'payable'
  >;

  emergencyPause: TypedContractMethod<[], [void], 'nonpayable'>;

  emergencyUnpause: TypedContractMethod<[], [void], 'nonpayable'>;

  enableDepositFee: TypedContractMethod<[_enabled: boolean], [void], 'nonpayable'>;

  getAllAllowedBroker: TypedContractMethod<[], [string[]], 'view'>;

  getAllAllowedToken: TypedContractMethod<[], [string[]], 'view'>;

  getAllowedBroker: TypedContractMethod<[_brokerHash: BytesLike], [boolean], 'view'>;

  getAllowedToken: TypedContractMethod<[_tokenHash: BytesLike], [string], 'view'>;

  getDepositFee: TypedContractMethod<
    [receiver: AddressLike, data: VaultTypes.VaultDepositFEStruct],
    [bigint],
    'view'
  >;

  initialize: TypedContractMethod<[], [void], 'nonpayable'>;

  messageTransmitterContract: TypedContractMethod<[], [string], 'view'>;

  owner: TypedContractMethod<[], [string], 'view'>;

  paused: TypedContractMethod<[], [boolean], 'view'>;

  rebalanceBurn: TypedContractMethod<
    [data: RebalanceTypes.RebalanceBurnCCDataStruct],
    [void],
    'nonpayable'
  >;

  rebalanceMint: TypedContractMethod<
    [data: RebalanceTypes.RebalanceMintCCDataStruct],
    [void],
    'nonpayable'
  >;

  renounceOwnership: TypedContractMethod<[], [void], 'nonpayable'>;

  setAllowedBroker: TypedContractMethod<
    [_brokerHash: BytesLike, _allowed: boolean],
    [void],
    'nonpayable'
  >;

  setAllowedToken: TypedContractMethod<
    [_tokenHash: BytesLike, _allowed: boolean],
    [void],
    'nonpayable'
  >;

  setCrossChainManager: TypedContractMethod<
    [_crossChainManagerAddress: AddressLike],
    [void],
    'nonpayable'
  >;

  setRebalanceMessengerContract: TypedContractMethod<
    [_rebalanceMessengerContract: AddressLike],
    [void],
    'nonpayable'
  >;

  setTokenMessengerContract: TypedContractMethod<
    [_tokenMessengerContract: AddressLike],
    [void],
    'nonpayable'
  >;

  tokenMessengerContract: TypedContractMethod<[], [string], 'view'>;

  transferOwnership: TypedContractMethod<[newOwner: AddressLike], [void], 'nonpayable'>;

  withdraw: TypedContractMethod<[data: VaultTypes.VaultWithdrawStruct], [void], 'nonpayable'>;

  getFunction<T extends ContractMethod = ContractMethod>(key: string | FunctionFragment): T;

  getFunction(
    nameOrSignature: 'allowedToken'
  ): TypedContractMethod<[arg0: BytesLike], [string], 'view'>;
  getFunction(
    nameOrSignature: 'changeTokenAddressAndAllow'
  ): TypedContractMethod<[_tokenHash: BytesLike, _tokenAddress: AddressLike], [void], 'nonpayable'>;
  getFunction(
    nameOrSignature: 'crossChainManagerAddress'
  ): TypedContractMethod<[], [string], 'view'>;
  getFunction(
    nameOrSignature: 'deposit'
  ): TypedContractMethod<[data: VaultTypes.VaultDepositFEStruct], [void], 'payable'>;
  getFunction(nameOrSignature: 'depositFeeEnabled'): TypedContractMethod<[], [boolean], 'view'>;
  getFunction(nameOrSignature: 'depositId'): TypedContractMethod<[], [bigint], 'view'>;
  getFunction(
    nameOrSignature: 'depositTo'
  ): TypedContractMethod<
    [receiver: AddressLike, data: VaultTypes.VaultDepositFEStruct],
    [void],
    'payable'
  >;
  getFunction(nameOrSignature: 'emergencyPause'): TypedContractMethod<[], [void], 'nonpayable'>;
  getFunction(nameOrSignature: 'emergencyUnpause'): TypedContractMethod<[], [void], 'nonpayable'>;
  getFunction(
    nameOrSignature: 'enableDepositFee'
  ): TypedContractMethod<[_enabled: boolean], [void], 'nonpayable'>;
  getFunction(nameOrSignature: 'getAllAllowedBroker'): TypedContractMethod<[], [string[]], 'view'>;
  getFunction(nameOrSignature: 'getAllAllowedToken'): TypedContractMethod<[], [string[]], 'view'>;
  getFunction(
    nameOrSignature: 'getAllowedBroker'
  ): TypedContractMethod<[_brokerHash: BytesLike], [boolean], 'view'>;
  getFunction(
    nameOrSignature: 'getAllowedToken'
  ): TypedContractMethod<[_tokenHash: BytesLike], [string], 'view'>;
  getFunction(
    nameOrSignature: 'getDepositFee'
  ): TypedContractMethod<
    [receiver: AddressLike, data: VaultTypes.VaultDepositFEStruct],
    [bigint],
    'view'
  >;
  getFunction(nameOrSignature: 'initialize'): TypedContractMethod<[], [void], 'nonpayable'>;
  getFunction(
    nameOrSignature: 'messageTransmitterContract'
  ): TypedContractMethod<[], [string], 'view'>;
  getFunction(nameOrSignature: 'owner'): TypedContractMethod<[], [string], 'view'>;
  getFunction(nameOrSignature: 'paused'): TypedContractMethod<[], [boolean], 'view'>;
  getFunction(
    nameOrSignature: 'rebalanceBurn'
  ): TypedContractMethod<[data: RebalanceTypes.RebalanceBurnCCDataStruct], [void], 'nonpayable'>;
  getFunction(
    nameOrSignature: 'rebalanceMint'
  ): TypedContractMethod<[data: RebalanceTypes.RebalanceMintCCDataStruct], [void], 'nonpayable'>;
  getFunction(nameOrSignature: 'renounceOwnership'): TypedContractMethod<[], [void], 'nonpayable'>;
  getFunction(
    nameOrSignature: 'setAllowedBroker'
  ): TypedContractMethod<[_brokerHash: BytesLike, _allowed: boolean], [void], 'nonpayable'>;
  getFunction(
    nameOrSignature: 'setAllowedToken'
  ): TypedContractMethod<[_tokenHash: BytesLike, _allowed: boolean], [void], 'nonpayable'>;
  getFunction(
    nameOrSignature: 'setCrossChainManager'
  ): TypedContractMethod<[_crossChainManagerAddress: AddressLike], [void], 'nonpayable'>;
  getFunction(
    nameOrSignature: 'setRebalanceMessengerContract'
  ): TypedContractMethod<[_rebalanceMessengerContract: AddressLike], [void], 'nonpayable'>;
  getFunction(
    nameOrSignature: 'setTokenMessengerContract'
  ): TypedContractMethod<[_tokenMessengerContract: AddressLike], [void], 'nonpayable'>;
  getFunction(nameOrSignature: 'tokenMessengerContract'): TypedContractMethod<[], [string], 'view'>;
  getFunction(
    nameOrSignature: 'transferOwnership'
  ): TypedContractMethod<[newOwner: AddressLike], [void], 'nonpayable'>;
  getFunction(
    nameOrSignature: 'withdraw'
  ): TypedContractMethod<[data: VaultTypes.VaultWithdrawStruct], [void], 'nonpayable'>;

  getEvent(
    key: 'AccountDeposit'
  ): TypedContractEvent<
    AccountDepositEvent.InputTuple,
    AccountDepositEvent.OutputTuple,
    AccountDepositEvent.OutputObject
  >;
  getEvent(
    key: 'AccountDepositTo'
  ): TypedContractEvent<
    AccountDepositToEvent.InputTuple,
    AccountDepositToEvent.OutputTuple,
    AccountDepositToEvent.OutputObject
  >;
  getEvent(
    key: 'AccountWithdraw'
  ): TypedContractEvent<
    AccountWithdrawEvent.InputTuple,
    AccountWithdrawEvent.OutputTuple,
    AccountWithdrawEvent.OutputObject
  >;
  getEvent(
    key: 'ChangeCrossChainManager'
  ): TypedContractEvent<
    ChangeCrossChainManagerEvent.InputTuple,
    ChangeCrossChainManagerEvent.OutputTuple,
    ChangeCrossChainManagerEvent.OutputObject
  >;
  getEvent(
    key: 'ChangeTokenAddressAndAllow'
  ): TypedContractEvent<
    ChangeTokenAddressAndAllowEvent.InputTuple,
    ChangeTokenAddressAndAllowEvent.OutputTuple,
    ChangeTokenAddressAndAllowEvent.OutputObject
  >;
  getEvent(
    key: 'Initialized'
  ): TypedContractEvent<
    InitializedEvent.InputTuple,
    InitializedEvent.OutputTuple,
    InitializedEvent.OutputObject
  >;
  getEvent(
    key: 'OwnershipTransferred'
  ): TypedContractEvent<
    OwnershipTransferredEvent.InputTuple,
    OwnershipTransferredEvent.OutputTuple,
    OwnershipTransferredEvent.OutputObject
  >;
  getEvent(
    key: 'Paused'
  ): TypedContractEvent<PausedEvent.InputTuple, PausedEvent.OutputTuple, PausedEvent.OutputObject>;
  getEvent(
    key: 'SetAllowedBroker'
  ): TypedContractEvent<
    SetAllowedBrokerEvent.InputTuple,
    SetAllowedBrokerEvent.OutputTuple,
    SetAllowedBrokerEvent.OutputObject
  >;
  getEvent(
    key: 'SetAllowedToken'
  ): TypedContractEvent<
    SetAllowedTokenEvent.InputTuple,
    SetAllowedTokenEvent.OutputTuple,
    SetAllowedTokenEvent.OutputObject
  >;
  getEvent(
    key: 'Unpaused'
  ): TypedContractEvent<
    UnpausedEvent.InputTuple,
    UnpausedEvent.OutputTuple,
    UnpausedEvent.OutputObject
  >;

  filters: {
    'AccountDeposit(bytes32,address,uint64,bytes32,uint128)': TypedContractEvent<
      AccountDepositEvent.InputTuple,
      AccountDepositEvent.OutputTuple,
      AccountDepositEvent.OutputObject
    >;
    AccountDeposit: TypedContractEvent<
      AccountDepositEvent.InputTuple,
      AccountDepositEvent.OutputTuple,
      AccountDepositEvent.OutputObject
    >;

    'AccountDepositTo(bytes32,address,uint64,bytes32,uint128)': TypedContractEvent<
      AccountDepositToEvent.InputTuple,
      AccountDepositToEvent.OutputTuple,
      AccountDepositToEvent.OutputObject
    >;
    AccountDepositTo: TypedContractEvent<
      AccountDepositToEvent.InputTuple,
      AccountDepositToEvent.OutputTuple,
      AccountDepositToEvent.OutputObject
    >;

    'AccountWithdraw(bytes32,uint64,bytes32,address,address,bytes32,uint128,uint128)': TypedContractEvent<
      AccountWithdrawEvent.InputTuple,
      AccountWithdrawEvent.OutputTuple,
      AccountWithdrawEvent.OutputObject
    >;
    AccountWithdraw: TypedContractEvent<
      AccountWithdrawEvent.InputTuple,
      AccountWithdrawEvent.OutputTuple,
      AccountWithdrawEvent.OutputObject
    >;

    'ChangeCrossChainManager(address,address)': TypedContractEvent<
      ChangeCrossChainManagerEvent.InputTuple,
      ChangeCrossChainManagerEvent.OutputTuple,
      ChangeCrossChainManagerEvent.OutputObject
    >;
    ChangeCrossChainManager: TypedContractEvent<
      ChangeCrossChainManagerEvent.InputTuple,
      ChangeCrossChainManagerEvent.OutputTuple,
      ChangeCrossChainManagerEvent.OutputObject
    >;

    'ChangeTokenAddressAndAllow(bytes32,address)': TypedContractEvent<
      ChangeTokenAddressAndAllowEvent.InputTuple,
      ChangeTokenAddressAndAllowEvent.OutputTuple,
      ChangeTokenAddressAndAllowEvent.OutputObject
    >;
    ChangeTokenAddressAndAllow: TypedContractEvent<
      ChangeTokenAddressAndAllowEvent.InputTuple,
      ChangeTokenAddressAndAllowEvent.OutputTuple,
      ChangeTokenAddressAndAllowEvent.OutputObject
    >;

    'Initialized(uint8)': TypedContractEvent<
      InitializedEvent.InputTuple,
      InitializedEvent.OutputTuple,
      InitializedEvent.OutputObject
    >;
    Initialized: TypedContractEvent<
      InitializedEvent.InputTuple,
      InitializedEvent.OutputTuple,
      InitializedEvent.OutputObject
    >;

    'OwnershipTransferred(address,address)': TypedContractEvent<
      OwnershipTransferredEvent.InputTuple,
      OwnershipTransferredEvent.OutputTuple,
      OwnershipTransferredEvent.OutputObject
    >;
    OwnershipTransferred: TypedContractEvent<
      OwnershipTransferredEvent.InputTuple,
      OwnershipTransferredEvent.OutputTuple,
      OwnershipTransferredEvent.OutputObject
    >;

    'Paused(address)': TypedContractEvent<
      PausedEvent.InputTuple,
      PausedEvent.OutputTuple,
      PausedEvent.OutputObject
    >;
    Paused: TypedContractEvent<
      PausedEvent.InputTuple,
      PausedEvent.OutputTuple,
      PausedEvent.OutputObject
    >;

    'SetAllowedBroker(bytes32,bool)': TypedContractEvent<
      SetAllowedBrokerEvent.InputTuple,
      SetAllowedBrokerEvent.OutputTuple,
      SetAllowedBrokerEvent.OutputObject
    >;
    SetAllowedBroker: TypedContractEvent<
      SetAllowedBrokerEvent.InputTuple,
      SetAllowedBrokerEvent.OutputTuple,
      SetAllowedBrokerEvent.OutputObject
    >;

    'SetAllowedToken(bytes32,bool)': TypedContractEvent<
      SetAllowedTokenEvent.InputTuple,
      SetAllowedTokenEvent.OutputTuple,
      SetAllowedTokenEvent.OutputObject
    >;
    SetAllowedToken: TypedContractEvent<
      SetAllowedTokenEvent.InputTuple,
      SetAllowedTokenEvent.OutputTuple,
      SetAllowedTokenEvent.OutputObject
    >;

    'Unpaused(address)': TypedContractEvent<
      UnpausedEvent.InputTuple,
      UnpausedEvent.OutputTuple,
      UnpausedEvent.OutputObject
    >;
    Unpaused: TypedContractEvent<
      UnpausedEvent.InputTuple,
      UnpausedEvent.OutputTuple,
      UnpausedEvent.OutputObject
    >;
  };
}
