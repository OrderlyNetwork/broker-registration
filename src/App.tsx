import {
  Callout,
  Container,
  Flex,
  Heading,
  RadioCards,
  Select,
  Tabs,
  Text,
  TextField
} from '@radix-ui/themes';
import { useConnectWallet, useSetChain } from '@web3-onboard/react';
import { useEffect, useState } from 'react';

import { Account } from './Account';
import { Assets } from './Assets';
import { DelegateSigner } from './DelegateSigner';
import { WalletConnection } from './WalletConnection';
import {
  BrokerInfo,
  DelegateSignerResponse,
  getAccountId,
  getBrokers,
  loadOrderlyKey,
  loadBrokerId,
  saveBrokerId,
  saveContractAddress,
  supportedChainIds,
  SupportedChainIds
} from './helpers';

function App() {
  const [brokerId, setBrokerId] = useState<string>('');
  const [brokers, setBrokers] = useState<BrokerInfo[]>([]);
  const [loadingBrokers, setLoadingBrokers] = useState<boolean>(false);
  const [contractAddress, setContractAddress] = useState<string>('');
  const [accountId, setAccountId] = useState<string>();
  const [delegateSigner, setDelegateSigner] = useState<DelegateSignerResponse>();
  const [orderlyKey, setOrderlyKey] = useState<Uint8Array>();
  const [showEOA, setShowEOA] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('account');
  const [registrationType, setRegistrationType] = useState<'eoa' | 'delegatesigner'>('eoa');
  const [brokerIdInputMode, setBrokerIdInputMode] = useState<'dropdown' | 'manual'>('dropdown');
  const [manualBrokerId, setManualBrokerId] = useState<string>('');

  const [{ wallet }, connectWallet] = useConnectWallet();
  const [{ connectedChain }] = useSetChain();

  useEffect(() => {
    connectWallet();
  }, [connectWallet]);

  useEffect(() => {
    setAccountId(undefined);
    if (connectedChain && supportedChainIds.includes(connectedChain.id as SupportedChainIds)) {
      const savedBrokerId = loadBrokerId(connectedChain.id as SupportedChainIds);
      setBrokerId(savedBrokerId);
      if (savedBrokerId && wallet) {
        if (registrationType === 'eoa') {
          const userAddress = wallet.accounts[0].address;
          if (userAddress) {
            setAccountId(getAccountId(userAddress, savedBrokerId));
            setShowEOA(true);
            setActiveTab('account');
          }
        } else if (contractAddress) {
          setAccountId(getAccountId(contractAddress, savedBrokerId));
          setShowEOA(false);
          setActiveTab('delegate-signer');
        }
      }
    } else {
      setBrokerId('');
      setContractAddress('');
      setBrokers([]);
    }
  }, [connectedChain, wallet, registrationType, contractAddress]);

  useEffect(() => {
    if (
      accountId &&
      connectedChain &&
      supportedChainIds.includes(connectedChain.id as SupportedChainIds)
    ) {
      setOrderlyKey(loadOrderlyKey(accountId, connectedChain.id as SupportedChainIds));
    } else {
      setOrderlyKey(undefined);
    }
  }, [accountId, connectedChain]);

  useEffect(() => {
    async function loadBrokers() {
      if (!connectedChain || !supportedChainIds.includes(connectedChain.id as SupportedChainIds)) {
        setBrokers([]);
        return;
      }
      setLoadingBrokers(true);
      try {
        const brokerList = await getBrokers(connectedChain.id as SupportedChainIds);
        setBrokers(brokerList);
      } catch (error) {
        console.error('Failed to load brokers:', error);
      } finally {
        setLoadingBrokers(false);
      }
    }
    loadBrokers();
  }, [connectedChain]);

  const updateAccountId = (newBrokerId: string) => {
    if (
      newBrokerId &&
      wallet &&
      connectedChain &&
      supportedChainIds.includes(connectedChain.id as SupportedChainIds)
    ) {
      if (registrationType === 'eoa') {
        const userAddress = wallet.accounts[0].address;
        if (userAddress) {
          setAccountId(getAccountId(userAddress, newBrokerId));
          saveBrokerId(connectedChain.id as SupportedChainIds, newBrokerId);
          setShowEOA(true);
          setActiveTab('account');
        }
      } else if (contractAddress) {
        setAccountId(getAccountId(contractAddress, newBrokerId));
        saveBrokerId(connectedChain.id as SupportedChainIds, newBrokerId);
        saveContractAddress(connectedChain.id as SupportedChainIds, contractAddress);
        setShowEOA(false);
        setActiveTab('delegate-signer');
      }
    }
  };

  const isChainSupported = supportedChainIds.includes(connectedChain?.id as SupportedChainIds);

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

      <Flex direction="column" gap="4">
        <Container style={{ width: '100%' }}>
          <WalletConnection />
        </Container>

        <Flex>
          <label>
            Registration Type
            <RadioCards.Root value={registrationType} columns={{ initial: '1', sm: '2' }}>
              <RadioCards.Item
                value="eoa"
                onClick={() => {
                  setRegistrationType('eoa');
                }}
              >
                <Flex direction="column" width="100%">
                  <Text weight="bold">EOA wallet</Text>
                </Flex>
              </RadioCards.Item>
              <RadioCards.Item
                value="delegatesigner"
                onClick={() => {
                  setRegistrationType('delegatesigner');
                }}
              >
                <Flex direction="column" width="100%">
                  <Text weight="bold">Multisig wallet</Text>
                </Flex>
              </RadioCards.Item>
            </RadioCards.Root>
          </label>
        </Flex>

        <Flex>
          <label>
            Broker ID
            <RadioCards.Root
              value={brokerIdInputMode}
              columns={{ initial: '1', sm: '2' }}
              style={{ marginBottom: '-0.5rem' }}
            >
              <RadioCards.Item
                value="dropdown"
                onClick={() => {
                  setBrokerIdInputMode('dropdown');
                }}
              >
                <Flex direction="column" width="100%">
                  <Text weight="bold">Select from list</Text>
                </Flex>
              </RadioCards.Item>
              <RadioCards.Item
                value="manual"
                onClick={() => {
                  setBrokerIdInputMode('manual');
                }}
              >
                <Flex direction="column" width="100%">
                  <Text weight="bold">Enter manually</Text>
                </Flex>
              </RadioCards.Item>
            </RadioCards.Root>
            <br />
            {brokerIdInputMode === 'dropdown' ? (
              <Select.Root
                value={brokerId}
                onValueChange={(value) => {
                  setBrokerId(value);
                  setAccountId(undefined);
                  updateAccountId(value);
                }}
                disabled={loadingBrokers || !isChainSupported}
              >
                <Select.Trigger
                  placeholder={loadingBrokers ? 'Loading brokers...' : 'Select a broker'}
                />
                <Select.Content>
                  {brokers.map((broker) => (
                    <Select.Item key={broker.broker_id} value={broker.broker_id}>
                      {broker.broker_id}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            ) : (
              <Flex gap="2" align="end">
                <TextField.Root
                  value={manualBrokerId}
                  onChange={(event) => {
                    const value = event.target.value;
                    setManualBrokerId(value);
                  }}
                  placeholder="Enter broker ID"
                  disabled={!isChainSupported}
                  style={{ flexGrow: 1 }}
                />
                <button
                  onClick={() => {
                    if (manualBrokerId) {
                      setBrokerId(manualBrokerId);
                      setAccountId(undefined);
                      updateAccountId(manualBrokerId);
                    }
                  }}
                  disabled={!manualBrokerId || !isChainSupported}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '4px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    cursor: manualBrokerId && isChainSupported ? 'pointer' : 'not-allowed',
                    opacity: manualBrokerId && isChainSupported ? 1 : 0.6
                  }}
                >
                  Load
                </button>
              </Flex>
            )}
          </label>
        </Flex>

        {registrationType === 'delegatesigner' && (
          <Flex gap="4" align="end">
            <label>
              Multisig Address
              <TextField.Root
                value={contractAddress}
                onChange={(event) => {
                  let value = event.target.value;
                  if (value.includes(':')) {
                    value = value.split(':')[1];
                  }
                  setContractAddress(value);
                  setAccountId(undefined);
                  if (
                    value &&
                    brokerId &&
                    connectedChain &&
                    supportedChainIds.includes(connectedChain.id as SupportedChainIds)
                  ) {
                    setAccountId(getAccountId(value, brokerId));
                    saveBrokerId(connectedChain.id as SupportedChainIds, brokerId);
                    saveContractAddress(connectedChain.id as SupportedChainIds, value);
                    setShowEOA(false);
                    setActiveTab('delegate-signer');
                  }
                }}
              />
            </label>
          </Flex>
        )}
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
