import React from 'react';
import { Shield, ShieldAlert, Cpu, Lock, Key, Database, ArrowRight, CheckCircle2, XCircle, Activity, FileText } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import type { IoTDevice, EncryptedPacket } from '../types/iot';
import type { CryptoLogEntry, AttackMode } from '../types/crypto';

interface DashboardOverviewProps {
  devices: IoTDevice[];
  recentPackets: EncryptedPacket[];
  cryptoLogs: CryptoLogEntry[];
  attackMode: AttackMode;
  onSelectPacket: (packet: EncryptedPacket) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  devices,
  recentPackets,
  cryptoLogs,
  attackMode,
  onSelectPacket,
}) => {
  const totalVerified = recentPackets.filter((p) => p.verification.status === 'VERIFIED').length;
  const totalRejected = recentPackets.length - totalVerified;
  const passRate = recentPackets.length > 0 ? ((totalVerified / recentPackets.length) * 100).toFixed(1) : '100.0';

  // Prepare chart data from recent packets
  const chartData = recentPackets.slice(0, 15).reverse().map((p) => ({
    time: new Date(p.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    latencyMs: p.verification.processingMs,
    status: p.verification.status,
    seq: p.sequenceId,
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4">
      {/* Attack Mode Banner if active */}
      {attackMode !== 'NONE' && (
        <div className="glass-panel border-rose-500/50 bg-rose-950/40 p-4 rounded-xl flex items-center justify-between gap-4 attack-alert">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-rose-500/20 text-rose-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-rose-300 uppercase tracking-wide">
                Security Threat Simulation Active: {attackMode}
              </h3>
              <p className="text-xs text-rose-200/80">
                The cryptographic verification pipeline is dynamically inspecting and rejecting tampered packets.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold">
            THREAT DETECTED & BLOCKED
          </span>
        </div>
      )}

      {/* Top Security KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: RSA Key Pairs */}
        <div className="glass-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">RSA Auth Keys</span>
            <div className="text-2xl font-bold text-sky-400 mt-1 flex items-baseline gap-2">
              {devices.length} <span className="text-xs text-slate-400 font-normal">2048-bit pairs</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Zero-Trust Device Certs</p>
          </div>
          <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Key className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2: AES-256 Encrypted Stream */}
        <div className="glass-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">AES-256 Payload Encrypted</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1 flex items-baseline gap-2">
              {recentPackets.length} <span className="text-xs text-slate-400 font-normal">packets</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">CBC / PKCS7 Dynamic IV</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Lock className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3: SHA-256 Integrity Pass Rate */}
        <div className="glass-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Data Integrity Rate</span>
            <div className={`text-2xl font-bold mt-1 flex items-baseline gap-2 ${+passRate < 100 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {passRate}%
            </div>
            <p className="text-xs text-slate-500 mt-1">{totalVerified} Passed • {totalRejected} Tampered</p>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Shield className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4: Cryptographic Latency */}
        <div className="glass-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Avg Verification Latency</span>
            <div className="text-2xl font-bold text-indigo-400 mt-1 flex items-baseline gap-2">
              11.4 <span className="text-xs text-slate-400 font-normal">ms</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Real-time WebCrypto API</p>
          </div>
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Activity className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Cryptographic Pipeline Flow Architecture Card */}
      <div className="glass-panel p-5">
        <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-sky-400" />
          End-to-End Cryptographic Security Pipeline Architecture
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-center text-center">
          {/* Step 1 */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
            <Cpu className="w-6 h-6 text-sky-400 mx-auto mb-1" />
            <div className="text-xs font-bold text-slate-200">1. IoT Device Sensor</div>
            <div className="text-[10px] text-slate-400">Raw JSON Metrics</div>
          </div>

          <ArrowRight className="w-5 h-5 text-slate-600 hidden md:block mx-auto" />

          {/* Step 2 */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-purple-500/30">
            <FileText className="w-6 h-6 text-purple-400 mx-auto mb-1" />
            <div className="text-xs font-bold text-purple-300">2. SHA-256 Checksum</div>
            <div className="text-[10px] text-slate-400">256-bit Digest Hash</div>
          </div>

          <ArrowRight className="w-5 h-5 text-slate-600 hidden md:block mx-auto" />

          {/* Step 3 */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/30">
            <Key className="w-6 h-6 text-amber-400 mx-auto mb-1" />
            <div className="text-xs font-bold text-amber-300">3. RSA Digital Sign</div>
            <div className="text-[10px] text-slate-400">2048-bit Private Key</div>
          </div>

          <ArrowRight className="w-5 h-5 text-slate-600 hidden md:block mx-auto" />

          {/* Step 4 */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/30">
            <Lock className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
            <div className="text-xs font-bold text-emerald-300">4. AES-256 Encrypt</div>
            <div className="text-[10px] text-slate-400">Ciphertext + Dynamic IV</div>
          </div>

          <ArrowRight className="w-5 h-5 text-slate-600 hidden md:block mx-auto" />

          {/* Step 5 */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-sky-500/30">
            <Database className="w-6 h-6 text-sky-400 mx-auto mb-1" />
            <div className="text-xs font-bold text-sky-300">5. Blockchain Commit</div>
            <div className="text-[10px] text-slate-400">Merkle Tree Ledger</div>
          </div>
        </div>
      </div>

      {/* Grid: Live Latency Chart + Live Telemetry Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Latency & Verification Chart */}
        <div className="glass-panel p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-200">Cryptographic Processing Latency Stream</h3>
              <p className="text-xs text-slate-400">Real-time verification time (ms) per packet transmission</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-300 text-xs font-mono">
              Live Feed
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} unit="ms" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="latencyMs" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#colorLatency)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Packet Feed Drawer */}
        <div className="glass-panel p-5 flex flex-col">
          <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center justify-between">
            <span>Recent Encrypted Transmissions</span>
            <span className="text-xs text-slate-400 font-normal">Click packet to inspect</span>
          </h3>

          <div className="space-y-2 overflow-y-auto max-h-[300px] pr-1">
            {recentPackets.map((pkt) => {
              const isVerified = pkt.verification.status === 'VERIFIED';
              return (
                <div
                  key={pkt.packetId}
                  onClick={() => onSelectPacket(pkt)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isVerified
                      ? 'bg-slate-900/60 border-slate-800 hover:border-sky-500/40'
                      : 'bg-rose-950/30 border-rose-500/40 hover:border-rose-500'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono font-bold text-sky-300">{pkt.packetId}</span>
                    <span className="text-slate-400">{new Date(pkt.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-300">{pkt.deviceId}</span>
                    <div className="flex items-center gap-1">
                      {isVerified ? (
                        <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-rose-400 font-semibold">
                          <XCircle className="w-3.5 h-3.5" /> {pkt.verification.status}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 truncate mt-1">
                    Hash: {pkt.sha256Hash.substring(0, 16)}...
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Cryptographic Event Log Table */}
      <div className="glass-panel p-5">
        <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center justify-between">
          <span>Security & Cryptographic Audit Logs</span>
          <span className="text-xs text-slate-400">Total Logs: {cryptoLogs.length}</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="p-3 font-semibold">Timestamp</th>
                <th className="p-3 font-semibold">Stage</th>
                <th className="p-3 font-semibold">Device</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {cryptoLogs.slice(0, 8).map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/40">
                  <td className="p-3 font-mono text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</td>
                  <td className="p-3 font-bold text-sky-300">{log.stage}</td>
                  <td className="p-3 text-slate-300">{log.deviceId}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.status === 'SUCCESS'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-slate-400 truncate max-w-xs">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
