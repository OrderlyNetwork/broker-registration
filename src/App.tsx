import { Button, Callout, Container, Flex, Heading, Tabs, Text, TextField } from '@radix-ui/themes';
import { useConnectWallet, useSetChain } from '@web3-onboard/react';
import { useEffect, useState } from 'react';

import { Account } from './Account';
import { Assets } from './Assets';
import { DelegateSigner } from './DelegateSigner';
import { WalletConnection } from './WalletConnection';
import {
  DelegateSignerResponse,
  getAccountId,
  loadOrderlyKey,
  loadBrokerId,
  saveBrokerId,
  saveContractAddress,
  supportedChainIds
} from './helpers';

function App() {
  const [brokerId, setBrokerId] = useState<string>('');
  const [contractAddress, setContractAddress] = useState<string>('');
  const [accountId, setAccountId] = useState<string>();
  const [delegateSigner, setDelegateSigner] = useState<DelegateSignerResponse>();
  const [orderlyKey, setOrderlyKey] = useState<Uint8Array>();
  const [showEOA, setShowEOA] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('account');

  const [{ wallet }, connectWallet] = useConnectWallet();
  const [{ connectedChain }] = useSetChain();

  useEffect(() => {
    connectWallet();
  }, [connectWallet]);

  useEffect(() => {
    setAccountId(undefined);
    if (connectedChain) {
      setBrokerId(loadBrokerId(connectedChain.id));
    } else {
      setBrokerId('');
      setContractAddress('');
    }
  }, [connectedChain]);

  useEffect(() => {
    if (accountId && connectedChain) {
      setOrderlyKey(loadOrderlyKey(accountId, connectedChain.id));
    } else {
      setOrderlyKey(undefined);
    }
  }, [accountId, connectedChain]);

  const isChainSupported = supportedChainIds.includes(Number(connectedChain?.id));

  return (
    <Flex
      style={{ padding: '2rem 0', margin: '0 auto', maxWidth: '45rem' }}
      direction="column"
      gap="6"
    >
      <Heading style={{ alignSelf: 'center' }}>Orderly Broker Registration</Heading>

      <Text>
        This app lets you register an account in the Orderly Network infrastructure with any wallet
        address and any broker ID. The address can be a smart contract account (via Delegate Signer
        feature) or an EOA user address. The source code is available on{' '}
        <a
          href="https://github.com/OrderlyNetwork/broker-registration"
          target="_blank"
          rel="noopener"
        >
          Github
        </a>
        .
      </Text>

      <Flex gap="2" align="end" wrap="wrap">
        <Container style={{ width: '100%' }}>
          <WalletConnection />
        </Container>

        <Flex gap="2" align="end">
          <label>
            Broker ID
            <TextField.Root
              value={brokerId}
              onChange={(event) => {
                setBrokerId(event.target.value);
                setAccountId(undefined);
              }}
            />
          </label>

          <Button
            disabled={!brokerId || !connectedChain || !isChainSupported}
            onClick={async () => {
              if (!brokerId || !wallet || !connectedChain) return;
              const userAddress = wallet.accounts[0].address;
              if (!userAddress) return;
              setAccountId(getAccountId(userAddress, brokerId));
              saveBrokerId(connectedChain.id, brokerId);
              setShowEOA(true);
              setActiveTab('account');
            }}
          >
            Load Connected Address
          </Button>
        </Flex>

        <Flex gap="4" align="end">
          <label>
            Delegate Signer Address
            <TextField.Root
              value={contractAddress}
              onChange={(event) => {
                setContractAddress(event.target.value);
                setAccountId(undefined);
              }}
            />
          </label>

          <Button
            disabled={
              !brokerId ||
              !contractAddress ||
              !connectedChain ||
              contractAddress.toLowerCase() === wallet?.accounts[0].address.toLowerCase() ||
              !isChainSupported
            }
            onClick={async () => {
              if (!brokerId || !contractAddress || !connectedChain) return;
              setAccountId(getAccountId(contractAddress, brokerId));
              saveBrokerId(connectedChain.id, brokerId);
              saveContractAddress(connectedChain.id, contractAddress);
              setShowEOA(false);
              setActiveTab('delegate-signer');
            }}
          >
            Load Delegate Signer
          </Button>
        </Flex>
      </Flex>

      {accountId ? (
        <Tabs.Root value={activeTab}>
          <Tabs.List>
            {showEOA ? (
              <Tabs.Trigger value="account" onClick={() => setActiveTab('account')}>
                Account
              </Tabs.Trigger>
            ) : (
              <Tabs.Trigger value="delegate-signer" onClick={() => setActiveTab('delegate-signer')}>
                Delegate Signer
              </Tabs.Trigger>
            )}
            <Tabs.Trigger value="assets" onClick={() => setActiveTab('assets')}>
              Assets
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="account">
            <Account
              brokerId={brokerId}
              accountId={accountId}
              orderlyKey={orderlyKey}
              setOrderlyKey={setOrderlyKey}
            />
          </Tabs.Content>
          <Tabs.Content value="delegate-signer">
            <DelegateSigner
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
              showEOA={showEOA}
              orderlyKey={orderlyKey}
            />
          </Tabs.Content>
        </Tabs.Root>
      ) : (
        <Callout.Root variant="outline" style={{ alignSelf: 'center' }}>
          <Callout.Text>Please insert your Broker ID and Wallet Address.</Callout.Text>
        </Callout.Root>
      )}

      {!isChainSupported && (
        <Callout.Root variant="outline" color="red" style={{ alignSelf: 'center' }}>
          <Callout.Text>Please connect to a supported chain.</Callout.Text>
        </Callout.Root>
      )}
    </Flex>
  );
}

export default App;
