import { Button, Container, DropdownMenu, Flex, Tabs } from '@radix-ui/themes';
import { useConnectWallet, useSetChain } from '@web3-onboard/react';
import { useEffect, useState } from 'react';

import { Account } from './Account';
import { Assets } from './Assets';
import Arbitrum from './assets/arbitrum.svg?raw';
import ArbitrumSepolia from './assets/arbitrum_sepolia.svg?raw';
import Optimism from './assets/optimism.svg?raw';
import OptimismSepolia from './assets/optimism_sepolia.svg?raw';
import Questionmark from './assets/questionmark.svg?raw';
import { DelegateSignerResponse } from './helpers/delegateSigner';

function App() {
  const [delegateSigner, setDelegateSigner] = useState<DelegateSignerResponse>();
  const [_delegateOrderlyKey, setDelegateOrderlyKey] = useState<string>();

  const [{ wallet }, connectWallet] = useConnectWallet();
  const [{ connectedChain }, setChain] = useSetChain();

  useEffect(() => {
    connectWallet();
  }, [connectWallet]);

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
    <Container style={{ margin: '2rem auto', maxWidth: '45rem' }}>
      <Flex gap="4" align="center" wrap="wrap">
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
              <DropdownMenu.Item onSelect={selectChain('0xa4b1')}>
                <img
                  src={`data:image/svg+xml;base64,${btoa(Arbitrum)}`}
                  style={{ marginRight: '0.3rem', height: '1.8rem' }}
                />
                Arbitrum One
              </DropdownMenu.Item>
              <DropdownMenu.Item onSelect={selectChain('0xa')}>
                <img
                  src={`data:image/svg+xml;base64,${btoa(Optimism)}`}
                  style={{ marginRight: '0.3rem', height: '1.8rem' }}
                />
                OP Mainnet
              </DropdownMenu.Item>
              <DropdownMenu.Separator />
              <DropdownMenu.Label>Testnet</DropdownMenu.Label>
              <DropdownMenu.Item onSelect={selectChain('0x66eee')}>
                <img
                  src={`data:image/svg+xml;base64,${btoa(ArbitrumSepolia)}`}
                  style={{ marginRight: '0.3rem', height: '1.8rem' }}
                />
                Arbitrum Sepolia
              </DropdownMenu.Item>
              <DropdownMenu.Item onSelect={selectChain('0xaa37dc')}>
                <img
                  src={`data:image/svg+xml;base64,${btoa(OptimismSepolia)}`}
                  style={{ marginRight: '0.3rem', height: '1.8rem' }}
                />
                OP Sepolia
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
      </Flex>

      <Tabs.Root defaultValue="account" style={{ marginTop: '1rem' }}>
        <Tabs.List>
          <Tabs.Trigger value="account">Account</Tabs.Trigger>
          <Tabs.Trigger value="assets">Assets</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="account">
          <Account
            delegateSigner={delegateSigner}
            setDelegateSigner={setDelegateSigner}
            setDelegateOrderlyKey={setDelegateOrderlyKey}
          />
        </Tabs.Content>
        <Tabs.Content value="assets">
          <Assets delegateSigner={delegateSigner} />
        </Tabs.Content>
      </Tabs.Root>
    </Container>
  );
}

export default App;
