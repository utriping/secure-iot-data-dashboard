import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { DeviceManager } from './components/DeviceManager';
import { CryptoInspector } from './components/CryptoInspector';
import { BlockchainExplorer } from './components/BlockchainExplorer';
import { SecuritySandbox } from './components/SecuritySandbox';

import type { IoTDevice, EncryptedPacket, DeviceType } from './types/iot';
import type { AttackMode, CryptoLogEntry } from './types/crypto';
import type { Block, BlockchainTransaction } from './types/blockchain';
import { iotSimulator } from './services/iotSimulator';
import { blockchainService } from './services/blockchainEngine';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [attackMode, setAttackMode] = useState<AttackMode>('NONE');
  const [isStreaming, setIsStreaming] = useState<boolean>(true);

  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [packets, setPackets] = useState<EncryptedPacket[]>([]);
  const [cryptoLogs, setCryptoLogs] = useState<CryptoLogEntry[]>([]);
  const [chain, setChain] = useState<Block[]>([]);
  const [pendingTxs, setPendingTxs] = useState<BlockchainTransaction[]>([]);
  const [selectedPacket, setSelectedPacket] = useState<EncryptedPacket | null>(null);

  const [packetsPerSec, setPacketsPerSec] = useState<number>(0);
  const [difficulty, setDifficulty] = useState<number>(2);

  // Sync state from simulator & blockchain service on mount
  useEffect(() => {
    setDevices([...iotSimulator.getDevices()]);
    setChain([...blockchainService.getChain()]);
    setPendingTxs([...blockchainService.getPendingTransactions()]);

    // Initial warm-up transmissions
    for (let i = 0; i < 5; i++) {
      const { packet, log } = iotSimulator.simulateTelemetryTransmission();
      handlePacketReceived(packet, log);
    }
  }, []);

  // Update attack mode on simulator
  useEffect(() => {
    iotSimulator.setAttackMode(attackMode);
  }, [attackMode]);

  // Handle incoming packets
  const handlePacketReceived = (packet: EncryptedPacket, _log: CryptoLogEntry) => {
    setPackets((prev) => [packet, ...prev.slice(0, 49)]);
    setCryptoLogs([...iotSimulator.getCryptoLogs()]);
    setDevices([...iotSimulator.getDevices()]);

    // If verified packet, create Blockchain Transaction
    if (packet.verification.status === 'VERIFIED') {
      const tx: BlockchainTransaction = {
        id: `TX-${packet.packetId}`,
        timestamp: packet.timestamp,
        deviceId: packet.deviceId,
        deviceName: packet.deviceId,
        eventType: 'IOT_TELEMETRY',
        dataHash: packet.sha256Hash,
        rsaSignature: packet.rsaSignature,
        payloadSummary: `Telemetry payload (Seq #${packet.sequenceId}) verified via RSA & SHA-256`,
        verificationStatus: 'VERIFIED',
      };
      blockchainService.addTransaction(tx);
      setPendingTxs([...blockchainService.getPendingTransactions()]);
    }
  };

  // Interval telemetry streaming engine
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      const { packet, log } = iotSimulator.simulateTelemetryTransmission();
      handlePacketReceived(packet, log);

      setPacketsPerSec(+(Math.random() * 2 + 1).toFixed(1));

      // Auto mine block if pending txs >= 4
      if (blockchainService.getPendingTransactions().length >= 4) {
        blockchainService.minePendingTransactions('AUTO_VALIDATOR_NODE');
        setChain([...blockchainService.getChain()]);
        setPendingTxs([...blockchainService.getPendingTransactions()]);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [isStreaming]);

  // Manual Mine PoW Block
  const handleMineBlock = () => {
    blockchainService.setDifficulty(difficulty);
    blockchainService.minePendingTransactions('OPERATOR_MINER_01');
    setChain([...blockchainService.getChain()]);
    setPendingTxs([...blockchainService.getPendingTransactions()]);
  };

  // Register New Device
  const handleRegisterDevice = async (name: string, type: DeviceType, location: string) => {
    const dev = await iotSimulator.registerNewDevice(name, type, location);
    setDevices([...iotSimulator.getDevices()]);

    // Log RSA Auth Event in Blockchain
    const tx: BlockchainTransaction = {
      id: `TX-REG-${dev.id}`,
      timestamp: Date.now(),
      deviceId: dev.id,
      deviceName: dev.name,
      eventType: 'RSA_AUTHENTICATION',
      dataHash: dev.rsaPublicKeyPem.substring(0, 32),
      rsaSignature: 'RSA_PROVISION_CERT_2048',
      payloadSummary: `Provisioned 2048-bit RSA Keypair & X.509 cert for ${dev.name}`,
      verificationStatus: 'VERIFIED',
    };
    blockchainService.addTransaction(tx);
    setPendingTxs([...blockchainService.getPendingTransactions()]);

    return dev;
  };

  // Rotate Device Keys
  const handleRotateKeys = async (deviceId: string) => {
    const dev = await iotSimulator.rotateDeviceKeys(deviceId);
    setDevices([...iotSimulator.getDevices()]);
    return dev;
  };

  // Manual trigger transmission
  const handleSimulateTransmission = (deviceId: string) => {
    const { packet, log } = iotSimulator.simulateTelemetryTransmission(deviceId);
    handlePacketReceived(packet, log);
    setSelectedPacket(packet);
  };

  // Tamper Block in Blockchain
  const handleTamperBlock = (blockIndex: number) => {
    blockchainService.tamperBlock(blockIndex, 'ATTACKER_ALTERED_PAYLOAD_UNAUTHORIZED');
    setChain([...blockchainService.getChain()]);
  };

  const validation = blockchainService.validateChain();
  const tamperCount = packets.filter((p) => p.verification.status !== 'VERIFIED').length;

  return (
    <div className="min-h-screen pb-12">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        attackMode={attackMode}
        setAttackMode={setAttackMode}
        isStreaming={isStreaming}
        setIsStreaming={setIsStreaming}
        activeDeviceCount={devices.length}
        blockCount={chain.length}
        packetsPerSec={packetsPerSec}
        tamperCount={tamperCount}
        onMineBlock={handleMineBlock}
      />

      <main>
        {activeTab === 'overview' && (
          <DashboardOverview
            devices={devices}
            recentPackets={packets}
            cryptoLogs={cryptoLogs}
            attackMode={attackMode}
            onSelectPacket={(pkt) => {
              setSelectedPacket(pkt);
              setActiveTab('crypto');
            }}
          />
        )}

        {activeTab === 'devices' && (
          <DeviceManager
            devices={devices}
            onRegisterDevice={handleRegisterDevice}
            onRotateKeys={handleRotateKeys}
            onSimulateTransmission={(id) => {
              handleSimulateTransmission(id);
              setActiveTab('crypto');
            }}
          />
        )}

        {activeTab === 'crypto' && (
          <CryptoInspector
            selectedPacket={selectedPacket || packets[0] || null}
            devices={devices}
          />
        )}

        {activeTab === 'blockchain' && (
          <BlockchainExplorer
            chain={chain}
            pendingTransactions={pendingTxs}
            validation={validation}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            onMineBlock={handleMineBlock}
            onTamperBlock={handleTamperBlock}
          />
        )}

        {activeTab === 'sandbox' && (
          <SecuritySandbox devices={devices} />
        )}
      </main>
    </div>
  );
};

export default App;
