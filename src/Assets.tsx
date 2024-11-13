import { Button, Callout, Flex, Heading, Table, TextField } from '@radix-ui/themes';
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
  SupportedChainIds
} from './helpers';

export const Assets: FC<{
  brokerId: string;
  accountId: string;
  contractAddress: string;
  showEOA: boolean;
  orderlyKey?: Uint8Array;
}> = ({ brokerId, accountId, contractAddress, showEOA, orderlyKey }) => {
  const [amount, setAmount] = useState<string>('');
  const [balance, setBalance] = useState<bigint>();
  const [allowance, setAllowance] = useState<bigint>();
  const [contractBalance, setContractBalance] = useState<bigint>();
  const [vaultBalance, setVaultBalance] = useState<number>();
  const [usdcContract, setUsdcContract] = useState<NativeUSDC>();
  const [unsettledPnL, setUnsettledPnL] = useState<number>();

  const [{ wallet }] = useConnectWallet();
  const [{ connectedChain }] = useSetChain();

  let needsApproval = false;
  if (allowance != null && amount != null) {
    try {
      needsApproval = allowance < parseUnits(amount, 6);
    } catch {
      // NaN
    }
  }

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
      console.log('address', address);
      console.log('usdcContract', usdcContract);
      console.log(
        'getUSDCAddress(connectedChain.id)',
        getUSDCAddress(connectedChain.id as SupportedChainIds)
      );
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
    if (!usdcContract || !contractAddress) {
      setContractBalance(undefined);
      return;
    }
    console.log('contractAddress', contractAddress);
    const fetchContractBalance = async () => {
      if (!usdcContract || !contractAddress) {
        setContractBalance(undefined);
        return;
      }
      usdcContract.balanceOf(contractAddress).then(setContractBalance);
    };
    const interval = setInterval(fetchContractBalance, 5_000);
    fetchContractBalance();
    return () => clearInterval(interval);
  }, [usdcContract, contractAddress]);

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

  return (
    <Flex style={{ margin: '1.5rem' }} gap="4" align="center" justify="center" direction="column">
      <Heading>Assets</Heading>

      {!orderlyKey && (
        <Callout.Root variant="outline" style={{ alignSelf: 'center' }}>
          <Callout.Text>
            You need to create an Orderly key in order to be able to display your Orderly balance.
          </Callout.Text>
        </Callout.Root>
      )}

      <Table.Root>
        <Table.Body>
          <Table.Row>
            <Table.RowHeaderCell>Connected Wallet Balance (USDC):</Table.RowHeaderCell>
            <Table.Cell>
              {balance != null ? usdFormatter.format(Number(formatUnits(balance, 6))) : '-'}
            </Table.Cell>
          </Table.Row>
          {!showEOA && (
            <Table.Row>
              <Table.RowHeaderCell>Delegate Signer Balance (USDC):</Table.RowHeaderCell>
              <Table.Cell>
                {contractBalance != null
                  ? usdFormatter.format(Number(formatUnits(contractBalance, 6)))
                  : '-'}
              </Table.Cell>
            </Table.Row>
          )}
          <Table.Row>
            <Table.RowHeaderCell>Orderly Account Balance (USDC):</Table.RowHeaderCell>
            <Table.Cell>
              {vaultBalance != null ? usdFormatter.format(vaultBalance) : '-'}
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.RowHeaderCell>Unsettled PnL (USDC):</Table.RowHeaderCell>
            <Table.Cell>
              {unsettledPnL != null ? usdFormatter.format(unsettledPnL) : '-'}
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>

      <Flex direction="column" gap="4">
        <TextField.Root
          style={{ gridArea: 'input' }}
          type="number"
          step="0.01"
          min="0"
          placeholder="USDC amount"
          onChange={(event) => {
            setAmount(event.target.value);
          }}
        />

        {!showEOA && (
          <Button
            disabled={
              !wallet ||
              !amount ||
              !usdcContract ||
              allowance == null ||
              !connectedChain ||
              !brokerId ||
              !balance ||
              balance < parseUnits(amount, 6)
            }
            onClick={async () => {
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
              const amountBN = parseUnits(amount, 6);
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
            }}
          >
            {needsApproval ? 'Approve' : 'Deposit to Contract'}
          </Button>
        )}

        {showEOA ? (
          <Button
            disabled={!wallet || !connectedChain || !brokerId || !orderlyKey}
            onClick={async () => {
              if (!wallet || !connectedChain || !orderlyKey || !amount) return;
              const amountBN = parseUnits(amount, 6);
              if (parseUnits(String(vaultBalance), 6) < amountBN) return;
              await withdraw(
                wallet,
                connectedChain.id as SupportedChainIds,
                brokerId,
                accountId,
                orderlyKey,
                amountBN.toString(),
                wallet.accounts[0].address
              );
            }}
          >
            Withdraw
          </Button>
        ) : (
          <Button
            disabled={
              !wallet ||
              !connectedChain ||
              !orderlyKey ||
              !amount ||
              !brokerId ||
              parseUnits(String(vaultBalance), 6) < parseUnits(amount, 6) ||
              parseUnits(amount, 6) < 2_500_000n // fee
            }
            onClick={async () => {
              if (!wallet || !connectedChain || !orderlyKey || !amount) return;
              const amountBN = parseUnits(amount, 6);
              if (parseUnits(String(vaultBalance), 6) < amountBN) return;
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
            }}
          >
            Withdraw from Contract
          </Button>
        )}

        {showEOA ? (
          <Button
            disabled={!wallet || !connectedChain || !brokerId || !orderlyKey}
            onClick={async () => {
              if (!wallet || !connectedChain || !brokerId || !orderlyKey) return;
              await settlePnL(
                wallet,
                connectedChain.id as SupportedChainIds,
                brokerId,
                accountId,
                orderlyKey
              );
            }}
          >
            Settle PnL
          </Button>
        ) : (
          <Button
            disabled={!wallet || !connectedChain || !brokerId || !orderlyKey}
            onClick={async () => {
              if (!wallet || !connectedChain || !brokerId || !orderlyKey) return;
              await delegateSettlePnL(
                wallet,
                connectedChain.id as SupportedChainIds,
                brokerId,
                contractAddress,
                accountId,
                orderlyKey
              );
            }}
          >
            Settle Delegate PnL
          </Button>
        )}
      </Flex>
    </Flex>
  );
};
