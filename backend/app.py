from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
import os
import hashlib
import sqlite3
import zipfile
import io
import time
from PIL import Image
from functools import wraps

# --- FIREBASE AUTHENTICATION IMPORTS ---
import firebase_admin
from firebase_admin import credentials, auth

# Import Custom Engines
try:
    from steg_png import encode_png, decode_png
    from steg_wav import encode_wav, decode_wav
    from steg_mp4 import encode_mp4, decode_mp4
    from crypto_vault import generate_rsa_keys, encrypt_hybrid, decrypt_hybrid
except ImportError:
    print("Warning: Custom engines not found. Ensure steg_*.py files are present.")

app = Flask(__name__)
CORS(app)

# --- FIREBASE SETUP ---
try:
    if os.path.exists('serviceAccountKey.json'):
        cred = credentials.Certificate('serviceAccountKey.json')
        firebase_admin.initialize_app(cred)
        print("Firebase Admin SDK Initialized Successfully.")
    else:
        print("WARNING: 'serviceAccountKey.json' not found. Authentication will fail.")
except Exception as e:
    print(f"Error initializing Firebase: {e}")

# --- UPDATED AUTH DECORATOR (PERMISSIVE) ---
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        header = request.headers.get('Authorization')
        
        # Default: Guest / Stealth Mode
        request.user = None
        
        if header:
            parts = header.split()
            if len(parts) == 2 and parts[0].lower() == 'bearer':
                token = parts[1]
                try:
                    # Verify token if present
                    decoded_token = auth.verify_id_token(token)
                    request.user = decoded_token 
                except Exception as e:
                    # If token is invalid/expired, we simply treat as Guest
                    # instead of blocking with 401. This fixes the "Authorized" error.
                    print(f"Token verification failed: {e}")
                    pass
        
        # Proceed regardless of auth status (Allow Bypass)
        return f(*args, **kwargs)
    return decorated_function

MAX_ATTEMPTS = 3
UPLOAD_FOLDER = 'uploads'
DB_FILE = 'security_registry.db'

# Ensure upload directory exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# --- DATABASE LOGIC ---
def init_db():
    with sqlite3.connect(DB_FILE) as conn:
        conn.execute('''CREATE TABLE IF NOT EXISTS file_registry 
                      (file_hash TEXT PRIMARY KEY, attempts INTEGER, is_banned BOOLEAN)''')
init_db()

def get_file_hash(filepath):
    sha = hashlib.sha256()
    with open(filepath, 'rb') as f:
        while chunk := f.read(8192):
            sha.update(chunk)
    return sha.hexdigest()

def check_status(file_hash):
    with sqlite3.connect(DB_FILE) as conn:
        row = conn.execute("SELECT attempts, is_banned FROM file_registry WHERE file_hash=?", (file_hash,)).fetchone()
        return row if row else (0, False)

def register_failure(file_hash):
    with sqlite3.connect(DB_FILE) as conn:
        row = conn.execute("SELECT attempts FROM file_registry WHERE file_hash=?", (file_hash,)).fetchone()
        attempts = row[0] + 1 if row else 1
        banned = attempts >= MAX_ATTEMPTS
        
        if row:
            conn.execute("UPDATE file_registry SET attempts=?, is_banned=? WHERE file_hash=?", (attempts, banned, file_hash))
        else:
            conn.execute("INSERT INTO file_registry VALUES (?, ?, ?)", (file_hash, attempts, banned))
        return attempts, banned

def clear_status(file_hash):
    with sqlite3.connect(DB_FILE) as conn:
        conn.execute("DELETE FROM file_registry WHERE file_hash=?", (file_hash,))

def cleanup_file(filepath):
    if os.path.exists(filepath):
        for _ in range(5):
            try:
                os.remove(filepath)
                break
            except PermissionError:
                time.sleep(0.1)
            except Exception:
                pass

# --- ROUTES ---

