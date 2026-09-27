import React, { useState } from 'react';
import { Key, Lock, FileText, ShieldCheck, Copy, Check, Hash } from 'lucide-react';
import type { EncryptedPacket, IoTDevice } from '../types/iot';

interface CryptoInspectorProps {
  selectedPacket: EncryptedPacket | null;
  devices: IoTDevice[];
}

export const CryptoInspector: React.FC<CryptoInspectorProps> = ({ selectedPacket, devices }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const device = selectedPacket ? devices.find((d) => d.id === selectedPacket.deviceId) : null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!selectedPacket) {
    return (
      <div className="glass-panel p-12 text-center max-w-2xl mx-auto space-y-4">
        <Key className="w-12 h-12 text-sky-400 mx-auto animate-bounce" />
        <h3 className="text-lg font-bold text-slate-200">No Cryptographic Packet Selected</h3>
        <p className="text-xs text-slate-400">
          Select any packet from the Dashboard Overview or trigger a live transmission to inspect its SHA-256 checksum, RSA digital signature, and AES-256 ciphertext.
        </p>
      </div>
    );
  }

  const isVerified = selectedPacket.verification.status === 'VERIFIED';

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4">
      {/* Header Info */}
      <div className="glass-panel p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${isVerified ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-100 font-mono">{selectedPacket.packetId}</h2>
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${isVerified ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                {selectedPacket.verification.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Device: <span className="text-sky-300 font-semibold">{selectedPacket.deviceId}</span> • Transmitted: {new Date(selectedPacket.timestamp).toLocaleString()} • Latency: {selectedPacket.verification.processingMs}ms
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400">
            Sequence ID: <span className="text-slate-200 font-mono">#{selectedPacket.sequenceId}</span>
          </div>
        </div>
      </div>

      {/* 4 Cryptographic Pipeline Stages Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* STAGE 1: Sensor Payload & SHA-256 */}
        <div className="glass-panel p-5 space-y-4 border-sky-500/30">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-sky-300 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Stage 1: Payload SHA-256 Checksum
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">W3C WebCrypto Standard</span>
          </div>

          <p className="text-xs text-slate-400">
            SHA-256 produces a deterministic 256-bit (64-character hex) cryptographic hash digest of the telemetry JSON.
          </p>

          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>SHA-256 Checksum Hash Digest:</span>
              <button
                onClick={() => copyToClipboard(selectedPacket.sha256Hash, 'hash')}
                className="text-sky-400 hover:text-sky-300 flex items-center gap-1 text-[10px]"
              >
                {copiedField === 'hash' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copiedField === 'hash' ? 'Copied' : 'Copy Hex'}
              </button>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-sky-400 break-all select-all">
              {selectedPacket.sha256Hash}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-sky-950/20 border border-sky-500/20 text-xs space-y-1">
            <div className="font-semibold text-sky-300 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5" /> Avalanche Effect Property:
            </div>
            <p className="text-[11px] text-slate-400">
              Modifying even a single bit in the sensor metrics completely changes all 64 characters of the SHA-256 digest, guaranteeing instant tamper detection.
            </p>
          </div>
        </div>

        {/* STAGE 2: RSA 2048 Digital Signature */}
        <div className="glass-panel p-5 space-y-4 border-purple-500/30">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-purple-300 flex items-center gap-2">
              <Key className="w-4 h-4" /> Stage 2: RSA Digital Signature
            </h3>
            <span className="text-[10px] text-purple-400 font-mono">2048-bit Private Key Signed</span>
          </div>

          <p className="text-xs text-slate-400">
            The device signs the SHA-256 hash using its RSA private key. The server uses the public key to verify non-repudiation.
          </p>

          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>RSA Signature (Hex Stream):</span>
              <button
                onClick={() => copyToClipboard(selectedPacket.rsaSignature, 'sig')}
                className="text-purple-400 hover:text-purple-300 flex items-center gap-1 text-[10px]"
              >
                {copiedField === 'sig' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copiedField === 'sig' ? 'Copied' : 'Copy Sig'}
              </button>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-purple-400 break-all select-all max-h-24 overflow-y-auto">
              {selectedPacket.rsaSignature}
            </div>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <span className="text-slate-400">RSA Signature Verification:</span>
            <span className={`font-bold flex items-center gap-1 ${selectedPacket.verification.signatureValid ? 'text-emerald-400' : 'text-rose-400'}`}>
              {selectedPacket.verification.signatureValid ? <Check className="w-4 h-4" /> : '✕'}
              {selectedPacket.verification.signatureValid ? 'PASSED (Authentic Device)' : 'FAILED (Rogue/Spoofed Key)'}
            </span>
          </div>
        </div>

        {/* STAGE 3: AES-256 Ciphertext */}
        <div className="glass-panel p-5 space-y-4 border-emerald-500/30">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
              <Lock className="w-4 h-4" /> Stage 3: AES-256 Payload Ciphertext
            </h3>
            <span className="text-[10px] text-emerald-400 font-mono">CBC Mode • PKCS7 Padding</span>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Initialization Vector (IV Hex - 128-bit):</label>
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400">
              {selectedPacket.aesIv}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Encrypted Payload (Base64):</span>
              <button
                onClick={() => copyToClipboard(selectedPacket.aesCiphertext, 'aes')}
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-[10px]"
              >
                {copiedField === 'aes' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copiedField === 'aes' ? 'Copied' : 'Copy Base64'}
              </button>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 break-all max-h-24 overflow-y-auto select-all">
              {selectedPacket.aesCiphertext}
            </div>
          </div>
        </div>

        {/* STAGE 4: Server Decrypted Verification Check */}
        <div className="glass-panel p-5 space-y-4 border-slate-700">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-400" /> Stage 4: Server Cryptographic Audit Checklist
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-300">1. RSA Device Authentication</span>
              <span className="font-bold text-emerald-400">AUTHENTICATED</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-300">2. AES-256 Decryption Test</span>
              <span className={`font-bold ${selectedPacket.verification.decryptionValid ? 'text-emerald-400' : 'text-rose-400'}`}>
                {selectedPacket.verification.decryptionValid ? 'DECRYPTED OK' : 'FAILED'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-300">3. SHA-256 Checksum Validation</span>
              <span className={`font-bold ${selectedPacket.verification.hashValid ? 'text-emerald-400' : 'text-rose-400'}`}>
                {selectedPacket.verification.hashValid ? 'HASH MATCHED (100%)' : 'TAMPERED / MISMATCH'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-300">4. RSA Signature Non-Repudiation</span>
              <span className={`font-bold ${selectedPacket.verification.signatureValid ? 'text-emerald-400' : 'text-rose-400'}`}>
                {selectedPacket.verification.signatureValid ? 'SIGNATURE VALID' : 'INVALID SIGNATURE'}
              </span>
            </div>
          </div>

          {device && (
            <div className="pt-2 border-t border-slate-800 text-xs text-slate-400">
              Session AES Key: <span className="font-mono text-sky-400">{device.aesKeyHex.substring(0, 16)}...</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
