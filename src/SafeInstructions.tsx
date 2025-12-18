import { CopyIcon } from '@radix-ui/react-icons';
import {
  Blockquote,
  Button,
  Code,
  Container,
  Dialog,
  Flex,
  IconButton,
  ScrollArea,
  Strong,
  Tabs,
  Text
} from '@radix-ui/themes';
import { useConnectWallet } from '@web3-onboard/react';
import { solidityPackedKeccak256 } from 'ethers';
import { FC, useEffect, useState } from 'react';

import { getVaultAddress, SupportedChainIds } from './helpers';

export const SafeInstructions: FC<{ brokerId: string; chainId: string }> = ({
  brokerId,
  chainId
}) => {
  const [abi, setAbi] = useState<string>();

  const [{ wallet }] = useConnectWallet();

  useEffect(() => {
    async function run() {
      const res = await fetch(
        'https://raw.githubusercontent.com/OrderlyNetwork/contract-evm-abi/main/abi/latest/Vault.json'
      );
      if (!res.ok) return;
      setAbi(await res.text());
    }
    run();
  }, []);

  const data = [solidityPackedKeccak256(['string'], [brokerId]), wallet?.accounts[0].address ?? ''];

  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <Button>Show Gnosis Safe Instructions</Button>
      </Dialog.Trigger>

      <Dialog.Content style={{ width: '40rem' }}>
        <Dialog.Title>Gnosis Safe Instructions</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          Follow these instructions to register your Gnosis Safe Wallet via Orderly Network.
        </Dialog.Description>

        <Tabs.Root defaultValue="safe">
          <Tabs.List>
            <Tabs.Trigger value="safe">1. Open Wallet</Tabs.Trigger>
            <Tabs.Trigger value="transaction">2. Create Tx</Tabs.Trigger>
            <Tabs.Trigger value="review-confirm">3. Review & Confirm Tx</Tabs.Trigger>
            <Tabs.Trigger value="txhash">4. Get Tx Hash</Tabs.Trigger>
          </Tabs.List>

          <Container style={{ marginTop: '1rem' }}>
            <Tabs.Content value="safe">
              <Text>
                Visit{' '}
                <a href="https://app.safe.global/" target="_blank">
                  Gnosis Safe
                </a>
                . Set up your wallet if not already done. Then visit the batch transaction builder
                as shown below.
              </Text>
              <img src="./safe.webp" alt="Gnosis Safe Instructions" style={{ maxWidth: '100%' }} />
            </Tabs.Content>

            <Tabs.Content value="transaction">
              <Flex direction="column" gap="6">
                <Flex gap="2" wrap="wrap" align="center">
                  <Strong>Enter Orderly Vault address</Strong>
                  <IconButton
                    size="1"
                    variant="soft"
                    onClick={() => {
                      navigator.clipboard.writeText(getVaultAddress(chainId as SupportedChainIds));
                    }}
                  >
                    <CopyIcon height="12" />
                  </IconButton>
                  <Blockquote>{getVaultAddress(chainId as SupportedChainIds)}</Blockquote>
                </Flex>
                <Flex gap="2" wrap="wrap" align="center">
                  <Strong>Copy ABI</Strong>
                  <IconButton
                    size="1"
                    variant="soft"
                    onClick={() => {
                      if (!abi) return;
                      navigator.clipboard.writeText(abi);
                    }}
                  >
                    <CopyIcon height="12" />
                  </IconButton>
                  <ScrollArea type="always" scrollbars="vertical" style={{ height: '8rem' }}>
                    <Code>{abi ?? 'loading...'}</Code>
                  </ScrollArea>
                </Flex>
                <Flex direction="column">
                  <Strong>Select contract method</Strong> <Code>delegateSigner</Code>
                </Flex>
                <Flex gap="2" wrap="wrap" align="center">
                  <Strong>Insert data tuple</Strong>
                  <IconButton
                    size="1"
                    variant="soft"
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(data));
                    }}
                  >
                    <CopyIcon height="12" />
                  </IconButton>
                  <Text>This data will send your wallet address & Delegate Signer address.</Text>
                  <Code style={{ wordWrap: 'break-word', overflow: 'hidden' }}>
                    {JSON.stringify(data, undefined, 2)}
                  </Code>
                </Flex>

                <Flex direction="column">
                  <Strong>Create Batch transaction</Strong>
                  <img
                    src="./batch-create.webp"
                    alt="Create Batch for Gnosis Safe"
                    style={{ maxWidth: '100%' }}
                  />
                </Flex>
              </Flex>
            </Tabs.Content>

            <Tabs.Content value="review-confirm">
              <Flex direction="column" gap="4">
                <Flex direction="column">
                  <Strong>Review transaction</Strong>
                  <Text>
                    You can simulate the transaction in order to make sure, that it will not fail.
                  </Text>
                  <img
                    src="./review-batch.webp"
                    alt="Review Gnosis Safe batch transaction"
                    style={{ maxWidth: '100%' }}
                  />
                </Flex>

                <Flex direction="column">
                  <Strong>Execute transaction</Strong>
                  <img
                    src="./confirm-tx.webp"
                    alt="Confirm Gnosis Safe batch transaction"
                    style={{ maxWidth: '100%' }}
                  />
                </Flex>
              </Flex>
            </Tabs.Content>

            <Tabs.Content value="txhash">
              <Flex direction="column" gap="4">
                <Flex direction="column">
                  <Strong>Receive Transaction Hash</Strong>
                  <Text>
                    After the multisig transaction succeeded with enough wallets signing the
                    transaction, you need to receive the transaction hash. Copy it in order to
                    accept the Delegate Signer link at Orderly Network.
                  </Text>
                  <img
                    src="./multisig-txhash.webp"
                    alt="Receive Gnosis Safe transaction hash"
                    style={{ maxWidth: '100%' }}
                  />
                </Flex>
              </Flex>
            </Tabs.Content>
          </Container>
        </Tabs.Root>

        <Flex justify="end">
          <Dialog.Close>
            <Button>Ok</Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};
