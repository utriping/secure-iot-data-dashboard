import type { IoTDevice, TelemetryPayload, EncryptedPacket, DeviceType } from '../types/iot';
import type { AttackMode, CryptoLogEntry } from '../types/crypto';
import {
  generateRSAKeyPair,
  generateAESKey,
  generateIV,
  computeSHA256,
  signDataRSA,
  verifySignatureRSA,
  encryptAES,
  decryptAES,
} from '../crypto/cryptoEngine';

export class IoTSimulatorService {
  private devices: IoTDevice[] = [];
  private sequenceCounter: Record<string, number> = {};
  private cryptoLogs: CryptoLogEntry[] = [];
  private attackMode: AttackMode = 'NONE';
  private onPacketTransmittedCallbacks: Array<(packet: EncryptedPacket, log: CryptoLogEntry) => void> = [];

  constructor() {
    this.initializeDefaultDevices();
  }

  private async initializeDefaultDevices() {
    const defaultConfigs: Array<{ id: string; name: string; type: DeviceType; location: string }> = [
      { id: 'GRID-NODE-01', name: 'Smart Substation Meter 402', type: 'grid', location: 'Grid Zone Alpha (37.7749, -122.4194)' },
      { id: 'MED-MON-09', name: 'ICU Cardiac Telemetry MM-9', type: 'medical', location: 'St. Jude Bay Ward 4B' },
      { id: 'DRONE-TAC-07', name: 'Perimeter Surveillance Drone DR-07', type: 'drone', location: 'Air Sector Delta-9 (FL120)' },
      { id: 'IND-SENS-108', name: 'Hydro-Turbine Temp/Vib IF-108', type: 'industrial', location: 'Power Plant Unit #3' },
      { id: 'CAM-SEC-330', name: 'Smart Traffic Cam Node SC-330', type: 'surveillance', location: 'Highway 101 Junction 14' },
    ];

    for (const config of defaultConfigs) {
      const rsaPair = await generateRSAKeyPair(2048);
      const aesKeyHex = generateAESKey();

      const device: IoTDevice = {
        id: config.id,
        name: config.name,
        type: config.type,
        status: 'online',
        location: config.location,
        firmwareVersion: 'v4.2.1-sec',
        rsaPublicKeyPem: rsaPair.publicKeyPem,
        rsaPrivateKeyPem: rsaPair.privateKeyPem,
        aesKeyHex: aesKeyHex,
        lastAuthTimestamp: Date.now() - Math.floor(Math.random() * 3600000),
        stats: {
          packetsSent: Math.floor(Math.random() * 100) + 20,
          packetsVerified: Math.floor(Math.random() * 95) + 18,
          tamperAttempts: 0,
          avgLatencyMs: Math.floor(Math.random() * 15) + 8,
        },
      };

      this.devices.push(device);
      this.sequenceCounter[config.id] = 100;
    }
  }

  public setAttackMode(mode: AttackMode) {
    this.attackMode = mode;
  }

  public getAttackMode(): AttackMode {
    return this.attackMode;
  }

  public getDevices(): IoTDevice[] {
    return this.devices;
  }

  public getDeviceById(id: string): IoTDevice | undefined {
    return this.devices.find((d) => d.id === id);
  }

  public addOnPacketTransmitted(callback: (packet: EncryptedPacket, log: CryptoLogEntry) => void) {
    this.onPacketTransmittedCallbacks.push(callback);
  }

  public async registerNewDevice(name: string, type: DeviceType, location: string): Promise<IoTDevice> {
    const id = `${type.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`;
    const rsaPair = await generateRSAKeyPair(2048);
    const aesKeyHex = generateAESKey();

    const device: IoTDevice = {
      id,
      name,
      type,
      status: 'online',
      location,
      firmwareVersion: 'v4.2.5-latest',
      rsaPublicKeyPem: rsaPair.publicKeyPem,
      rsaPrivateKeyPem: rsaPair.privateKeyPem,
      aesKeyHex,
      lastAuthTimestamp: Date.now(),
      stats: { packetsSent: 0, packetsVerified: 0, tamperAttempts: 0, avgLatencyMs: 12 },
    };

    this.devices.push(device);
    this.sequenceCounter[id] = 1;
    return device;
  }

