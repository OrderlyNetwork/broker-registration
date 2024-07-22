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
  Text
} from '@radix-ui/themes';
import { useConnectWallet, useSetChain } from '@web3-onboard/react';
import { encodeBase58 } from 'ethers';
import { FC, useEffect, useState } from 'react';

import { registerAccount, addOrderlyKey, getBaseUrl, Scope } from './helpers';

export const Account: FC<{
  brokerId: string;
  accountId: string;
  orderlyKey?: Uint8Array;
  setOrderlyKey: React.Dispatch<React.SetStateAction<Uint8Array | undefined>>;
}> = ({ brokerId, accountId, orderlyKey, setOrderlyKey }) => {
  const [publicKey, setPublicKey] = useState<string>();
  const [isRegistered, setIsRegistered] = useState<boolean>();
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

  useEffect(() => {
    const run = async () => {
      if (!connectedChain) {
        setIsRegistered(undefined);
        return;
      }
      const res = await fetch(
        `${getBaseUrl(connectedChain.id)}/v1/public/account?account_id=${accountId}`
      ).then((res) => res.json());
      setIsRegistered(res.success);
    };
    run();
  }, [connectedChain, accountId]);

  const privateKey = orderlyKey ? `ed25519:${encodeBase58(orderlyKey)}` : null;

  return (
    <Flex style={{ margin: '1.5rem' }} gap="4" align="center" justify="center" direction="column">
      <Heading>Account</Heading>

      <Text>
        Here you can register your account in the Orderly Network infrastructure. This could be e.g.
        helpful to register an admin address for your broker.
      </Text>

      <Card style={{ maxWidth: 480 }}>
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
                  Account is registered:
                </Text>
                <Text as="div" size="2">
                  {isRegistered === true ? '✅' : isRegistered === false ? '❌' : '?'}
                </Text>
              </Container>
              <Container>
                <Text as="div" size="2" weight="bold">
                  Orderly Public Key:
                </Text>
                <Flex gap="2">
                  <Text as="div" size="2">
                    {publicKey ?? '-'}
                  </Text>
                  {publicKey && (
                    <IconButton
                      size="1"
                      variant="soft"
                      onClick={async () => {
                        if (publicKey == null) return;
                        navigator.clipboard.writeText(publicKey);
                      }}
                    >
                      <CopyIcon height="12" />
                    </IconButton>
                  )}
                </Flex>
              </Container>
              <Container>
                <Text as="div" size="2" weight="bold">
                  Orderly Private Key:
                </Text>
                <Flex gap="2">
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
                </Flex>
              </Container>
            </Flex>
          </>
        ) : (
          <Text as="div" size="3" weight="bold" color="red">
            Not connected!
          </Text>
        )}
      </Card>

      <Button
        disabled={!wallet || !connectedChain || !brokerId || isRegistered}
        onClick={async () => {
          if (!wallet || !connectedChain || !brokerId) return;
          await registerAccount(wallet, connectedChain.id, brokerId);
          setIsRegistered(true);
        }}
      >
        Register Account
      </Button>

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
          const key = await addOrderlyKey(wallet, connectedChain.id, brokerId, scope, accountId);
          setOrderlyKey(key);
        }}
      >
        Create Orderly Key
      </Button>
    </Flex>
  );
};
