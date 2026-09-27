export interface BlockchainTransaction {
  id: string;
  timestamp: number;
  deviceId: string;
  deviceName: string;
  eventType: 'IOT_TELEMETRY' | 'RSA_AUTHENTICATION' | 'KEY_ROTATION' | 'SECURITY_ALERT';
  dataHash: string;
  rsaSignature: string;
  payloadSummary: string;
  verificationStatus: 'VERIFIED' | 'FAILED' | 'TAMPERED';
}

export interface MerkleNode {
  hash: string;
  left?: MerkleNode;
  right?: MerkleNode;
  data?: string;
}

export interface Block {
  index: number;
  timestamp: number;
  transactions: BlockchainTransaction[];
  previousHash: string;
  merkleRoot: string;
  nonce: number;
  hash: string;
  difficulty: number;
  minerId: string;
  miningDurationMs: number;
  isTampered?: boolean;
}

export interface ChainValidationResult {
  isValid: boolean;
  corruptedBlockIndex?: number;
  reason?: string;
}
