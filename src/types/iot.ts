export type DeviceType = 'grid' | 'medical' | 'drone' | 'industrial' | 'surveillance';
export type DeviceStatus = 'online' | 'authenticating' | 'offline' | 'compromised';

export interface IoTDevice {
  id: string;
  name: string;
  type: DeviceType;
  status: DeviceStatus;
  location: string;
  firmwareVersion: string;
  rsaPublicKeyPem: string;
  rsaPrivateKeyPem: string; // Stored locally on device side for demo
  aesKeyHex: string;
  lastAuthTimestamp: number;
  stats: {
    packetsSent: number;
    packetsVerified: number;
    tamperAttempts: number;
    avgLatencyMs: number;
  };
}

export interface TelemetryPayload {
  deviceId: string;
  deviceName: string;
  deviceType: DeviceType;
  timestamp: number;
  sequenceId: number;
  metrics: Record<string, number | string | boolean>;
}

export interface EncryptedPacket {
  packetId: string;
  deviceId: string;
  timestamp: number;
  sequenceId: number;
  
  // SHA-256 Checksum of the raw metrics JSON
  sha256Hash: string;
  
  // RSA Digital Signature of sha256Hash signed by Device RSA Private Key
  rsaSignature: string;
  
  // AES-256-GCM Ciphertext of the payload JSON
  aesCiphertext: string;
  
  // Initialization Vector for AES-256
  aesIv: string;
  
  // Verification flags computed by Server receiver
  verification: {
    authenticated: boolean;
    hashValid: boolean;
    signatureValid: boolean;
    decryptionValid: boolean;
    status: 'VERIFIED' | 'SHA256_TAMPERED' | 'INVALID_SIGNATURE' | 'DECRYPTION_FAILED' | 'REPLAY_ATTACK';
    receivedAt: number;
    processingMs: number;
  };
}
