import type { Block, BlockchainTransaction, ChainValidationResult } from '../types/blockchain';
import { computeSHA256, computeMerkleRoot } from '../crypto/cryptoEngine';

export class BlockchainEngine {
  private chain: Block[] = [];
  private pendingTransactions: BlockchainTransaction[] = [];
  private difficulty: number = 2;

  constructor() {
    this.createGenesisBlock();
  }

  private createGenesisBlock() {
    const genesisTx: BlockchainTransaction = {
      id: 'TX-GENESIS-0000',
      timestamp: Date.now() - 86400000,
      deviceId: 'SYSTEM-ROOT',
      deviceName: 'Cryptographic Genesis Authority',
      eventType: 'RSA_AUTHENTICATION',
      dataHash: computeSHA256('GENESIS_BLOCK_INITIALIZATION_IOT_CRYPTO'),
      rsaSignature: 'GENESIS_RSA_ROOT_SIGNATURE_2048',
      payloadSummary: 'Genesis Block initialized with 2048-bit RSA Root Certificate Authority',
      verificationStatus: 'VERIFIED',
    };

    const { merkleRoot } = computeMerkleRoot([genesisTx]);
    const genesisBlock: Block = {
      index: 0,
      timestamp: Date.now() - 86400000,
      transactions: [genesisTx],
      previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
      merkleRoot,
      nonce: 42,
      hash: '',
      difficulty: this.difficulty,
      minerId: 'GENESIS_MINER',
      miningDurationMs: 1,
    };

    genesisBlock.hash = this.calculateBlockHash(genesisBlock);
    this.chain.push(genesisBlock);
  }

  public calculateBlockHash(block: Omit<Block, 'hash'>): string {
    const txSummary = block.transactions.map((tx) => tx.id + tx.dataHash).join('');
    const raw = `${block.index}${block.timestamp}${block.previousHash}${block.merkleRoot}${block.nonce}${txSummary}`;
    return computeSHA256(raw);
  }

  public getDifficulty(): number {
    return this.difficulty;
  }

  public setDifficulty(diff: number) {
    this.difficulty = Math.max(1, Math.min(5, diff));
  }

  public getChain(): Block[] {
    return this.chain;
  }

  public getPendingTransactions(): BlockchainTransaction[] {
    return this.pendingTransactions;
  }

  public addTransaction(tx: BlockchainTransaction) {
    this.pendingTransactions.push(tx);
  }

  /**
   * Mines pending transactions into a new Block using Proof of Work (PoW)
   */
  public minePendingTransactions(minerName: string = 'NODE-VALIDATOR-01'): Block {
    const txsToMine = [...this.pendingTransactions];
    if (txsToMine.length === 0) {
      txsToMine.push({
        id: `TX-SYS-${Date.now()}`,
        timestamp: Date.now(),
        deviceId: 'SYS-HEARTBEAT',
        deviceName: 'Ledger Node Health Monitor',
        eventType: 'KEY_ROTATION',
        dataHash: computeSHA256(`HEARTBEAT_${Date.now()}`),
        rsaSignature: 'SYS_SIG_HEARTBEAT',
        payloadSummary: 'Automated cryptographic integrity check',
        verificationStatus: 'VERIFIED',
      });
    }

    const previousBlock = this.chain[this.chain.length - 1];
    const newIndex = previousBlock.index + 1;
    const timestamp = Date.now();
    const { merkleRoot } = computeMerkleRoot(txsToMine);
    const targetPrefix = '0'.repeat(this.difficulty);

    const startTime = performance.now();
    let nonce = 0;
    let hash = '';

    const tempBlock: Omit<Block, 'hash'> = {
      index: newIndex,
      timestamp,
      transactions: txsToMine,
      previousHash: previousBlock.hash,
      merkleRoot,
      nonce: 0,
      difficulty: this.difficulty,
      minerId: minerName,
      miningDurationMs: 0,
    };

    while (true) {
      tempBlock.nonce = nonce;
      hash = this.calculateBlockHash(tempBlock);
      if (hash.startsWith(targetPrefix)) {
        break;
      }
      nonce++;
      if (nonce > 500000) {
        break;
      }
    }

    const endTime = performance.now();
    const miningDurationMs = +(endTime - startTime).toFixed(2);

    const newBlock: Block = {
      ...tempBlock,
      nonce,
      hash,
      miningDurationMs,
    };

    this.chain.push(newBlock);
    this.pendingTransactions = [];
    return newBlock;
  }

  /**
   * Validates integrity of entire blockchain
   */
  public validateChain(): ChainValidationResult {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // 1. Verify block hash matches payload
      const recalculatedHash = this.calculateBlockHash(currentBlock);
      if (currentBlock.hash !== recalculatedHash) {
        return {
          isValid: false,
          corruptedBlockIndex: i,
          reason: `Block #${i} Hash Mismatch! Recorded=${currentBlock.hash.substring(0, 10)}..., Computed=${recalculatedHash.substring(0, 10)}...`,
        };
      }

      // 2. Verify previousHash matches preceding block hash
      if (currentBlock.previousHash !== previousBlock.hash) {
        return {
          isValid: false,
          corruptedBlockIndex: i,
          reason: `Block #${i} Previous Hash Mismatch! Previous block hash was altered.`,
        };
      }

      // 3. Verify Merkle Root
      const { merkleRoot } = computeMerkleRoot(currentBlock.transactions);
      if (currentBlock.merkleRoot !== merkleRoot) {
        return {
          isValid: false,
          corruptedBlockIndex: i,
          reason: `Block #${i} Merkle Root Corrupted! Transactions inside block were modified.`,
        };
      }
    }

    return { isValid: true };
  }

  /**
   * Simulates an attacker modifying a transaction in a mined block
   */
  public tamperBlock(blockIndex: number, newSummary: string = 'ATTACKER_INJECTED_UNAUTHORIZED_COMMAND'): boolean {
    if (blockIndex <= 0 || blockIndex >= this.chain.length) return false;

    const block = this.chain[blockIndex];
    if (block.transactions.length > 0) {
      block.transactions[0].payloadSummary = newSummary;
      block.transactions[0].dataHash = computeSHA256(newSummary);
      block.isTampered = true;
      return true;
    }
    return false;
  }
}

export const blockchainService = new BlockchainEngine();
