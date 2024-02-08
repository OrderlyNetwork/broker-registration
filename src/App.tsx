import {
  Button,
  Callout,
  Container,
  DropdownMenu,
  Flex,
  Heading,
  Tabs,
  Text,
  TextField
} from '@radix-ui/themes';
import { useConnectWallet, useSetChain } from '@web3-onboard/react';
import { useEffect, useState } from 'react';

import { Account } from './Account';
import { Assets } from './Assets';
import Arbitrum from './assets/arbitrum.svg?raw';
import ArbitrumSepolia from './assets/arbitrum_sepolia.svg?raw';
import Optimism from './assets/optimism.svg?raw';
import OptimismSepolia from './assets/optimism_sepolia.svg?raw';
import Questionmark from './assets/questionmark.svg?raw';
import {
  DelegateSignerResponse,
  exampleDelegateContract,
  getAccountId,
  loadOrderlyKey,
  isTestnet,
  loadBrokerId,
  loadContractAddress,
  saveBrokerId,
  saveContractAddress
} from './helpers';

function App() {
  const [brokerId, setBrokerId] = useState<string>('');
  const [contractAddress, setContractAddress] = useState<string>('');
  const [accountId, setAccountId] = useState<string>();
  const [delegateSigner, setDelegateSigner] = useState<DelegateSignerResponse>();
  const [orderlyKey, setOrderlyKey] = useState<Uint8Array>();

  const [{ wallet }, connectWallet, disconnectWallet] = useConnectWallet();
  const [{ connectedChain }, setChain] = useSetChain();

  useEffect(() => {
    connectWallet();
  }, [connectWallet]);

  useEffect(() => {
    setAccountId(undefined);
    if (connectedChain) {
      setBrokerId(loadBrokerId(connectedChain.id));
      const address = loadContractAddress(connectedChain.id);
      if (!address && isTestnet(connectedChain.id)) {
        setContractAddress(exampleDelegateContract);
      } else {
        setContractAddress(address);
      }
    } else {
      setBrokerId('');
      setContractAddress('');
    }
  }, [connectedChain]);

  useEffect(() => {
    if (accountId) {
      setOrderlyKey(loadOrderlyKey(accountId));
    } else {
      setOrderlyKey(undefined);
    }
  }, [accountId]);

  let chainIcon;
  switch (connectedChain?.id) {
    case '0xa4b1':
      chainIcon = Arbitrum;
      break;
    case '0xa':
      chainIcon = Optimism;
      break;
    case '0x66eee':
      chainIcon = ArbitrumSepolia;
      break;
    case '0xaa37dc':
      chainIcon = OptimismSepolia;
      break;
    default:
      chainIcon = Questionmark;
  }

  const selectChain = (chainId: string) => () => {
    setChain({
      chainId
    });
  };

  return (
    <Flex style={{ margin: '2rem auto', maxWidth: '45rem' }} direction="column" gap="6">
      <Heading style={{ alignSelf: 'center' }}>Orderly Delegate Signer</Heading>

      <Text>
        This app lets you connect to the Orderly Network infrastructure with a{' '}
        <a
          href="https://orderly.network/docs/build-on-evm/user-flows/delegate-signer"
          target="_blank"
          rel="noopener"
        >
          Delegate Signer
        </a>{' '}
        EOA account. You can then deposit and withdraw to your respective smart contract account.
        The source code is available on{' '}
        <a href="https://github.com/OrderlyNetwork/delegate-signer" target="_blank" rel="noopener">
          Github
        </a>
        .
      </Text>

      <Flex gap="4" align="end" wrap="wrap">
        <Container style={{ width: '100%' }}>
          {wallet ? (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <Button>
                  <img
                    src={`data:image/svg+xml;base64,${btoa(chainIcon)}`}
                    style={{ marginRight: '0.3rem', height: '1.8rem' }}
                  />
                  {`${wallet.accounts[0].address.substring(
                    0,
                    6
                  )}...${wallet.accounts[0].address.substr(-4)}`}
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content>
                <DropdownMenu.Label>Mainnet</DropdownMenu.Label>
                <DropdownMenu.Item
                  onSelect={selectChain('0xa4b1')}
                  style={{
                    backgroundColor: connectedChain?.id === '0xa4b1' ? 'lightgrey' : undefined,
                    color: connectedChain?.id === '0xa4b1' ? 'black' : undefined,
                    fontWeight: connectedChain?.id === '0xa4b1' ? '600' : undefined
                  }}
                >
                  <img
                    src={`data:image/svg+xml;base64,${btoa(Arbitrum)}`}
                    style={{ marginRight: '0.3rem', height: '1.8rem' }}
                  />
                  Arbitrum One
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onSelect={selectChain('0xa')}
                  style={{
                    backgroundColor: connectedChain?.id === '0xa' ? 'lightgrey' : undefined,
                    color: connectedChain?.id === '0xa' ? 'black' : undefined,
                    fontWeight: connectedChain?.id === '0xa' ? '600' : undefined
                  }}
                >
                  <img
                    src={`data:image/svg+xml;base64,${btoa(Optimism)}`}
                    style={{ marginRight: '0.3rem', height: '1.8rem' }}
                  />
                  OP Mainnet
                </DropdownMenu.Item>
                <DropdownMenu.Separator />
                <DropdownMenu.Label>Testnet</DropdownMenu.Label>
                <DropdownMenu.Item
                  onSelect={selectChain('0x66eee')}
                  style={{
                    backgroundColor: connectedChain?.id === '0x66eee' ? 'lightgrey' : undefined,
                    color: connectedChain?.id === '0x66eee' ? 'black' : undefined,
                    fontWeight: connectedChain?.id === '0x66eee' ? '600' : undefined
                  }}
                >
                  <img
                    src={`data:image/svg+xml;base64,${btoa(ArbitrumSepolia)}`}
                    style={{ marginRight: '0.3rem', height: '1.8rem' }}
                  />
                  Arbitrum Sepolia
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onSelect={selectChain('0xaa37dc')}
                  style={{
                    backgroundColor: connectedChain?.id === '0xaa37dc' ? 'lightgrey' : undefined,
                    color: connectedChain?.id === '0xaa37dc' ? 'black' : undefined,
                    fontWeight: connectedChain?.id === '0xaa37dc' ? '600' : undefined
                  }}
                >
                  <img
                    src={`data:image/svg+xml;base64,${btoa(OptimismSepolia)}`}
                    style={{ marginRight: '0.3rem', height: '1.8rem' }}
                  />
                  OP Sepolia
                </DropdownMenu.Item>
                <DropdownMenu.Separator />
                <DropdownMenu.Item
                  onSelect={() => {
                    disconnectWallet({ label: wallet.label });
                  }}
                >
                  Disconnect
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          ) : (
            <Button
              onClick={async () => {
                if (wallet) return;
                await connectWallet();
              }}
            >
              Connect wallet
            </Button>
          )}
        </Container>

        <label>
          Broker ID
          <TextField.Root>
            <TextField.Input
              value={brokerId}
              onChange={(event) => {
                setBrokerId(event.target.value);
              }}
            />
          </TextField.Root>
        </label>

        <label>
          Contract Address
          <TextField.Root>
            <TextField.Input
              value={contractAddress}
              onChange={(event) => {
                setContractAddress(event.target.value);
              }}
            />
          </TextField.Root>
        </label>

        <Button
          disabled={!brokerId || !contractAddress || !connectedChain}
          onClick={async () => {
            if (!brokerId || !contractAddress || !connectedChain) return;
            setAccountId(getAccountId(contractAddress, brokerId));
            saveBrokerId(connectedChain.id, brokerId);
            saveContractAddress(connectedChain.id, contractAddress);
          }}
        >
          Load Account
        </Button>
      </Flex>

      {accountId ? (
        <Tabs.Root defaultValue="account">
          <Tabs.List>
            <Tabs.Trigger value="account">Account</Tabs.Trigger>
            <Tabs.Trigger value="assets">Assets</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="account">
            <Account
              brokerId={brokerId}
              accountId={accountId}
              contractAddress={contractAddress}
              delegateSigner={delegateSigner}
              setDelegateSigner={setDelegateSigner}
              orderlyKey={orderlyKey}
              setOrderlyKey={setOrderlyKey}
            />
          </Tabs.Content>
          <Tabs.Content value="assets">
            <Assets
              brokerId={brokerId}
              accountId={accountId}
              contractAddress={contractAddress}
              orderlyKey={orderlyKey}
            />
          </Tabs.Content>
        </Tabs.Root>
      ) : (
        <Callout.Root variant="outline" style={{ alignSelf: 'center' }}>
          <Callout.Text>Please insert your Broker ID and Contract Address</Callout.Text>
        </Callout.Root>
      )}
    </Flex>
  );
}

export default App;
