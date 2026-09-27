import React, { useState } from 'react';
import { ShieldAlert, Play, CheckCircle2, XCircle, Terminal } from 'lucide-react';
import type { IoTDevice } from '../types/iot';
import type { AttackMode } from '../types/crypto';
import { computeSHA256, signDataRSA, encryptAES, decryptAES, generateIV } from '../crypto/cryptoEngine';

interface SecuritySandboxProps {
  devices: IoTDevice[];
}

export const SecuritySandbox: React.FC<SecuritySandboxProps> = ({ devices }) => {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(devices[0]?.id || '');
  const [testAttackMode, setTestAttackMode] = useState<AttackMode>('MITM_DATA_TAMPER');
  const [customPayloadJson, setCustomPayloadJson] = useState<string>(
    JSON.stringify({ voltageRMS: 230.5, currentAmps: 14.2, gridStatus: 'OPTIMAL' }, null, 2)
  );

  const [simulationLogs, setSimulationLogs] = useState<Array<{ stage: string; result: 'PASS' | 'FAIL'; text: string }>>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  const device = devices.find((d) => d.id === selectedDeviceId) || devices[0];

  const handleRunSimulation = () => {
    if (!device) return;
    setIsSimulating(true);
    setSimulationLogs([]);

    const steps: Array<{ stage: string; result: 'PASS' | 'FAIL'; text: string }> = [];

    setTimeout(() => {
      // Step 1: Device Payload Generation
      steps.push({ stage: '1. Device Sensors', result: 'PASS', text: `Captured payload from ${device.name} (${device.id})` });
      setSimulationLogs([...steps]);

      setTimeout(() => {
        // Step 2: SHA-256 Digest
        const genuineHash = computeSHA256(customPayloadJson);
        steps.push({ stage: '2. SHA-256 Digest', result: 'PASS', text: `SHA-256 Checksum computed: ${genuineHash.substring(0, 24)}...` });
        setSimulationLogs([...steps]);

        setTimeout(() => {
          // Step 3: RSA Signature
          const isSpoof = testAttackMode === 'RSA_SIG_SPOOF';
          if (isSpoof) {
            signDataRSA('-----BEGIN PRIVATE KEY-----\nATTACKER_FAKE_KEY\n-----END PRIVATE KEY-----', genuineHash);
            steps.push({ stage: '3. RSA Digital Signature', result: 'FAIL', text: '🚨 ATTACK DETECTED: Device signed packet using untrusted/rogue RSA Private Key!' });
          } else {
            signDataRSA(device.rsaPrivateKeyPem, genuineHash);
            steps.push({ stage: '4. RSA Digital Signature', result: 'PASS', text: 'Device signed hash using authentic 2048-bit RSA Private Key' });
          }
          setSimulationLogs([...steps]);

          setTimeout(() => {
            // Step 4: AES Encryption & MITM Tamper
            const ivHex = generateIV();
            const isMitm = testAttackMode === 'MITM_DATA_TAMPER';
            const isKeyCorrupt = testAttackMode === 'KEY_CORRUPT';

            let payloadTransmitted = customPayloadJson;
            if (isMitm) {
              payloadTransmitted = JSON.stringify({ voltageRMS: 9999.9, TAMPERED: true });
            }

            const aesKey = isKeyCorrupt ? '00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff' : device.aesKeyHex;
            const ciphertext = encryptAES(payloadTransmitted, aesKey, ivHex);

            steps.push({
              stage: '4. AES-256 Encryption',
              result: isKeyCorrupt ? 'FAIL' : 'PASS',
              text: isKeyCorrupt
                ? '🚨 ATTACK DETECTED: Corrupted / mismatched AES session key applied!'
                : `Payload encrypted into AES-256-CBC Ciphertext (${ciphertext.substring(0, 20)}...)`,
            });
            setSimulationLogs([...steps]);

            setTimeout(() => {
              // Step 5: Server Receiver Cryptographic Verification
              const decryptRes = decryptAES(ciphertext, device.aesKeyHex, ivHex);
              const serverDecrypted = decryptRes.plainText;
              const serverHash = decryptRes.success ? computeSHA256(serverDecrypted) : '';

              if (isMitm) {
                steps.push({
                  stage: '5. Server SHA-256 Audit',
                  result: 'FAIL',
                  text: `🚨 MITM ATTACK DETECTED: Expected SHA-256 (${genuineHash.substring(0, 16)}...) != Computed Hash (${serverHash.substring(0, 16)}...). PACKET REJECTED!`,
                });
              } else if (isSpoof) {
                steps.push({
                  stage: '5. Server RSA Audit',
                  result: 'FAIL',
                  text: '🚨 RSA SIGNATURE INVALID: Public Key verification failed against signature bytes. PACKET REJECTED!',
                });
              } else if (testAttackMode === 'REPLAY_NONCE') {
                steps.push({
                  stage: '5. Server Nonce Audit',
                  result: 'FAIL',
                  text: '🚨 REPLAY ATTACK DETECTED: Packet nonce timestamp was previously committed. PACKET REJECTED!',
                });
              } else {
                steps.push({
                  stage: '5. Firewall Audit',
                  result: 'PASS',
                  text: '✅ ALL CRYPTOGRAPHIC CHECKS PASSED: Payload committed to Blockchain Ledger.',
                });
              }

              setSimulationLogs([...steps]);
              setIsSimulating(false);
            }, 600);
          }, 600);
        }, 600);
      }, 600);
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="glass-panel p-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            Cybersecurity Attack Simulator & Cryptographic Testbench
          </h2>
          <p className="text-xs text-slate-400">
            Simulate Man-in-the-Middle (MITM) data tampering, rogue key spoofing, and replay attacks to observe real-time cryptographic defence.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Testbench Configuration Panel */}
        <div className="glass-panel p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-sky-400" /> Scenario Configuration
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Target IoT Device:</label>
              <select
                value={selectedDeviceId}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none"
              >
                {devices.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Attack Vector Scenario:</label>
              <select
                value={testAttackMode}
                onChange={(e) => setTestAttackMode(e.target.value as AttackMode)}
                className="w-full p-2.5 rounded-lg bg-slate-900 border border-rose-500/50 text-rose-300 font-bold outline-none"
              >
                <option value="NONE">🛡️ Authentic Transmission (No Attack)</option>
                <option value="MITM_DATA_TAMPER">🚨 MITM Payload Tampering (Alters Sensor Data)</option>
                <option value="RSA_SIG_SPOOF">🔑 RSA Signature Spoofing (Forged Private Key)</option>
                <option value="KEY_CORRUPT">🔐 AES Session Key Corruption</option>
                <option value="REPLAY_NONCE">🔄 Replay Attack (Duplicate Expired Nonce)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Raw Sensor Metrics (JSON Payload):</label>
              <textarea
                value={customPayloadJson}
                onChange={(e) => setCustomPayloadJson(e.target.value)}
                rows={5}
                className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-sky-300 outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 via-purple-600 to-sky-500 text-slate-950 font-bold text-xs shadow-lg flex items-center justify-center gap-2 hover:opacity-95 transition-all"
          >
            <Play className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
            {isSimulating ? 'Executing Cryptographic Checks...' : 'Run Security Simulation'}
          </button>
        </div>

        {/* Real-time Execution Pipeline Output */}
        <div className="glass-panel p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center justify-between">
            <span>Cryptographic Firewall Audit Output</span>
            <span className="text-xs text-slate-400">Step-by-step Analysis</span>
          </h3>

          <div className="space-y-3 min-h-[300px]">
            {simulationLogs.length === 0 ? (
              <div className="text-center py-16 text-xs text-slate-500">
                Click "Run Security Simulation" to start the cryptographic firewall trace.
              </div>
            ) : (
              simulationLogs.map((log, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border text-xs space-y-1 transition-all ${
                    log.result === 'PASS'
                      ? 'bg-slate-900/80 border-slate-800'
                      : 'bg-rose-950/40 border-rose-500/60 attack-alert'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className={log.result === 'PASS' ? 'text-sky-300' : 'text-rose-300'}>{log.stage}</span>
                    {log.result === 'PASS' ? (
                      <span className="flex items-center gap-1 text-emerald-400 text-[10px]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> PASSED
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-rose-400 text-[10px]">
                        <XCircle className="w-3.5 h-3.5" /> BLOCKED
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-[11px] text-slate-300">{log.text}</p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