  public async rotateDeviceKeys(deviceId: string): Promise<IoTDevice | null> {
    const device = this.getDeviceById(deviceId);
    if (!device) return null;

    const newRsaPair = await generateRSAKeyPair(2048);
    const newAesKey = generateAESKey();

    device.rsaPublicKeyPem = newRsaPair.publicKeyPem;
    device.rsaPrivateKeyPem = newRsaPair.privateKeyPem;
    device.aesKeyHex = newAesKey;
    device.lastAuthTimestamp = Date.now();

    return device;
  }

  /**
   * Generates dynamic sensor payload metrics for a device
   */
  public generateMetrics(type: DeviceType): Record<string, number | string | boolean> {
    const now = Date.now();
    switch (type) {
      case 'grid':
        return {
          voltageRMS: +(230 + Math.sin(now / 1000) * 5 + Math.random() * 2).toFixed(2),
          currentAmps: +(14.2 + Math.random() * 1.5).toFixed(2),
          frequencyHz: +(50 + (Math.random() - 0.5) * 0.08).toFixed(3),
          activePowerKw: +(3.26 + Math.random() * 0.4).toFixed(2),
          gridStatus: 'OPTIMAL',
        };
      case 'medical':
        return {
          heartRateBpm: Math.floor(72 + Math.sin(now / 800) * 8 + Math.random() * 4),
          spO2Percent: +(98.5 + (Math.random() - 0.5) * 0.8).toFixed(1),
          systolicBp: Math.floor(120 + Math.random() * 6),
          diastolicBp: Math.floor(80 + Math.random() * 4),
          patientState: 'NORMAL_SINUS',
        };
      case 'drone':
        return {
          altitudeMeters: +(150 + Math.sin(now / 2000) * 20).toFixed(1),
          groundSpeedKmh: +(48.5 + Math.random() * 3).toFixed(1),
          batteryPercent: Math.max(10, Math.floor(88 - (now % 360000) / 10000)),
          gpsFix: '3D_RTK_FIXED',
          latitude: +(37.7749 + (Math.random() - 0.5) * 0.005).toFixed(5),
          longitude: +(-122.4194 + (Math.random() - 0.5) * 0.005).toFixed(5),
        };
      case 'industrial':
        return {
          bearingTempCelsius: +(68.4 + Math.sin(now / 1500) * 4 + Math.random() * 1).toFixed(1),
          vibrationMmSec: +(1.42 + Math.random() * 0.3).toFixed(2),
          coolantPressureBar: +(6.2 + Math.random() * 0.2).toFixed(2),
          turbineRpm: Math.floor(3600 + Math.random() * 20),
          thermalStatus: 'NORMAL',
        };
      case 'surveillance':
        return {
          motionDetected: Math.random() > 0.7,
          ambientLightLux: Math.floor(450 + Math.sin(now / 3000) * 100),
          faceCount: Math.random() > 0.6 ? Math.floor(Math.random() * 3) + 1 : 0,
          camResolution: '3840x2160_60fps',
          opticalZoomRatio: '4.2x',
        };
    }
  }

