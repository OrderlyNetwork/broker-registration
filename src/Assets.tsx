import { Button, Callout, DropdownMenu, Flex, Heading, Tabs, Text, TextField } from '@radix-ui/themes';
import { useConnectWallet, useSetChain } from '@web3-onboard/react';
import { BrowserProvider, formatUnits, parseUnits, solidityPackedKeccak256 } from 'ethers';
import { FC, useEffect, useRef, useState } from 'react';

import { NativeUSDC, NativeUSDC__factory, Vault__factory } from './abi';
import { VaultTypes } from './abi/Vault';
import {
  getUSDCAddress,
  getVaultAddress,
  delegateDeposit,
  delegateWithdraw,
  getClientHolding,
  delegateSettlePnL,
  usdFormatter,
  settlePnL,
  getUnsettledPnL,
  withdraw,
  SupportedChainIds,
  deposit,
  getUSDCDecimals,
  getWithdrawFee,
  supportedChains,
  transfer,
  delegateTransfer,
  getAssetHistory,
  type AssetHistoryItem,
  isTestnet
} from './helpers';
import { useToast } from './Toast';

export const Assets: FC<{
  brokerId: string;
  accountId: string;
  contractAddress: string;
  showEOA: boolean;
  orderlyKey?: Uint8Array;
}> = ({ brokerId, accountId, contractAddress, showEOA, orderlyKey }) => {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'transfer'>('deposit');
  const [amount, setAmount] = useState<string>('');
  const [receiverAccountId, setReceiverAccountId] = useState<string>('');
  const [balance, setBalance] = useState<bigint>();
  const [allowance, setAllowance] = useState<bigint>();
  const [vaultBalance, setVaultBalance] = useState<number>();
  const [usdcContract, setUsdcContract] = useState<NativeUSDC>();
  const [unsettledPnL, setUnsettledPnL] = useState<number>();
  const [withdrawFee, setWithdrawFee] = useState<number>();
  const [history, setHistory] = useState<AssetHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const hasLoadedHistoryRef = useRef<boolean>(false);

  const [{ wallet }] = useConnectWallet();
  const [{ connectedChain }, setChain] = useSetChain();
  const { showToast } = useToast();

  const usdcDecimals = connectedChain
    ? getUSDCDecimals(connectedChain.id as SupportedChainIds)
    : 6;

  let needsApproval = false;
  if (allowance != null && amount != null && connectedChain) {
    try {
      needsApproval = allowance < parseUnits(amount, usdcDecimals);
    } catch {
      // NaN
    }
  }

  const chainIcon =
    supportedChains.find(({ id }) => id === connectedChain?.id)?.icon ?? '/assets/questionmark.svg';
  const chainLabel = supportedChains.find(({ id }) => id === connectedChain?.id)?.label ?? 'Unknown';

  const selectChain = (chainId: string) => () => {
    const chain = supportedChains.find(({ id }) => id === chainId);
    setChain({
      chainId
    });
    if (chain) {
      showToast(`Switched to ${chain.label}`);
    }
  };

  const netWithdrawAmount =
    amount && withdrawFee != null
      ? Math.max(0, parseFloat(amount) - withdrawFee)
      : undefined;

  useEffect(() => {
    async function run() {
      if (!wallet || !connectedChain) {
        setUsdcContract(undefined);
        return;
      }
      const ethersProvider = new BrowserProvider(wallet.provider);
      const signer = await ethersProvider.getSigner();
      setUsdcContract(
        NativeUSDC__factory.connect(getUSDCAddress(connectedChain.id as SupportedChainIds), signer)
      );
    }
    run();
  }, [wallet, connectedChain]);

  useEffect(() => {
    if (!wallet || !usdcContract || !connectedChain) {
      setBalance(undefined);
      setAllowance(undefined);
      return;
    }
    const fetchBalanceAndAllowance = async () => {
      if (!wallet || !usdcContract || !connectedChain) {
        setBalance(undefined);
        setAllowance(undefined);
        return;
      }
      const address = wallet.accounts[0].address;
      usdcContract.balanceOf(address).then(setBalance);
      usdcContract
        .allowance(address, getVaultAddress(connectedChain.id as SupportedChainIds))
        .then(setAllowance);
    };
    const interval = setInterval(fetchBalanceAndAllowance, 5_000);
    fetchBalanceAndAllowance();
    return () => clearInterval(interval);
  }, [wallet, usdcContract, connectedChain]);


  useEffect(() => {
    if (!connectedChain || !orderlyKey) {
      return;
    }
    const fetchVaultBalance = async () => {
      if (!connectedChain || !orderlyKey) {
        return;
      }
      getClientHolding(connectedChain.id as SupportedChainIds, accountId, orderlyKey).then(
        setVaultBalance
      );
    };
    const interval = setInterval(fetchVaultBalance, 5_000);
    fetchVaultBalance();
    return () => clearInterval(interval);
  }, [connectedChain, accountId, orderlyKey]);

  useEffect(() => {
    if (!connectedChain || !orderlyKey) {
      return;
    }
    const fetchUnsettledPnL = async () => {
      if (!connectedChain || !orderlyKey) {
        return;
      }
      getUnsettledPnL(connectedChain.id as SupportedChainIds, accountId, orderlyKey).then(
        setUnsettledPnL
      );
    };
    const interval = setInterval(fetchUnsettledPnL, 5_000);
    fetchUnsettledPnL();
    return () => clearInterval(interval);
  }, [connectedChain, accountId, orderlyKey]);

  useEffect(() => {
    if (!connectedChain) {
      setWithdrawFee(undefined);
      return;
    }
    const fetchWithdrawFee = async () => {
      if (!connectedChain) {
        setWithdrawFee(undefined);
        return;
      }
      const fee = await getWithdrawFee(connectedChain.id as SupportedChainIds);
      setWithdrawFee(fee);
    };
    fetchWithdrawFee();
  }, [connectedChain]);

  useEffect(() => {
    if (!connectedChain || !orderlyKey || (activeTab !== 'deposit' && activeTab !== 'withdraw')) {
      setHistory([]);
      setHistoryLoading(false);
      hasLoadedHistoryRef.current = false;
      return;
    }
    let isMounted = true;
    const fetchHistory = async () => {
      if (!connectedChain || !orderlyKey || !isMounted) {
        return;
      }
      if (!hasLoadedHistoryRef.current) {
        setHistoryLoading(true);
      }
      try {
        const side = activeTab === 'deposit' ? 'DEPOSIT' : 'WITHDRAW';
        const response = await getAssetHistory(
          connectedChain.id as SupportedChainIds,
          accountId,
          orderlyKey,
          side
        );
        if (isMounted) {
          setHistory(response.data.rows);
          hasLoadedHistoryRef.current = true;
        }
      } catch (error) {
        console.error('Failed to fetch history:', error);
        if (isMounted) {
          if (!hasLoadedHistoryRef.current) {
            setHistory([]);
          }
        }
      } finally {
        if (isMounted) {
          setHistoryLoading(false);
        }
      }
    };
    hasLoadedHistoryRef.current = false;
    fetchHistory();
    const interval = setInterval(fetchHistory, 10_000); // Refresh every 10 seconds
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [connectedChain, accountId, orderlyKey, activeTab]);

  const handleSettlePnL = async () => {
    if (!wallet || !connectedChain || !brokerId || !orderlyKey) return;
    try {
      if (showEOA) {
        await settlePnL(
          wallet,
          connectedChain.id as SupportedChainIds,
          brokerId,
          accountId,
          orderlyKey
        );
      } else {
        await delegateSettlePnL(
          wallet,
          connectedChain.id as SupportedChainIds,
          brokerId,
          contractAddress,
          accountId,
          orderlyKey
        );
      }
      showToast('Settle PnL request accepted and is being processed. This may take a while.');
      if (connectedChain && orderlyKey) {
        setTimeout(async () => {
          const pnl = await getUnsettledPnL(
            connectedChain.id as SupportedChainIds,
            accountId,
            orderlyKey
          );
          setUnsettledPnL(pnl);
        }, 2000);
      }
    } catch (error) {
      showToast(`Failed to settle PnL: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  const handleDeposit = async () => {
    if (
      !wallet ||
      !amount ||
      !usdcContract ||
      allowance == null ||
      !connectedChain ||
      !brokerId ||
      !balance
    )
      return;
    try {
      const amountBN = parseUnits(amount, usdcDecimals);
      if (balance < amountBN) return;
      
      const isWalletConnect = wallet.label?.toLowerCase().includes('walletconnect') ?? false;
      console.log('isWalletConnect', isWalletConnect);
      
      if (allowance < amountBN) {
        if (isWalletConnect) {
          try {
            const provider = new BrowserProvider(wallet.provider);
            const signer = await provider.getSigner();
            
            const approveTxData = await usdcContract.approve.populateTransaction(
              getVaultAddress(connectedChain.id as SupportedChainIds),
              amountBN
            );
            
            const vaultContract = Vault__factory.connect(getVaultAddress(connectedChain.id as SupportedChainIds), signer);
            
            const depositInput = {
              brokerHash: solidityPackedKeccak256(['string'], [brokerId]),
              tokenAmount: amountBN.toString(),
              tokenHash: solidityPackedKeccak256(['string'], ['USDC']),
              accountId
            } satisfies VaultTypes.VaultDepositFEStruct;
            
            const depositFee = await vaultContract.getDepositFee(
              showEOA ? wallet.accounts[0].address : contractAddress,
              depositInput
            );
            
            const depositTxData = showEOA
              ? await vaultContract.deposit.populateTransaction(depositInput, { value: depositFee })
              : await vaultContract.depositTo.populateTransaction(contractAddress, depositInput, { value: depositFee });

            const toRpcTx = (tx: typeof approveTxData) => {
              const rpcTx: Record<string, string> = {
                from: wallet.accounts[0].address,
                to: tx.to || '',
                data: tx.data || '0x',
                value: tx.value ? `0x${tx.value.toString(16)}` : '0x0',
              };
              
              if (tx.gasLimit) {
                rpcTx.gas = `0x${tx.gasLimit.toString(16)}`;
              }
              if (tx.gasPrice) {
                rpcTx.gasPrice = `0x${tx.gasPrice.toString(16)}`;
              }
              if (tx.maxFeePerGas) {
                rpcTx.maxFeePerGas = `0x${tx.maxFeePerGas.toString(16)}`;
              }
              if (tx.maxPriorityFeePerGas) {
                rpcTx.maxPriorityFeePerGas = `0x${tx.maxPriorityFeePerGas.toString(16)}`;
              }
              
              return rpcTx;
            };

            const approveTxRpc = toRpcTx(approveTxData);
            const depositTxRpc = toRpcTx(depositTxData);

            provider.send('eth_sendTransaction', [approveTxRpc]).catch(() => {});
            provider.send('eth_sendTransaction', [depositTxRpc]).catch(() => {});
            
            showToast('Approve and deposit transactions submitted. Please confirm in your multisig wallet.');
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorString = String(error).toLowerCase();
            if (
              errorMessage.toLowerCase().includes('allowance') ||
              errorMessage.toLowerCase().includes('transfer amount exceeds') ||
              errorString.includes('erc20') ||
              errorString.includes('exceeds allowance')
            ) {
              showToast('Approve and deposit transactions submitted. Please confirm in your multisig wallet.');
            } else {
              throw error;
            }
          }
        } else {
          const approveTx = await usdcContract.approve(
            getVaultAddress(connectedChain.id as SupportedChainIds),
            amountBN
          );
          await approveTx.wait();
          const allow = await usdcContract.allowance(
            wallet.accounts[0].address,
            getVaultAddress(connectedChain.id as SupportedChainIds)
          );
          setAllowance(allow);
          showToast('Approval successful. You can now deposit.');
        }
      } else {
        if (showEOA) {
          await deposit(
            wallet,
            connectedChain.id as SupportedChainIds,
            brokerId,
            amountBN.toString(),
            accountId
          );
        } else {
          await delegateDeposit(
            wallet,
            connectedChain.id as SupportedChainIds,
            brokerId,
            contractAddress,
            amountBN.toString(),
            contractAddress,
            accountId
          );
        }
        showToast('Deposit request accepted and is being processed. This may take a while.');
      }
    } catch (error) {
      showToast(`Deposit failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  const handleWithdraw = async () => {
    if (!wallet || !connectedChain || !orderlyKey || !amount || !vaultBalance) return;
    try {
      const amountBN = parseUnits(amount, 6);
      if (parseUnits(String(vaultBalance), 6) < amountBN) return;
      if (withdrawFee != null && parseFloat(amount) <= withdrawFee) return;
      if (showEOA) {
        await withdraw(
          wallet,
          connectedChain.id as SupportedChainIds,
          brokerId,
          accountId,
          orderlyKey,
          amountBN.toString(),
          wallet.accounts[0].address
        );
      } else {
        await delegateWithdraw(
          wallet,
          connectedChain.id as SupportedChainIds,
          brokerId,
          contractAddress,
          accountId,
          orderlyKey,
          amountBN.toString(),
          contractAddress
        );
      }
      showToast('Withdraw request accepted and is being processed. This may take a while.');
    } catch (error) {
      showToast(`Withdraw failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  const handleTransfer = async () => {
    if (!wallet || !connectedChain || !orderlyKey || !amount || !receiverAccountId || !vaultBalance) return;
    try {
      const amountBN = parseUnits(amount, 6);
      if (parseUnits(String(vaultBalance), 6) < amountBN) return;
      if (showEOA) {
        await transfer(
          wallet,
          connectedChain.id as SupportedChainIds,
          accountId,
          orderlyKey,
          receiverAccountId,
          amountBN.toString()
        );
      } else {
        await delegateTransfer(
          wallet,
          connectedChain.id as SupportedChainIds,
          contractAddress,
          accountId,
          orderlyKey,
          receiverAccountId,
          amountBN.toString()
        );
      }
      showToast('Transfer request accepted and is being processed. This may take a while.');
    } catch (error) {
      showToast(`Transfer failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  const maxDepositAmount =
    balance != null ? Number(formatUnits(balance, usdcDecimals)) : undefined;
  const maxWithdrawAmount = vaultBalance != null ? vaultBalance : undefined;

  const requiresSettlement = 
    activeTab === 'withdraw' &&
    amount &&
    vaultBalance != null &&
    unsettledPnL != null &&
    unsettledPnL !== 0 &&
    parseFloat(amount) > vaultBalance + unsettledPnL;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusColor = (status: AssetHistoryItem['trans_status']) => {
    switch (status) {
      case 'COMPLETED':
        return 'green';
      case 'FAILED':
        return 'red';
      case 'PROCESSING':
      case 'CONFIRM':
      case 'PENDING_REBALANCE':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  const getExplorerUrl = (txHash: string) => {
    if (!connectedChain) return '#';
    const baseUrl = isTestnet(connectedChain.id)
      ? 'https://testnet-explorer.orderly.org'
      : 'https://explorer.orderly.network';
    return `${baseUrl}/tx/${txHash}`;
  };

  const getChainLabel = (chainId: string) => {
    const chainIdHex = chainId.startsWith('0x') 
      ? chainId 
      : `0x${Number(chainId).toString(16)}`;
    const chain = supportedChains.find(({ id }) => id.toLowerCase() === chainIdHex.toLowerCase());
    return chain ? chain.label : `Chain ${chainId}`;
  };

  return (
    <Flex style={{ margin: '1.5rem', maxWidth: '600px', width: '100%' }} direction="column" gap="4">
      <Heading>Assets</Heading>

      {!orderlyKey && (
        <Callout.Root variant="outline">
          <Callout.Text>
            You need to create an Orderly key in order to be able to display your Orderly balance.
          </Callout.Text>
        </Callout.Root>
      )}

      {/* Network Selection */}
      {connectedChain && (
        <Flex direction="column" gap="2">
          <Text size="2" weight="medium">
            Network
          </Text>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button variant="outline" style={{ width: '100%', justifyContent: 'space-between' }}>
                <Flex align="center" gap="2">
                  <img
                    src={chainIcon}
                    alt="connected chain"
                    style={{ height: '1.5rem', width: '1.5rem' }}
                  />
                  {chainLabel}
                </Flex>
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Label>Mainnet</DropdownMenu.Label>
              {supportedChains
                .filter(({ network }) => network === 'mainnet')
                .map(({ id, icon, label }) => (
                  <DropdownMenu.Item
                    key={id}
                    onSelect={selectChain(id)}
                    style={{
                      backgroundColor: connectedChain?.id === id ? 'lightgrey' : undefined,
                      color: connectedChain?.id === id ? 'black' : undefined,
                      fontWeight: connectedChain?.id === id ? '600' : undefined
                    }}
                  >
                    <img
                      src={icon}
                      alt={label}
                      style={{ marginRight: '0.3rem', height: '1.8rem', width: '1.8rem' }}
                    />
                    {label}
                  </DropdownMenu.Item>
                ))}
              <DropdownMenu.Separator />
              <DropdownMenu.Label>Testnet</DropdownMenu.Label>
              {supportedChains
                .filter(({ network }) => network === 'testnet')
                .map(({ id, icon, label }) => (
                  <DropdownMenu.Item
                    key={id}
                    onSelect={selectChain(id)}
                    style={{
                      backgroundColor: connectedChain?.id === id ? 'lightgrey' : undefined,
                      color: connectedChain?.id === id ? 'black' : undefined,
                      fontWeight: connectedChain?.id === id ? '600' : undefined
                    }}
                  >
                    <img
                      src={icon}
                      alt={label}
                      style={{
                        marginRight: '0.3rem',
                        height: '1.8rem',
                        width: '1.8rem',
                        backgroundColor: '#bbb',
                        borderRadius: '50%'
                      }}
                    />
                    {label}
                  </DropdownMenu.Item>
                ))}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Flex>
      )}

      {/* Tabs */}
      <Tabs.Root value={activeTab} onValueChange={(value) => setActiveTab(value as 'deposit' | 'withdraw' | 'transfer')}>
        <Tabs.List>
          <Tabs.Trigger value="deposit">Deposit</Tabs.Trigger>
          <Tabs.Trigger value="withdraw">Withdraw</Tabs.Trigger>
          <Tabs.Trigger value="transfer">Transfer</Tabs.Trigger>
        </Tabs.List>

        {/* Deposit Tab */}
        <Tabs.Content value="deposit">
          <Flex direction="column" gap="4" style={{ paddingTop: '1rem' }}>
            <Flex direction="column" gap="2">
              <Flex justify="between" align="center">
                <Text size="2" weight="medium">
                  Amount
                </Text>
                {maxDepositAmount != null && (
                  <Button
                    variant="ghost"
                    size="1"
                    onClick={() => setAmount(maxDepositAmount.toFixed(6))}
                  >
                    MAX
                  </Button>
                )}
              </Flex>
              <TextField.Root
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(event) => {
                  setAmount(event.target.value);
                }}
                onWheel={(event) => {
                  event.currentTarget.blur();
                }}
              />
              {balance != null && (
                <Text size="1" color="gray">
                  Balance: {usdFormatter.format(Number(formatUnits(balance, usdcDecimals)))}{' '}
                  USDC
                </Text>
              )}
            </Flex>

            <Button
              disabled={
                !wallet ||
                !amount ||
                !usdcContract ||
                allowance == null ||
                !connectedChain ||
                !brokerId ||
                !balance ||
                balance < parseUnits(amount || '0', usdcDecimals)
              }
              onClick={handleDeposit}
              size="3"
            >
              {needsApproval ? 'Approve' : showEOA ? 'Deposit' : 'Deposit to Contract'}
            </Button>

            {/* Deposit History */}
            {activeTab === 'deposit' && (
              <Flex direction="column" gap="2" style={{ marginTop: '2rem' }}>
                <Heading size="4">Deposit History</Heading>
                {historyLoading ? (
                  <Text size="2" color="gray">Loading...</Text>
                ) : history.length === 0 ? (
                  <Text size="2" color="gray">No deposit history</Text>
                ) : (
                  <Flex direction="column" gap="2">
                    {history.map((item) => (
                      <Flex
                        key={item.id}
                        direction="column"
                        gap="1"
                        style={{
                          padding: '0.75rem',
                          border: '1px solid var(--gray-6)',
                          borderRadius: '4px',
                          backgroundColor: 'var(--gray-2)'
                        }}
                      >
                        <Flex justify="between" align="center">
                          <Text size="2" weight="medium">
                            {usdFormatter.format(item.amount)} USDC
                          </Text>
                          <Text size="2" color={getStatusColor(item.trans_status)}>
                            {item.trans_status}
                          </Text>
                        </Flex>
                        <Flex justify="between" align="center">
                          <Flex direction="column" gap="1" align="start">
                            <Text size="1" color="gray">
                              {formatDate(item.created_time)}
                            </Text>
                            <Text size="1" color="gray">
                              {getChainLabel(item.chain_id)}
                            </Text>
                          </Flex>
                          {item.tx_id && (
                            <Text
                              size="1"
                              asChild
                              style={{
                                fontFamily: 'monospace',
                                maxWidth: '200px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              <a
                                href={getExplorerUrl(item.tx_id)}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  color: 'inherit',
                                  textDecoration: 'none',
                                  cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.textDecoration = 'underline';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.textDecoration = 'none';
                                }}
                              >
                                {item.tx_id.slice(0, 10)}...{item.tx_id.slice(-8)}
                              </a>
                            </Text>
                          )}
                        </Flex>
                      </Flex>
                    ))}
                  </Flex>
                )}
              </Flex>
            )}
          </Flex>
        </Tabs.Content>

        {/* Withdraw Tab */}
        <Tabs.Content value="withdraw">
          <Flex direction="column" gap="4" style={{ paddingTop: '1rem' }}>
            <Flex direction="column" gap="2">
              <Flex justify="between" align="center">
                <Text size="2" weight="medium">
                  Amount
                </Text>
                {maxWithdrawAmount != null && (
                  <Button
                    variant="ghost"
                    size="1"
                    onClick={() => setAmount(maxWithdrawAmount.toFixed(6))}
                  >
                    MAX
                  </Button>
                )}
              </Flex>
              <TextField.Root
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(event) => {
                  setAmount(event.target.value);
                }}
                onWheel={(event) => {
                  event.currentTarget.blur();
                }}
              />
              {vaultBalance != null && (
                <Text size="1" color="gray">
                  Available: {usdFormatter.format(vaultBalance)} USDC
                </Text>
              )}
            </Flex>

            {/* Received Quantity (Amount - Fee) */}
            {amount && withdrawFee != null && netWithdrawAmount != null && (
              <Flex direction="column" gap="1">
                <Flex justify="between">
                  <Text size="2" weight="medium">
                    Received Quantity
                  </Text>
                  <Text size="2">{usdFormatter.format(netWithdrawAmount)} USDC</Text>
                </Flex>
              </Flex>
            )}

            {/* Withdraw Fee */}
            {withdrawFee != null && (
              <Flex direction="column" gap="1">
                <Flex justify="between">
                  <Text size="2" weight="medium">
                    Withdraw Fee
                  </Text>
                  <Text size="2">{usdFormatter.format(withdrawFee)} USDC</Text>
                </Flex>
              </Flex>
            )}

            {/* Unsettled PnL  */}
            {requiresSettlement && unsettledPnL != null && (
              <Callout.Root color="yellow" variant="soft">
                <Callout.Text>
                  Unsettled PnL: {usdFormatter.format(unsettledPnL)} USDC. Please settle before
                  withdrawing.
                </Callout.Text>
              </Callout.Root>
            )}

            {/* Warning if amount <= fee */}
            {amount &&
              withdrawFee != null &&
              parseFloat(amount) <= withdrawFee &&
              !requiresSettlement && (
                <Callout.Root color="red" variant="soft">
                  <Callout.Text>
                    Withdraw amount must be greater than the withdraw fee (
                    {usdFormatter.format(withdrawFee)} USDC).
                  </Callout.Text>
                </Callout.Root>
              )}

            <Button
              disabled={
                requiresSettlement
                  ? !wallet || !connectedChain || !brokerId || !orderlyKey
                  : !wallet ||
                    !connectedChain ||
                    !brokerId ||
                    !orderlyKey ||
                    !amount ||
                    !vaultBalance ||
                    parseUnits(String(vaultBalance), 6) < parseUnits(amount || '0', 6) ||
                    (withdrawFee != null && parseFloat(amount) <= withdrawFee)
              }
              onClick={requiresSettlement ? handleSettlePnL : handleWithdraw}
              size="3"
            >
              {requiresSettlement
                ? showEOA
                  ? 'Settle PnL'
                  : 'Settle Delegate PnL'
                : showEOA
                  ? 'Withdraw'
                  : 'Withdraw from Contract'}
            </Button>

            {/* Withdraw History */}
            {activeTab === 'withdraw' && (
              <Flex direction="column" gap="2" style={{ marginTop: '2rem' }}>
                <Heading size="4">Withdraw History</Heading>
                {historyLoading ? (
                  <Text size="2" color="gray">Loading...</Text>
                ) : history.length === 0 ? (
                  <Text size="2" color="gray">No withdraw history</Text>
                ) : (
                  <Flex direction="column" gap="2">
                    {history.map((item) => (
                      <Flex
                        key={item.id}
                        direction="column"
                        gap="1"
                        style={{
                          padding: '0.75rem',
                          border: '1px solid var(--gray-6)',
                          borderRadius: '4px',
                          backgroundColor: 'var(--gray-2)'
                        }}
                      >
                        <Flex justify="between" align="center">
                          <Flex direction="column" gap="1">
                            <Text size="2" weight="medium">
                              {usdFormatter.format(item.amount)} USDC
                            </Text>
                            {item.fee > 0 && (
                              <Text size="1" color="gray">
                                Fee: {usdFormatter.format(item.fee)} USDC
                              </Text>
                            )}
                          </Flex>
                          <Text size="2" color={getStatusColor(item.trans_status)}>
                            {item.trans_status}
                          </Text>
                        </Flex>
                        <Flex justify="between" align="center">
                          <Flex direction="column" gap="1" align="start">
                            <Text size="1" color="gray">
                              {formatDate(item.created_time)}
                            </Text>
                            <Text size="1" color="gray">
                              {getChainLabel(item.chain_id)}
                            </Text>
                          </Flex>
                          {item.tx_id && (
                            <Text
                              size="1"
                              asChild
                              style={{
                                fontFamily: 'monospace',
                                maxWidth: '200px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              <a
                                href={getExplorerUrl(item.tx_id)}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  color: 'inherit',
                                  textDecoration: 'none',
                                  cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.textDecoration = 'underline';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.textDecoration = 'none';
                                }}
                              >
                                {item.tx_id.slice(0, 10)}...{item.tx_id.slice(-8)}
                              </a>
                            </Text>
                          )}
                        </Flex>
                      </Flex>
                    ))}
                  </Flex>
                )}
              </Flex>
            )}
          </Flex>
        </Tabs.Content>

        {/* Transfer Tab */}
        <Tabs.Content value="transfer">
          <Flex direction="column" gap="4" style={{ paddingTop: '1rem' }}>
            <Flex direction="column" gap="2">
              <Text size="2" weight="medium">
                Receiver Account ID
              </Text>
              <TextField.Root
                type="text"
                placeholder="Enter Orderly account ID"
                value={receiverAccountId}
                onChange={(event) => {
                  setReceiverAccountId(event.target.value);
                }}
              />
            </Flex>

            <Flex direction="column" gap="2">
              <Flex justify="between" align="center">
                <Text size="2" weight="medium">
                  Amount
                </Text>
                {maxWithdrawAmount != null && (
                  <Button
                    variant="ghost"
                    size="1"
                    onClick={() => setAmount(maxWithdrawAmount.toFixed(6))}
                  >
                    MAX
                  </Button>
                )}
              </Flex>
              <TextField.Root
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(event) => {
                  setAmount(event.target.value);
                }}
                onWheel={(event) => {
                  event.currentTarget.blur();
                }}
              />
              {vaultBalance != null && (
                <Text size="1" color="gray">
                  Available: {usdFormatter.format(vaultBalance)} USDC
                </Text>
              )}
            </Flex>

            <Button
              disabled={
                !wallet ||
                !connectedChain ||
                !brokerId ||
                !orderlyKey ||
                !amount ||
                !receiverAccountId ||
                !vaultBalance ||
                parseUnits(String(vaultBalance), 6) < parseUnits(amount || '0', 6)
              }
              onClick={handleTransfer}
              size="3"
            >
              {showEOA ? 'Transfer' : 'Transfer from Contract'}
            </Button>
          </Flex>
        </Tabs.Content>
      </Tabs.Root>
    </Flex>
  );
};
