export interface KeyPairPEM {
  publicKeyPem: string;
  privateKeyPem: string;
  keyBits: number;
  fingerprint: string;
}

export interface AuthHandshakeChallenge {
  challengeId: string;
  deviceId: string;
  serverNonce: string;
  timestamp: number;
  expiresAt: number;
}

export interface AuthHandshakeResponse {
  challengeId: string;
  deviceId: string;
  signature: string;
  sessionToken?: string;
  success: boolean;
  errorMessage?: string;
}

export type AttackMode = 'NONE' | 'MITM_DATA_TAMPER' | 'RSA_SIG_SPOOF' | 'REPLAY_NONCE' | 'KEY_CORRUPT';

export interface CryptoLogEntry {
  id: string;
  timestamp: number;
  stage: 'RSA_AUTH' | 'SHA256_HASH' | 'RSA_SIGN' | 'AES_ENCRYPT' | 'SERVER_DECRYPT' | 'SERVER_VERIFY';
  deviceId: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  details: string;
  rawPayloadSample?: string;
  ciphertextSample?: string;
  hashSample?: string;
  signatureSample?: string;
}
