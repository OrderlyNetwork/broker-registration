import { Button, Callout, Card, Container, Flex, Heading, Text, TextField } from '@radix-ui/themes';
import { useConnectWallet, useSetChain } from '@web3-onboard/react';
import { FC, useState } from 'react';

import {
  DelegateSignerResponse,
  announceDelegateSigner,
  delegateAddOrderlyKey,
  registerDelegateSigner,
  isTestnet
} from './helpers';

export const Account: FC<{
  brokerId: string;
  accountId: string;
  delegateSigner?: DelegateSignerResponse;
  setDelegateSigner: React.Dispatch<React.SetStateAction<DelegateSignerResponse | undefined>>;
  orderlyKey?: Uint8Array;
  setOrderlyKey: React.Dispatch<React.SetStateAction<Uint8Array | undefined>>;
}> = ({ brokerId, accountId, delegateSigner, setDelegateSigner, orderlyKey, setOrderlyKey }) => {
  const [txHash, setTxHash] = useState<string>('');

  const [{ wallet }] = useConnectWallet();
  const [{ connectedChain }] = useSetChain();

  return (
    <Flex style={{ margin: '1.5rem' }} gap="4" align="center" justify="center" direction="column">
      <Heading>Account</Heading>

      <Card style={{ maxWidth: 240 }}>
        {wallet ? (
          <>
            <Flex gap="1" direction="column">
              <Container>
                <Text as="div" size="2" weight="bold">
                  Address:
                </Text>
                <Text as="div" size="2">
                  {wallet.accounts[0].address}
                </Text>
              </Container>
              <Container>
                <Text as="div" size="2" weight="bold">
                  Orderly Account ID:
                </Text>
                <Text as="div" size="2">
                  {accountId ?? '-'}
                </Text>
              </Container>
              <Container>
                <Text as="div" size="2" weight="bold">
                  User ID:
                </Text>
                <Text as="div" size="2">
                  {delegateSigner ? delegateSigner.user_id : '-'}
                </Text>
              </Container>
              <Container>
                <Text as="div" size="2" weight="bold">
                  Valid Signer:
                </Text>
                <Text as="div" size="2">
                  {delegateSigner ? delegateSigner.valid_signer : '-'}
                </Text>
              </Container>
              <Container>
                <Text as="div" size="2" weight="bold">
                  Orderly Key:
                </Text>
                <Text as="div" size="2">
                  {orderlyKey ? 'OK' : '-'}
                </Text>
              </Container>
            </Flex>
          </>
        ) : (
          <Text as="div" size="3" weight="bold" color="red">
            Not connected!
          </Text>
        )}
      </Card>

      <Callout.Root>
        <Callout.Text>
          Delegate Signer information is not persisted on successive page visits
        </Callout.Text>
      </Callout.Root>

      {connectedChain && isTestnet(connectedChain.id) && (
        <Button
          disabled={!wallet || !connectedChain || !wallet.accounts[0]}
          onClick={async () => {
            const address = wallet?.accounts[0]?.address;
            if (!wallet || !connectedChain || !address) return;
            const hash = await registerDelegateSigner(wallet, connectedChain.id, address);
            setTxHash(hash);
          }}
        >
          Register Delegate Signer
        </Button>
      )}

      <Flex direction="column" gap="1">
        <label>
          Transaction Hash
          <TextField.Root>
            <TextField.Input
              value={txHash}
              onChange={(event) => {
                setTxHash(event.target.value);
              }}
            />
          </TextField.Root>
        </label>
        <Button
          disabled={!wallet || !connectedChain || !brokerId || !txHash}
          onClick={async () => {
            if (!wallet || !connectedChain || !brokerId || !txHash) return;
            const res = await announceDelegateSigner(wallet, connectedChain.id, brokerId, txHash);
            setDelegateSigner(res);
          }}
        >
          Accept Delegate Signer Link
        </Button>
      </Flex>

      <Button
        disabled={!wallet || !connectedChain || !brokerId}
        onClick={async () => {
          if (!wallet || !connectedChain || !brokerId) return;
          const key = await delegateAddOrderlyKey(wallet, connectedChain.id, brokerId, accountId);
          setOrderlyKey(key);
        }}
      >
        Create Delegate Orderly Key
      </Button>
    </Flex>
  );
};