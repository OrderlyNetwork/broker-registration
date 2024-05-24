import { getPublicKeyAsync } from '@noble/ed25519';
import { Button, Card, Container, Flex, Heading, Text } from '@radix-ui/themes';
import { useConnectWallet, useSetChain } from '@web3-onboard/react';
import { encodeBase58 } from 'ethers';
import { FC, useEffect, useState } from 'react';

import { registerAccount, addOrderlyKey, getBaseUrl } from './helpers';

export const Account: FC<{
  brokerId: string;
  accountId: string;
  orderlyKey?: Uint8Array;
  setOrderlyKey: React.Dispatch<React.SetStateAction<Uint8Array | undefined>>;
}> = ({ brokerId, accountId, orderlyKey, setOrderlyKey }) => {
  const [publicKey, setPublicKey] = useState<string>();
  const [isRegistered, setIsRegistered] = useState<boolean>();

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

  return (
    <Flex style={{ margin: '1.5rem' }} gap="4" align="center" justify="center" direction="column">
      <Heading>Account</Heading>

      <Text>
        Here you can register your account in the Orderly Network infrastructure. This could be e.g.
        helpful to register an admin address for your broker. Please make sure that the address is
        not an EOA. Otherwise use the Delegate Signer feature.
      </Text>

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
                  Account is registered:
                </Text>
                <Text as="div" size="2">
                  {isRegistered === true ? '✅' : isRegistered === false ? '❌' : '?'}
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

      <Button
        disabled={!wallet || !connectedChain || !brokerId}
        onClick={async () => {
          if (!wallet || !connectedChain || !brokerId) return;
          const key = await addOrderlyKey(wallet, connectedChain.id, brokerId);
          setOrderlyKey(key);
        }}
      >
        Create Orderly Key
      </Button>
    </Flex>
  );
};
