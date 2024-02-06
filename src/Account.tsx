import { getPublicKeyAsync } from '@noble/ed25519';
import { Button, Card, Container, Flex, Heading, Text, TextField } from '@radix-ui/themes';
import { useConnectWallet, useSetChain } from '@web3-onboard/react';
import { encodeBase58 } from 'ethers';
import { FC, useEffect, useState } from 'react';

import { SafeInstructions } from './SafeInstructions';
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
  const [publicKey, setPublicKey] = useState<string>();

  const [{ wallet }] = useConnectWallet();
  const [{ connectedChain }] = useSetChain();

  useEffect(() => {
    async function run() {
      if (orderlyKey) {
        setPublicKey(`ed25519:${encodeBase58(await getPublicKeyAsync(orderlyKey))}`);
      } else {
        setPublicKey(undefined);
      }
    }
    run();
  }, [orderlyKey]);

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
                  {publicKey ?? '-'}
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

      {connectedChain && isTestnet(connectedChain.id) && (
        <Button
          disabled={!wallet || !connectedChain || !wallet.accounts[0]}
          onClick={async () => {
            const address = wallet?.accounts[0]?.address;
            if (!wallet || !connectedChain || !address) return;
            const hash = await registerDelegateSigner(wallet, brokerId, connectedChain.id, address);
            setTxHash(hash);
          }}
        >
          Register Delegate Signer
        </Button>
      )}

      {connectedChain && <SafeInstructions brokerId={brokerId} chainId={connectedChain.id} />}

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
