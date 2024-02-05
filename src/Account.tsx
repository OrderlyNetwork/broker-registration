import { Button, Callout, Flex, Heading } from '@radix-ui/themes';
import { useConnectWallet } from '@web3-onboard/react';
import { FC, useState } from 'react';

import {
  DelegateSignerResponse,
  announceDelegateSigner,
  delegateAddOrderlyKey,
  registerDelegateSigner
} from './helpers/delegateSigner';

export const Account: FC<{
  delegateSigner?: DelegateSignerResponse;
  setDelegateSigner: React.Dispatch<React.SetStateAction<DelegateSignerResponse | undefined>>;
  setDelegateOrderlyKey: React.Dispatch<React.SetStateAction<string | undefined>>;
}> = ({ delegateSigner, setDelegateSigner, setDelegateOrderlyKey }) => {
  const [txHash, setTxHash] = useState<string | undefined>();

  const [{ wallet }] = useConnectWallet();

  return (
    <Flex style={{ margin: '1.5rem' }} gap="3" align="center" justify="center" direction="column">
      <Heading>Account</Heading>

      {/* <Card style={{ maxWidth: 240 }}>
        {state.accountId ? (
          <>
            <Flex gap="2" direction="column">
              <Container>
                <Text as="div" size="2" weight="bold">
                  Orderly Account ID:
                </Text>
                <Text as="div" size="2">
                  {state.accountId}
                </Text>
              </Container>
              <Container>
                <Text as="div" size="2" weight="bold">
                  Address:
                </Text>
                <Text as="div" size="2">
                  {state.address}
                </Text>
              </Container>
              <Container>
                <Text as="div" size="2" weight="bold">
                  User ID:
                </Text>
                <Text as="div" size="2">
                  {state.userId}
                </Text>
              </Container>
            </Flex>
          </>
        ) : (
          <Text as="div" size="3" weight="bold" color="red">
            Not connected!
          </Text>
        )}
      </Card> */}

      <Callout.Root>
        <Callout.Text>
          Delegate Signer information is not persisted on successive page visits
        </Callout.Text>
      </Callout.Root>

      <Button
        disabled={!wallet || !wallet.accounts[0]}
        onClick={async () => {
          const address = wallet?.accounts[0]?.address;
          if (!wallet || !address) return;
          const hash = await registerDelegateSigner(wallet, address);
          setTxHash(hash);
        }}
      >
        Register Delegate Signer
      </Button>

      <Button
        disabled={!wallet || !wallet.accounts[0] || !txHash}
        onClick={async () => {
          const address = wallet?.accounts[0]?.address;
          if (!wallet || !address || !txHash) return;
          const res = await announceDelegateSigner(wallet, txHash);
          setDelegateSigner(res);
        }}
      >
        Announce Delegate Signer
      </Button>

      <Button
        disabled={!wallet || delegateSigner == null}
        onClick={async () => {
          if (!wallet) return;
          const key = await delegateAddOrderlyKey(wallet);
          setDelegateOrderlyKey(key);
        }}
      >
        Create Delegate Orderly Key
      </Button>
    </Flex>
  );
};
