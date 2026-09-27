import React from 'react';
import { ShieldCheck, Cpu, Database, Activity, Key, AlertTriangle, Play, Pause, RefreshCw, Zap } from 'lucide-react';
import type { AttackMode } from '../types/crypto';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  attackMode: AttackMode;
  setAttackMode: (mode: AttackMode) => void;
  isStreaming: boolean;
  setIsStreaming: (streaming: boolean) => void;
  activeDeviceCount: number;
  blockCount: number;
  packetsPerSec: number;
  tamperCount: number;
  onMineBlock: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  attackMode,
  setAttackMode,
  isStreaming,
  setIsStreaming,
  activeDeviceCount,
  blockCount,
  packetsPerSec,
  tamperCount,
  onMineBlock,
}) => {
  const tabs = [
    { id: 'overview', label: 'Dashboard Overview', icon: Activity },
    { id: 'devices', label: 'IoT Devices & RSA', icon: Cpu },
    { id: 'crypto', label: 'Crypto Inspector', icon: Key },
    { id: 'blockchain', label: 'Blockchain Ledger', icon: Database },
    { id: 'sandbox', label: 'Attack Simulator', icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-sky-500/20 px-4 py-3 mb-6 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* Brand Title */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-sky-500 to-emerald-500 shadow-lg shadow-sky-500/20">
            <ShieldCheck className="w-6 h-6 text-slate-950 font-bold" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-sky-400 via-emerald-300 to-indigo-300 bg-clip-text text-transparent">
              IoT Cryptographic Dashboard
            </h1>
            <p className="text-xs text-slate-400 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              RSA-2048 Auth • AES-256 Payload • SHA-256 Integrity • Blockchain Log
            </p>
          </div>
        </div>

        {/* Live Network Metrics Pill */}
        <div className="hidden md:flex items-center gap-4 bg-slate-900/80 border border-slate-800 px-4 py-1.5 rounded-xl text-xs">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-slate-400">Devices:</span>
            <span className="font-semibold text-sky-300">{activeDeviceCount} Active</span>
          </div>
          <div className="h-3 w-[1px] bg-slate-800" />
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">Throughput:</span>
            <span className="font-semibold text-emerald-300">{packetsPerSec} pkt/s</span>
          </div>
          <div className="h-3 w-[1px] bg-slate-800" />
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-slate-400">Ledger Height:</span>
            <span className="font-semibold text-purple-300">#{blockCount}</span>
          </div>
          {tamperCount > 0 && (
            <>
              <div className="h-3 w-[1px] bg-slate-800" />
              <div className="flex items-center gap-1.5 text-rose-400">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span className="font-bold">{tamperCount} Rejected</span>
              </div>
            </>
          )}
        </div>

        {/* Controls & Attack Selector */}
        <div className="flex items-center gap-3">
          {/* Stream Toggle */}
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isStreaming
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
            }`}
          >
            {isStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isStreaming ? 'Streaming Live' : 'Stream Paused'}
          </button>

          {/* Mine Block Button */}
          <button
            onClick={onMineBlock}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600/30 border border-purple-500/40 text-purple-200 hover:bg-purple-600/50 transition-all shadow-sm shadow-purple-500/20"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Mine PoW Block
          </button>

          {/* Attack Mode Selector */}
          <div className="relative">
            <select
              value={attackMode}
              onChange={(e) => setAttackMode(e.target.value as AttackMode)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-semibold outline-none cursor-pointer transition-all ${
                attackMode !== 'NONE'
                  ? 'bg-rose-950/80 border-rose-500 text-rose-200 attack-alert'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
              }`}
            >
              <option value="NONE">🛡️ Normal Operation (Secure)</option>
              <option value="MITM_DATA_TAMPER">🚨 Attack: MITM Payload Tampering</option>
              <option value="RSA_SIG_SPOOF">🔑 Attack: RSA Signature Spoofing</option>
              <option value="KEY_CORRUPT">🔐 Attack: Corrupt AES Session Key</option>
              <option value="REPLAY_NONCE">🔄 Attack: Replay Attack (Duplicate Nonce)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <nav className="max-w-7xl mx-auto flex items-center justify-start gap-2 mt-4 pt-3 border-t border-slate-800/80 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-sky-500/20 to-emerald-500/20 text-sky-300 border border-sky-500/40 shadow-md shadow-sky-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
