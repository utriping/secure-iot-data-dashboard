# 🛡️ IoT Cryptographic Security & Blockchain Dashboard

An interactive, enterprise-grade IoT Dashboard demonstrating **RSA 2048-bit Device Authentication**, **AES-256 Symmetric Payload Encryption**, **SHA-256 Data Integrity**, **RSA Digital Signatures**, and an **Immutable Blockchain Event Ledger**.

![IoT Crypto Dashboard](https://img.shields.io/badge/Security-RSA--2048%20%7C%20AES--256%20%7C%20SHA--256-blue?style=for-the-badge)
![Blockchain](https://img.shields.io/badge/Ledger-Proof--of--Work%20%7C%20Merkle%20Tree-purple?style=for-the-badge)
![Vite](https://img.shields.io/badge/Framework-Vite%20%2B%20React%20%2B%20TypeScript-emerald?style=for-the-badge)

---

## 🌟 Key Features & Cryptographic Architecture

### 1. 🔑 RSA 2048-bit Device Authentication & Key Management
- Asymmetric 2048-bit RSA key pair generation per IoT device using standard Web Crypto API (`window.crypto.subtle`).
- **Interactive Challenge-Response Handshake protocol visualizer**: Server sends 256-bit nonce $\rightarrow$ Device signs nonce with RSA Private Key $\rightarrow$ Server verifies using Device RSA Public Key $\rightarrow$ Session token & dynamic AES key issued.
- **Key Rotation**: Real-time key rotation & X.509 PEM certificate inspector.

### 2. 🔐 AES-256 Payload Encryption
- Encrypts sensor payloads into base64 ciphertext using AES-256-CBC with PKCS7 padding.
- Per-transmission dynamic 16-byte Initialization Vector (IV).
- Server-side automated decryption & metric verification pipeline.

### 3. 🛡️ SHA-256 Payload Hash & Integrity Verification
- Computes 256-bit checksums for every telemetry JSON packet.
- Demonstrates the **Avalanche Effect**: mutating a single bit invalidates the SHA-256 checksum and immediately blocks the transmission.

### 4. ✍️ RSA Digital Signatures (Non-Repudiation)
- Device digitally signs `SHA256(payload)` with its RSA private key.
- Server validates authenticity against registered public key to reject rogue device spoofing.

### 5. 🔗 Immutable Blockchain Event Ledger & PoW Miner
- Append-only event log storing verified telemetry transactions & RSA auth events.
- **Proof-of-Work (PoW) Mining Engine** with dynamic difficulty settings ($00...$).
- **Merkle Tree Integration**: Calculates Merkle Root hash for transaction batch integrity.
- **Block Tamper Simulator**: Select any past block and modify payload data to observe instant cryptographic validation failure across all downstream blocks.

### 6. 🚨 Cybersecurity Attack Simulator
- Testbench scenarios for:
  - **MITM Data Tampering**: Alters sensor data mid-transit $\rightarrow$ SHA-256 Checksum Failure.
  - **Rogue RSA Signature Spoofing**: Forged private key $\rightarrow$ Public Key Verification Rejection.
  - **AES Session Key Corruption**: Wrong session key $\rightarrow$ Decryption Failure.
  - **Replay Attack**: Duplicate nonce $\rightarrow$ Replay Audit Rejection.

---

## 🛠️ Technology Stack

- **Core**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4, Custom Glassmorphic Dark UI
- **Icons & Charts**: Lucide React, Recharts
- **Crypto Engine**: W3C Web Crypto API (`window.crypto.subtle`) + CryptoJS

---

## ⚡ Quick Start & Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/utriping/secure-iot-data-dashboard.git
   cd secure-iot-data-dashboard
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run Local Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173/` in your browser.

4. **Build Production Bundle**:
   ```bash
   npm run build
   ```

---

## 📜 License

MIT License. Designed for demonstration and educational purposes in IoT Security & Applied Cryptography.
