import React, { useState } from 'react';
import { Cpu, Key, ShieldCheck, RefreshCw, Plus, CheckCircle } from 'lucide-react';
import type { IoTDevice, DeviceType } from '../types/iot';
import { calculateKeyFingerprint } from '../crypto/cryptoEngine';

interface DeviceManagerProps {
  devices: IoTDevice[];
  onRegisterDevice: (name: string, type: DeviceType, location: string) => Promise<IoTDevice>;
  onRotateKeys: (deviceId: string) => Promise<IoTDevice | null>;
  onSimulateTransmission: (deviceId: string) => void;
}

export const DeviceManager: React.FC<DeviceManagerProps> = ({
  devices,
  onRegisterDevice,
  onRotateKeys,
  onSimulateTransmission,
}) => {
  const [selectedDevice, setSelectedDevice] = useState<IoTDevice | null>(null);
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showHandshakeModal, setShowHandshakeModal] = useState<boolean>(false);
  
  // Handshake visualizer state
  const [handshakeStep, setHandshakeStep] = useState<number>(0);
  const [handshakeData, setHandshakeData] = useState<{
    nonce?: string;
    signature?: string;
    verified?: boolean;
  }>({});

  // New device form fields
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<DeviceType>('grid');
  const [newLocation, setNewLocation] = useState('');

  const handleStartHandshake = (device: IoTDevice) => {
    setSelectedDevice(device);
    setShowHandshakeModal(true);
    setHandshakeStep(1);

    const nonce = `NONCE-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Date.now()}`;
    setHandshakeData({ nonce });

    // Step 2: Device RSA signing
    setTimeout(() => {
      setHandshakeStep(2);
      const sig = `RSA_SIG_2048_${Math.random().toString(36).substring(2, 14).toUpperCase()}`;
      setHandshakeData((prev) => ({ ...prev, signature: sig }));

      // Step 3: Server RSA public key verification
      setTimeout(() => {
        setHandshakeStep(3);
        setHandshakeData((prev) => ({ ...prev, verified: true }));

        // Step 4: Auth Granted & Session Issued
        setTimeout(() => {
          setHandshakeStep(4);
        }, 1000);
      }, 1200);
    }, 1200);
  };

  const handleCreateDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newLocation) return;
    await onRegisterDevice(newName, newType, newLocation);
    setShowAddModal(false);
    setNewName('');
    setNewLocation('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-sky-400" />
            IoT Device Management & RSA Authentication
          </h2>
          <p className="text-xs text-slate-400">
            Provision IoT devices with 2048-bit RSA asymmetric key pairs and dynamic AES-256 session keys.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 hover:opacity-95 transition-all"
        >
          <Plus className="w-4 h-4" /> Provision New IoT Device
        </button>
      </div>

      {/* Device Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {devices.map((dev) => (
          <div key={dev.id} className="glass-card p-5 flex flex-col justify-between space-y-4">
            
            {/* Top row */}
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-sky-500/10 text-sky-300 border border-sky-500/20">
                  {dev.type}
                </span>
                <h3 className="text-base font-bold text-slate-100 mt-2">{dev.name}</h3>
                <p className="text-xs font-mono text-slate-400">{dev.id}</p>
              </div>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Online
              </span>
            </div>

            {/* Location & Firmware */}
            <div className="text-xs text-slate-400 space-y-1 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-500">Location:</span>
                <span className="text-slate-300 truncate max-w-[180px]">{dev.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Firmware:</span>
                <span className="font-mono text-slate-300">{dev.firmwareVersion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">RSA Fingerprint:</span>
                <span className="font-mono text-sky-400 text-[11px]">{calculateKeyFingerprint(dev.rsaPublicKeyPem)}</span>
              </div>
            </div>

            {/* Device Stats */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[10px]">Sent</div>
                <div className="font-bold text-sky-400">{dev.stats.packetsSent}</div>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[10px]">Verified</div>
                <div className="font-bold text-emerald-400">{dev.stats.packetsVerified}</div>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[10px]">Tampered</div>
                <div className="font-bold text-rose-400">{dev.stats.tamperAttempts}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => handleStartHandshake(dev)}
                className="flex items-center justify-center gap-1 p-2 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 text-xs font-semibold border border-sky-500/30 transition-all"
                title="Run RSA Challenge-Response Auth Handshake"
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Auth
              </button>

              <button
                onClick={() => {
                  setSelectedDevice(dev);
                  setShowKeyModal(true);
                }}
                className="flex items-center justify-center gap-1 p-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30 transition-all"
                title="View RSA Keypair & Certificates"
              >
                <Key className="w-3.5 h-3.5" /> Keys
              </button>

              <button
                onClick={() => onSimulateTransmission(dev.id)}
                className="flex items-center justify-center gap-1 p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition-all"
                title="Trigger Manual Crypto Payload Transmission"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Send
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* RSA Handshake Modal */}
      {showHandshakeModal && selectedDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="glass-panel max-w-xl w-full p-6 space-y-6 relative border-sky-500/40">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-sky-400" />
                <h3 className="text-base font-bold text-slate-100">
                  RSA Challenge-Response Handshake Protocol
                </h3>
              </div>
              <button
                onClick={() => setShowHandshakeModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Simulating Zero-Trust device authentication for <span className="text-sky-300 font-bold">{selectedDevice.name}</span>.
            </p>

            {/* Handshake Visual Steps */}
            <div className="space-y-4">
              {/* Step 1 */}
              <div className={`p-3 rounded-xl border transition-all ${handshakeStep >= 1 ? 'bg-slate-900 border-sky-500/40' : 'bg-slate-950/40 border-slate-800 opacity-50'}`}>
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="text-sky-300">Step 1: Server Challenge Nonce</span>
                  {handshakeStep >= 1 && <span className="text-emerald-400 text-[10px]">✓ Issued</span>}
                </div>
                <p className="text-[11px] text-slate-400">Server generates dynamic 256-bit cryptographic nonce.</p>
                {handshakeData.nonce && (
                  <div className="font-mono text-[10px] text-sky-400 mt-1 bg-slate-950 p-1.5 rounded truncate">
                    {handshakeData.nonce}
                  </div>
                )}
              </div>

              {/* Step 2 */}
              <div className={`p-3 rounded-xl border transition-all ${handshakeStep >= 2 ? 'bg-slate-900 border-purple-500/40' : 'bg-slate-950/40 border-slate-800 opacity-50'}`}>
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="text-purple-300">Step 2: Device RSA Signature</span>
                  {handshakeStep >= 2 && <span className="text-emerald-400 text-[10px]">✓ Signed</span>}
                </div>
                <p className="text-[11px] text-slate-400">Device signs nonce using local 2048-bit RSA Private Key.</p>
                {handshakeData.signature && (
                  <div className="font-mono text-[10px] text-purple-400 mt-1 bg-slate-950 p-1.5 rounded truncate">
                    {handshakeData.signature}
                  </div>
                )}
              </div>

              {/* Step 3 */}
              <div className={`p-3 rounded-xl border transition-all ${handshakeStep >= 3 ? 'bg-slate-900 border-emerald-500/40' : 'bg-slate-950/40 border-slate-800 opacity-50'}`}>
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="text-emerald-300">Step 3: Server Public Key Verification</span>
                  {handshakeStep >= 3 && <span className="text-emerald-400 text-[10px]">✓ Verified</span>}
                </div>
                <p className="text-[11px] text-slate-400">Server decrypts signature using registered Device RSA Public Key.</p>
              </div>

              {/* Step 4 */}
              <div className={`p-3 rounded-xl border transition-all ${handshakeStep >= 4 ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200' : 'bg-slate-950/40 border-slate-800 opacity-50'}`}>
                <div className="flex items-center gap-2 text-xs font-bold">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span>Authentication Successful! AES-256 Session Key Issued</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowHandshakeModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700"
              >
                Close Visualizer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RSA Key Inspector Modal */}
      {showKeyModal && selectedDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="glass-panel max-w-2xl w-full p-6 space-y-4 relative border-purple-500/40">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-slate-100">
                  RSA 2048-bit Key Pair & Certificates: {selectedDevice.name}
                </h3>
              </div>
              <button onClick={() => setShowKeyModal(false)} className="text-slate-400 hover:text-slate-200">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">RSA Public Key (PEM X.509 Standard):</label>
                <textarea
                  readOnly
                  value={selectedDevice.rsaPublicKeyPem}
                  className="w-full h-28 p-2 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[10px] text-sky-300 outline-none resize-none"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">RSA Private Key (Stored Securely on Device HSM):</label>
                <textarea
                  readOnly
                  value={selectedDevice.rsaPrivateKeyPem}
                  className="w-full h-28 p-2 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[10px] text-purple-300 outline-none resize-none"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Symmetric AES-256 Session Key (Hex):</label>
                <input
                  type="text"
                  readOnly
                  value={selectedDevice.aesKeyHex}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 font-mono text-emerald-400 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                onClick={async () => {
                  await onRotateKeys(selectedDevice.id);
                  const updated = devices.find((d) => d.id === selectedDevice.id);
                  if (updated) setSelectedDevice(updated);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-semibold hover:bg-purple-500/30"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Rotate RSA Key Pair
              </button>

              <button
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Provision New Device Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <form onSubmit={handleCreateDevice} className="glass-panel max-w-md w-full p-6 space-y-4 border-sky-500/40">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Plus className="w-5 h-5 text-sky-400" /> Provision New IoT Device Node
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Device Name / Tag:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smart City Solar Array SC-90"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Device Category:</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as DeviceType)}
                  className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none"
                >
                  <option value="grid">Smart Grid Substation</option>
                  <option value="medical">Medical Patient Telemetry</option>
                  <option value="drone">Autonomous Drone Patrol</option>
                  <option value="industrial">Industrial Turbine / Hydro Sensor</option>
                  <option value="surveillance">Smart City Surveillance Camera</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Location Coordinates / Zone:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Substation Zone Delta (37.80, -122.27)"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 text-slate-950 font-bold text-xs shadow-md"
              >
                Generate RSA Keys & Provision
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