  /**
   * Simulated Crypto Transmission Pipeline
   */
  public simulateTelemetryTransmission(deviceId?: string): { packet: EncryptedPacket; log: CryptoLogEntry } {
    const targetDevice = deviceId ? this.getDeviceById(deviceId) : this.devices[Math.floor(Math.random() * this.devices.length)];
    if (!targetDevice) {
      throw new Error('Device not found for transmission');
    }

    const startProcessing = performance.now();
    this.sequenceCounter[targetDevice.id] = (this.sequenceCounter[targetDevice.id] || 0) + 1;
    const seqId = this.sequenceCounter[targetDevice.id];

    // 1. Raw Telemetry Payload Generation
    let metrics = this.generateMetrics(targetDevice.type);
    
    // Attack Mode 1: MITM Tampering (Attacker changes payload metrics mid-transit)
    const isMitm = this.attackMode === 'MITM_DATA_TAMPER';
    const rawPayloadObj: TelemetryPayload = {
      deviceId: targetDevice.id,
      deviceName: targetDevice.name,
      deviceType: targetDevice.type,
      timestamp: Date.now(),
      sequenceId: seqId,
      metrics,
    };

    const rawPayloadJson = JSON.stringify(rawPayloadObj);

    // 2. Compute Genuine SHA-256 Hash of original sensor payload
    const genuineSha256 = computeSHA256(rawPayloadJson);

    // 3. Generate RSA Digital Signature using Device Private Key
    const isSigSpoof = this.attackMode === 'RSA_SIG_SPOOF';
    let rsaSignature = '';
    
    if (isSigSpoof) {
      const fakeKey = `-----BEGIN PRIVATE KEY-----\nROGUE_ATTACKER_KEY_${Math.random()}\n-----END PRIVATE KEY-----`;
      rsaSignature = signDataRSA(fakeKey, genuineSha256);
    } else {
      rsaSignature = signDataRSA(targetDevice.rsaPrivateKeyPem, genuineSha256);
    }

    // 4. AES-256-GCM / CBC Payload Encryption
    const ivHex = generateIV();
    const isKeyCorrupt = this.attackMode === 'KEY_CORRUPT';
    const aesKeyToUse = isKeyCorrupt ? generateAESKey() : targetDevice.aesKeyHex;
    
    let ciphertext = encryptAES(rawPayloadJson, aesKeyToUse, ivHex);

    // If MITM attack is active, tamper with the raw payload AFTER hashing/signing
    let payloadReceivedOnServer = rawPayloadJson;
    if (isMitm) {
      const tamperedMetrics = { ...metrics, TAMPERED_BY_ATTACKER: true, voltageRMS: 999.9, heartRateBpm: 0 };
      const tamperedObj = { ...rawPayloadObj, metrics: tamperedMetrics };
      payloadReceivedOnServer = JSON.stringify(tamperedObj);
      ciphertext = encryptAES(payloadReceivedOnServer, aesKeyToUse, ivHex);
      targetDevice.stats.tamperAttempts++;
    }

    // 5. SERVER RECEIVER VERIFICATION PIPELINE
    const decryptResult = decryptAES(ciphertext, targetDevice.aesKeyHex, ivHex);
    let serverDecryptedPayload = decryptResult.plainText;
    let decryptionValid = decryptResult.success;

    // Verify SHA-256 Hash on Server
    const serverComputedHash = decryptionValid ? computeSHA256(serverDecryptedPayload) : '';
    const hashValid = decryptionValid && serverComputedHash === genuineSha256;

    // Verify RSA Signature on Server using stored Device RSA Public Key
    const signatureValid = verifySignatureRSA(
      targetDevice.rsaPublicKeyPem,
      targetDevice.rsaPrivateKeyPem,
      rsaSignature,
      genuineSha256
    );

    let status: EncryptedPacket['verification']['status'] = 'VERIFIED';
    if (!decryptionValid) {
      status = 'DECRYPTION_FAILED';
    } else if (!hashValid || isMitm) {
      status = 'SHA256_TAMPERED';
    } else if (!signatureValid || isSigSpoof) {
      status = 'INVALID_SIGNATURE';
    } else if (this.attackMode === 'REPLAY_NONCE') {
      status = 'REPLAY_ATTACK';
    }

    const endProcessing = performance.now();
    const processingMs = +(endProcessing - startProcessing).toFixed(2);

    targetDevice.stats.packetsSent++;
    if (status === 'VERIFIED') {
      targetDevice.stats.packetsVerified++;
    }

    const packetId = `PKT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    const packet: EncryptedPacket = {
      packetId,
      deviceId: targetDevice.id,
      timestamp: rawPayloadObj.timestamp,
      sequenceId: seqId,
      sha256Hash: genuineSha256,
      rsaSignature,
      aesCiphertext: ciphertext,
      aesIv: ivHex,
      verification: {
        authenticated: targetDevice.status === 'online',
        hashValid,
        signatureValid: signatureValid && !isSigSpoof,
        decryptionValid,
        status,
        receivedAt: Date.now(),
        processingMs,
      },
    };

    const cryptoLog: CryptoLogEntry = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: Date.now(),
      stage: status === 'VERIFIED' ? 'SERVER_VERIFY' : 'AES_ENCRYPT',
      deviceId: targetDevice.id,
      status: status === 'VERIFIED' ? 'SUCCESS' : 'FAILED',
      details: `Packet ${packetId} processed: Status=${status}, SHA256 Match=${hashValid}, RSA Sig=${signatureValid && !isSigSpoof}, Latency=${processingMs}ms`,
      rawPayloadSample: rawPayloadJson,
      ciphertextSample: ciphertext,
      hashSample: genuineSha256,
      signatureSample: rsaSignature,
    };

    this.cryptoLogs.unshift(cryptoLog);
    if (this.cryptoLogs.length > 100) this.cryptoLogs.pop();

    this.onPacketTransmittedCallbacks.forEach((cb) => cb(packet, cryptoLog));

    return { packet, log: cryptoLog };
  }

  public getCryptoLogs(): CryptoLogEntry[] {
    return this.cryptoLogs;
  }
}

export const iotSimulator = new IoTSimulatorService();
