import { Button, Callout, DropdownMenu, Flex, Heading, Tabs, Text, TextField } from '@radix-ui/themes';
import { useConnectWallet, useSetChain } from '@web3-onboard/react';
import { BrowserProvider, formatUnits, parseUnits } from 'ethers';
import { FC, useEffect, useState } from 'react';

import { NativeUSDC, NativeUSDC__factory } from './abi';
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
  supportedChains
} from './helpers';
import { useToast } from './Toast';

export const Assets: FC<{
  brokerId: string;
  accountId: string;
  contractAddress: string;
  showEOA: boolean;
  orderlyKey?: Uint8Array;
}> = ({ brokerId, accountId, contractAddress, showEOA, orderlyKey }) => {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState<string>('');
  const [balance, setBalance] = useState<bigint>();
  const [allowance, setAllowance] = useState<bigint>();
  const [vaultBalance, setVaultBalance] = useState<number>();
  const [usdcContract, setUsdcContract] = useState<NativeUSDC>();
  const [unsettledPnL, setUnsettledPnL] = useState<number>();
  const [withdrawFee, setWithdrawFee] = useState<number>();

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
      // Refresh unsettled PnL after settling
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
      if (allowance < amountBN) {
        await usdcContract.approve(
          getVaultAddress(connectedChain.id as SupportedChainIds),
          amountBN
        );
        const allow = await usdcContract.allowance(
          wallet.accounts[0].address,
          getVaultAddress(connectedChain.id as SupportedChainIds)
        );
        setAllowance(allow);
        showToast('Approval successful. You can now deposit.');
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

  const maxDepositAmount =
    balance != null ? Number(formatUnits(balance, usdcDecimals)) : undefined;
  const maxWithdrawAmount = vaultBalance != null ? vaultBalance : undefined;

  const hasUnsettledPnL = unsettledPnL != null && unsettledPnL !== 0;

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
      <Tabs.Root value={activeTab} onValueChange={(value) => setActiveTab(value as 'deposit' | 'withdraw')}>
        <Tabs.List>
          <Tabs.Trigger value="deposit">Deposit</Tabs.Trigger>
          <Tabs.Trigger value="withdraw">Withdraw</Tabs.Trigger>
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

            {/* Unsettled PnL (only show if non-zero) */}
            {hasUnsettledPnL && (
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
              !hasUnsettledPnL && (
                <Callout.Root color="red" variant="soft">
                  <Callout.Text>
                    Withdraw amount must be greater than the withdraw fee (
                    {usdFormatter.format(withdrawFee)} USDC).
                  </Callout.Text>
                </Callout.Root>
              )}

            <Button
              disabled={
                hasUnsettledPnL
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
              onClick={hasUnsettledPnL ? handleSettlePnL : handleWithdraw}
              size="3"
            >
              {hasUnsettledPnL
                ? showEOA
                  ? 'Settle PnL'
                  : 'Settle Delegate PnL'
                : showEOA
                  ? 'Withdraw'
                  : 'Withdraw from Contract'}
            </Button>
          </Flex>
        </Tabs.Content>
      </Tabs.Root>
    </Flex>
  );
};
