import { getPublicKeyAsync } from '@noble/ed25519';
import { CopyIcon } from '@radix-ui/react-icons';
import {
  Button,
  Card,
  Container,
  DropdownMenu,
  Flex,
  Heading,
  IconButton,
  Text,
  TextField
} from '@radix-ui/themes';
import { useConnectWallet, useSetChain } from '@web3-onboard/react';
import { encodeBase58 } from 'ethers';
import { FC, useEffect, useState } from 'react';

import { SafeInstructions } from './SafeInstructions';
import {
  DelegateSignerResponse,
  announceDelegateSigner,
  delegateAddOrderlyKey,
  registerExampleDelegateSigner,
  isTestnet,
  Scope
} from './helpers';

export const DelegateSigner: FC<{
  brokerId: string;
  accountId: string;
  contractAddress: string;
  delegateSigner?: DelegateSignerResponse;
  setDelegateSigner: React.Dispatch<React.SetStateAction<DelegateSignerResponse | undefined>>;
  orderlyKey?: Uint8Array;
  setOrderlyKey: React.Dispatch<React.SetStateAction<Uint8Array | undefined>>;
}> = ({
  brokerId,
  accountId,
  contractAddress,
  delegateSigner,
  setDelegateSigner,
  orderlyKey,
  setOrderlyKey
}) => {
  const [txHash, setTxHash] = useState<string>('');
  const [publicKey, setPublicKey] = useState<string>();
  const [scope, setScope] = useState<Scope>('read,trading');

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

  const privateKey = orderlyKey ? `ed25519:${encodeBase58(orderlyKey)}` : null;

  return (
    <Flex style={{ margin: '1.5rem' }} gap="4" align="center" justify="center" direction="column">
      <Heading>Delegate Signer</Heading>

      <Text>
        Here you can register your{' '}
        <a
          href="https://orderly.network/docs/build-on-evm/user-flows/delegate-signer"
          target="_blank"
          rel="noopener"
        >
          Delegate Signer
        </a>{' '}
        account in the Orderly Network infrastructure. You can then deposit and withdraw to your
        respective smart contract account.
      </Text>

      <Card style={{ maxWidth: 240 }}>
        {wallet ? (
          <>
            <Flex gap="1" direction="column">
              <Container>
                <Text as="div" size="2" weight="bold">
                  Wallet Address:
                </Text>
                <Text as="div" size="2">
                  {wallet.accounts[0].address}
                </Text>
              </Container>
              <Container>
                <Text as="div" size="2" weight="bold">
                  Delegate Signer Address:
                </Text>
                <Text as="div" size="2">
                  {contractAddress}
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
                  Orderly Public Key:
                </Text>
                <Text as="div" size="2">
                  {publicKey ?? '-'}
                </Text>
              </Container>
              <Container>
                <Text as="div" size="2" weight="bold">
                  Orderly Private Key:
                </Text>
                <Text as="div" size="2">
                  {privateKey ? `${privateKey.slice(0, 12)}...${privateKey.slice(-4)}` : '-'}
                </Text>
                {orderlyKey && (
                  <IconButton
                    size="1"
                    variant="soft"
                    onClick={async () => {
                      if (privateKey == null) return;
                      navigator.clipboard.writeText(privateKey);
                    }}
                  >
                    <CopyIcon height="12" />
                  </IconButton>
                )}
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
            const hash = await registerExampleDelegateSigner(
              wallet,
              brokerId,
              connectedChain.id,
              address
            );
            setTxHash(hash);
          }}
        >
          Register Example Delegate Signer
        </Button>
      )}

      {connectedChain && <SafeInstructions brokerId={brokerId} chainId={connectedChain.id} />}

      <Flex direction="column" gap="1">
        <label>
          Transaction Hash
          <TextField.Root
            value={txHash}
            onChange={(event) => {
              setTxHash(event.target.value);
            }}
          />
        </label>
        <Button
          disabled={!wallet || !connectedChain || !brokerId || !txHash}
          onClick={async () => {
            if (!wallet || !connectedChain || !brokerId || !txHash) return;
            const res = await announceDelegateSigner(
              wallet,
              connectedChain.id,
              brokerId,
              contractAddress,
              txHash
            );
            setDelegateSigner(res);
          }}
        >
          Accept Delegate Signer Link
        </Button>
      </Flex>

      <Flex direction="column">
        <span>Scope:</span>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button variant="soft">
              {scope}
              <DropdownMenu.TriggerIcon />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item
              onSelect={() => {
                setScope('read');
              }}
            >
              read
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onSelect={() => {
                setScope('read,trading');
              }}
            >
              read,trading
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Flex>

      <Button
        disabled={!wallet || !connectedChain || !brokerId}
        onClick={async () => {
          if (!wallet || !connectedChain || !brokerId) return;
          const key = await delegateAddOrderlyKey(
            wallet,
            connectedChain.id,
            brokerId,
            contractAddress,
            accountId,
            scope
          );
          setOrderlyKey(key);
        }}
      >
        Create Delegate Orderly Key
      </Button>
    </Flex>
  );
};