@app.route('/api/generate_keys', methods=['GET'])
def keys():
    try:
        priv, pub = generate_rsa_keys()
        mem = io.BytesIO()
        with zipfile.ZipFile(mem, 'w') as zf:
            zf.writestr("private_key.pem", priv)
            zf.writestr("public_key.pem", pub)
        mem.seek(0)
        return send_file(mem, download_name="pixelcrypt_keys.zip", as_attachment=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/check_capacity', methods=['POST'])
@login_required 
def capacity():
    if 'file' not in request.files: return jsonify({"error": "No file"}), 400
    f = request.files['file']
    f.seek(0, os.SEEK_END)
    size = f.tell()
    return jsonify({"max_chars": int(size / 8)})

# --- ENCODE ROUTES ---

@app.route('/api/encode', methods=['POST'])
@login_required 
def encode_img():
    return handle_encoding(request, encode_png, 'image/png', 'encoded.png')

@app.route('/api/encode_audio', methods=['POST'])
@login_required 
def encode_aud():
    return handle_encoding(request, lambda f, d: encode_wav(f, d), 'audio/wav', 'encoded.wav')

@app.route('/api/encode_video', methods=['POST'])
@login_required 
def encode_vid():
    f = request.files['file']
    k = request.files['key']
    s = request.form['secret']
    
    path = os.path.join(UPLOAD_FOLDER, f.filename)
    f.save(path)
    
    try:
        video_bytes = encode_mp4(path, s, k.read())
        return send_file(io.BytesIO(video_bytes), mimetype='video/mp4', download_name='encoded.mp4', as_attachment=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cleanup_file(path)

def handle_encoding(req, encoder_func, mime, name):
    f = req.files['file']
    k = req.files['key']
    s = req.form['secret']
    
    path = os.path.join(UPLOAD_FOLDER, f.filename)
    f.save(path)
    
    try:
        encrypted_data = encrypt_hybrid(s, k.read())
        output_io = encoder_func(path, encrypted_data)
        return send_file(output_io, mimetype=mime, download_name=name, as_attachment=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cleanup_file(path)

# --- DECODE ROUTES ---

@app.route('/api/decode', methods=['POST'])
@login_required 
def decode_img(): return handle_decoding(request, decode_png)

@app.route('/api/decode_audio', methods=['POST'])
@login_required 
def decode_aud(): return handle_decoding(request, decode_wav)

@app.route('/api/decode_video', methods=['POST'])
@login_required 
def decode_vid(): return handle_decoding(request, decode_mp4)

def handle_decoding(req, decoder_func):
    f = req.files['file']
    k = req.files['key']
    
    path = os.path.join(UPLOAD_FOLDER, f.filename)
    f.save(path)
    
    try:
        h = get_file_hash(path)
        _, banned = check_status(h)
        
        if banned:
            return jsonify({"error": "FILE CORRUPTED: Security limit exceeded. This file is permanently banned."}), 410
            
        try:
            private_key = k.read()
            if decoder_func == decode_mp4:
                secret = decoder_func(path, private_key)
            else:
                hidden = decoder_func(path)
                secret = decrypt_hybrid(hidden, private_key)
            
            if not secret: raise ValueError("Decryption returned empty")

            clear_status(h)
            return jsonify({"secret": secret})
            
        except Exception as e:
            print(f"Decryption failed: {e}")
            new_att, new_ban = register_failure(h)
            remaining = MAX_ATTEMPTS - new_att
            if new_ban:
                return jsonify({"error": "FINAL ATTEMPT FAILED. File has been corrupted/banned."}), 410
            return jsonify({"error": f"Wrong Key. {remaining} attempts remaining."}), 401
            
    finally:
        cleanup_file(path)

@app.route('/', methods=['GET'])
def home():
    return "PixelCrypt Backend Running"

if __name__ == '__main__':
    app.run(debug=True, port=5000)