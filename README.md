PixelCrypt v1.0

PixelCrypt is a secure, academic-grade steganography gateway. It provides a hybrid security layer by combining military-grade AES-256 and RSA-2048 encryption with advanced steganography algorithms to conceal sensitive data within Image (.png), Audio (.wav), and Video (.mp4) formats.

🚀 Core Features

Hybrid Encryption: Secrets are encrypted with AES-256; the AES session key is encrypted with RSA-2048 (Public/Private Key Infrastructure).

Multi-Media Support: * Images: LSB (Least Significant Bit) manipulation.

Audio: Amplitude modulation steganography in WAV frames.

Video: Frame extraction and lossless audio embedding (FFmpeg).

Identity Management: Firebase Authentication (Google, GitHub, Email) with role-based access control.

Audit Logging: Real-time, cloud-based operation logs via Cloud Firestore.

Security Registry: Automated file banning system (SQLite) that locks files after 3 failed decryption attempts.

🛠️ Tech Stack

Frontend: React.js, Tailwind CSS, Lucide Icons, Firebase SDK.

Backend: Python (Flask), PyCryptodome, Pillow, NumPy.

System Tools: FFmpeg (Required for video processing).

Database: Cloud Firestore (Logs) & SQLite (Security Registry).

📦 Installation Guide

Prerequisites

Node.js (v16+)

Python (v3.9+)

FFmpeg (Must be added to system PATH)

Firebase Project with Auth & Firestore enabled.

1. Backend Setup

cd backend

# 1. Create Virtual Environment
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# 2. Install Dependencies
pip install -r requirements.txt

# 3. Setup Credentials
# Place your 'serviceAccountKey.json' file inside the /backend folder.


2. Frontend Setup

# Return to root
cd ..

# Install packages
npm install


🏃‍♂️ Execution

Step 1: Start Backend Server

cd backend
python backend_app.py
# Server will start on [http://127.0.0.1:5000](http://127.0.0.1:5000)
# Ensure output says: "Firebase Admin SDK Initialized Successfully"


Step 2: Start Frontend Interface

# In a new terminal
npm start
# App will launch at http://localhost:3000


📖 Operational Flow

Identity: Go to Key Manager -> Generate Secure Keys. Save your private_key.pem securely.

Encryption:

Select media type (e.g., Image).

Upload Source File + Public Key.

Enter secret message -> Click Encode.

Download the result.

Decryption:

Select Decode mode.

Upload Encoded File + Private Key.

System reveals the hidden message.

🛡️ Security & Limitations

Session Isolation: Authenticating via the "Ghost Protocol" (10-click bypass) automatically terminates any previous user session to prevent data leakage.

File Corruption: To prevent brute-force attacks, files are permanently banned in the local registry after 3 failed password/key attempts.

Video Formats: Supports .mp4 and .mov input; output is normalized to .mp4.

👤 Author

Varun Kumar
MCA Project

Contact: 005varunkumar@gmail.com

Focus: Cyber Security & Network Cryptography

Disclaimer: This tool is for educational purposes only.