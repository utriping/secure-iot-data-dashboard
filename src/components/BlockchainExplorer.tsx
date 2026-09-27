import React, { useState } from 'react';
import { Database, Link, Pickaxe, ShieldAlert, CheckCircle, ArrowRight } from 'lucide-react';
import type { Block, ChainValidationResult, BlockchainTransaction } from '../types/blockchain';

interface BlockchainExplorerProps {
  chain: Block[];
  pendingTransactions: BlockchainTransaction[];
  validation: ChainValidationResult;
  difficulty: number;
  setDifficulty: (diff: number) => void;
  onMineBlock: () => void;
  onTamperBlock: (blockIndex: number) => void;
}

export const BlockchainExplorer: React.FC<BlockchainExplorerProps> = ({
  chain,
  pendingTransactions,
  validation,
  difficulty,
  setDifficulty,
  onMineBlock,
  onTamperBlock,
}) => {
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number>(chain.length - 1);
  const [isMining, setIsMining] = useState<boolean>(false);

  const selectedBlock = chain[selectedBlockIndex] || chain[0];

  const handleMine = () => {
    setIsMining(true);
    setTimeout(() => {
      onMineBlock();
      setIsMining(false);
      setSelectedBlockIndex(chain.length);
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4">
      {/* Header & Mining Controls */}
      <div className="glass-panel p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Database className="w-5 h-5 text-purple-400" />
            Immutable Blockchain Ledger & Proof-of-Work Explorer
          </h2>
          <p className="text-xs text-slate-400">
            Cryptographic append-only event log storing verified IoT telemetry transactions, Merkle roots, and RSA authentication records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* PoW Difficulty Selector */}
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400">PoW Difficulty:</span>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(+e.target.value)}
              className="bg-slate-950 text-purple-300 font-bold outline-none cursor-pointer"
            >
              <option value={1}>1 Zero (0...)</option>
              <option value={2}>2 Zeros (00...)</option>
              <option value={3}>3 Zeros (000...)</option>
              <option value={4}>4 Zeros (0000...)</option>
            </select>
          </div>

          {/* Mine Block Button */}
          <button
            onClick={handleMine}
            disabled={isMining}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg ${
              isMining
                ? 'bg-purple-900/50 text-purple-300 cursor-not-allowed animate-pulse'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90 shadow-purple-500/20'
            }`}
          >
            <Pickaxe className={`w-4 h-4 ${isMining ? 'animate-spin' : ''}`} />
            {isMining ? 'Computing PoW Nonce...' : `Mine Block (${pendingTransactions.length} Pending)`}
          </button>
        </div>
      </div>

      {/* Chain Status Banner */}
      <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
        validation.isValid
          ? 'glass-panel border-emerald-500/30 bg-emerald-950/20 text-emerald-300'
          : 'glass-panel border-rose-500/50 bg-rose-950/40 text-rose-300 attack-alert'
      }`}>
        <div className="flex items-center gap-3">
          {validation.isValid ? (
            <CheckCircle className="w-6 h-6 text-emerald-400" />
          ) : (
            <ShieldAlert className="w-6 h-6 text-rose-400" />
          )}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide">
              {validation.isValid ? 'Blockchain Integrity Validated' : `Chain Corrupted at Block #${validation.corruptedBlockIndex}`}
            </h3>
            <p className="text-xs opacity-80">
              {validation.isValid
                ? 'All block hashes, previous hash linkages, and Merkle tree roots are cryptographically intact.'
                : validation.reason}
            </p>
          </div>
        </div>

        {!validation.isValid && (
          <span className="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-mono font-bold">
            TAMPER DETECTED
          </span>
        )}
      </div>

      {/* Chain Timeline Scrollable Cards */}
      <div className="glass-panel p-5">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Link className="w-4 h-4 text-purple-400" /> Blockchain Sequence (Height: {chain.length} Blocks)
        </h3>

        <div className="flex items-center gap-4 overflow-x-auto pb-4 pr-4">
          {chain.map((block) => {
            const isSelected = selectedBlockIndex === block.index;
            const isCorrupted = validation.corruptedBlockIndex !== undefined && block.index >= validation.corruptedBlockIndex;

            return (
              <div key={block.index} className="flex items-center gap-4 shrink-0">
                <div
                  onClick={() => setSelectedBlockIndex(block.index)}
                  className={`w-64 p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-purple-950/60 border-purple-500 shadow-lg shadow-purple-500/20 scale-105'
                      : isCorrupted
                      ? 'bg-rose-950/40 border-rose-500/60 hover:border-rose-400'
                      : 'bg-slate-900/80 border-slate-800 hover:border-purple-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-purple-500/20 text-purple-300">
                      Block #{block.index}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(block.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Block Hash:</span>
                      <div className="font-mono text-[10px] text-purple-300 truncate">
                        {block.hash || 'Mining...'}
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[10px] block">Prev Hash:</span>
                      <div className="font-mono text-[10px] text-slate-400 truncate">
                        {block.previousHash.substring(0, 16)}...
                      </div>
                    </div>

                    <div className="flex justify-between text-[11px] pt-2 border-t border-slate-800 text-slate-400">
                      <span>Txs: <strong className="text-sky-400">{block.transactions.length}</strong></span>
                      <span>Nonce: <strong className="text-amber-400">{block.nonce}</strong></span>
                    </div>
                  </div>

                  {/* Tamper Button for non-genesis blocks */}
                  {block.index > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTamperBlock(block.index);
                      }}
                      className="mt-3 w-full py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-semibold transition-all"
                    >
                      🚨 Tamper Data in Block #{block.index}
                    </button>
                  )}
                </div>

                {/* Arrow connector */}
                {block.index < chain.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-purple-500/50 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Block Inspector */}
      {selectedBlock && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Block Details Inspector */}
          <div className="glass-panel p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center justify-between">
              <span>Block #{selectedBlock.index} Details & Proof-of-Work Meta</span>
              <span className="text-xs text-purple-300 font-mono">Miner: {selectedBlock.minerId}</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-500 block">Block Hash (SHA-256):</span>
                <div className="font-mono text-xs text-purple-400 break-all select-all">
                  {selectedBlock.hash}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-500 block">Previous Block Hash:</span>
                <div className="font-mono text-xs text-slate-400 break-all">
                  {selectedBlock.previousHash}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-500 block">Merkle Tree Root Hash:</span>
                <div className="font-mono text-xs text-sky-400 break-all">
                  {selectedBlock.merkleRoot}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-2">
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px]">PoW Nonce</div>
                  <div className="font-bold text-amber-400 font-mono">{selectedBlock.nonce}</div>
                </div>
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Difficulty Target</div>
                  <div className="font-bold text-purple-400 font-mono">{selectedBlock.difficulty} Zeros</div>
                </div>
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Mining Time</div>
                  <div className="font-bold text-emerald-400 font-mono">{selectedBlock.miningDurationMs} ms</div>
                </div>
              </div>
            </div>
          </div>

          {/* Transactions in Block Visualizer */}
          <div className="glass-panel p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center justify-between">
              <span>Transactions in Block ({selectedBlock.transactions.length})</span>
              <span className="text-xs text-slate-400">Cryptographically Signed</span>
            </h3>

            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {selectedBlock.transactions.map((tx) => (
                <div key={tx.id} className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-purple-300">{tx.id}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/10 text-sky-300">
                      {tx.eventType}
                    </span>
                  </div>
                  <div className="text-slate-300 text-[11px]">{tx.payloadSummary}</div>
                  <div className="text-[10px] font-mono text-slate-500 truncate">
                    Data Hash: {tx.dataHash}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
