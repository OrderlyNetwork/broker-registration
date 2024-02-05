import { useAccount, useCollateral, useWithdraw } from '@orderly.network/hooks';
import { Button, Flex, Grid, Heading, Table, TextField } from '@radix-ui/themes';
import { useConnectWallet } from '@web3-onboard/react';
import { BrowserProvider, formatUnits, parseUnits } from 'ethers';
import { FC, useEffect, useState } from 'react';

import { NativeUSDC, NativeUSDC__factory } from './abi';
import { getUSDCAddress, getVaultAddress } from './helpers/addresses';
import {
  DelegateSignerResponse,
  delegateDeposit,
  delegateSettlePnL,
  delegateWithdraw
} from './helpers/delegateSigner';

export const Assets: FC<{
  delegateSigner?: DelegateSignerResponse;
}> = ({ delegateSigner }) => {
  const [balance, setBalance] = useState<bigint>();
  const [allowance, setAllowance] = useState<bigint>();
  const [usdcContract, setUsdcContract] = useState<NativeUSDC>();

  const [{ wallet }] = useConnectWallet();
  const { account } = useAccount();
  const collateral = useCollateral();

  const [amount, setAmount] = useState<string | undefined>();

  const { unsettledPnL } = useWithdraw();

  useEffect(() => {
    if (!wallet) {
      setUsdcContract(undefined);
      return;
    }
    const ethersProvider = new BrowserProvider(wallet.provider);
    setUsdcContract(
      NativeUSDC__factory.connect(getUSDCAddress(wallet.chains[0].id), ethersProvider)
    );
  }, [wallet]);

  useEffect(() => {
    if (!wallet || !usdcContract) return;
    const fetchBalanceAndAllowance = async () => {
      if (!wallet || !usdcContract) return;
      const address = wallet.accounts[0].address;
      const bal = await usdcContract.balanceOf(address);
      setBalance(bal);

      const allow = await usdcContract.allowance(address, getVaultAddress(wallet.chains[0].id));
      setAllowance(allow);
    };
    const interval = setInterval(fetchBalanceAndAllowance, 10_000);
    fetchBalanceAndAllowance();
    return () => clearInterval(interval);
  }, [wallet, usdcContract]);

  const formatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2
  });

  return (
    <Flex style={{ margin: '1.5rem' }} gap="3" align="center" justify="center" direction="column">
      <Heading>Assets</Heading>
      <Table.Root>
        <Table.Body>
          <Table.Row>
            <Table.RowHeaderCell>Wallet Balance (USDC):</Table.RowHeaderCell>
            <Table.Cell>
              {balance ? formatter.format(Number(formatUnits(balance, 6))) : '-'}
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.RowHeaderCell>Vault Balance (USDC):</Table.RowHeaderCell>
            <Table.Cell>{collateral.availableBalance}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.RowHeaderCell>Unsettled PnL (USDC):</Table.RowHeaderCell>
            <Table.Cell>{unsettledPnL}</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>
      <Grid
        columns="1"
        rows="4"
        gap="1"
        style={{
          gridTemplateAreas: `'input' 'deposit' 'withdraw' 'settlepnl'`
        }}
      >
        <TextField.Root style={{ gridArea: 'input' }}>
          <TextField.Input
            type="number"
            step="0.01"
            min="0"
            placeholder="USDC amount"
            onChange={(event) => {
              setAmount(event.target.value);
            }}
          />
        </TextField.Root>

        <Button
          style={{ gridArea: 'deposit' }}
          disabled={wallet == null || amount == null || usdcContract == null || allowance == null}
          onClick={async () => {
            if (wallet == null || amount == null || usdcContract == null || allowance == null)
              return;
            const address = wallet.accounts[0].address;
            const amountBN = parseUnits(amount, 6);
            if (allowance < amountBN) {
              await usdcContract.approve(address, amountBN);
            } else {
              if (!wallet || !delegateSigner) return;
              await delegateDeposit(wallet, amount, delegateSigner.account_id);
            }
          }}
        >
          {allowance == null || amount == null
            ? 'Deposit to Contract'
            : allowance < parseUnits(amount, 6)
              ? 'Approve'
              : 'Deposit to Contract'}
        </Button>

        <Button
          style={{ gridArea: 'withdraw' }}
          disabled={delegateSigner == null || amount == null}
          onClick={async () => {
            if (amount == null) return;
            await delegateWithdraw(account, amount);
          }}
        >
          Withdraw from Contract
        </Button>

        <Button
          style={{ gridArea: 'settlepnl' }}
          disabled={delegateSigner == null}
          onClick={async () => {
            await delegateSettlePnL(account);
          }}
        >
          Settle Delegate PnL
        </Button>
      </Grid>
    </Flex>
  );
};
