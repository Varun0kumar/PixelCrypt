from flask import Flask, request, send_file, jsonify
import os
import random
import wave
import zipfile
import io
from PIL import Image
from backend.steg_png import encode_png, decode_png
from backend.steg_wav import encode_wav, decode_wav
from backend.steg_mp4 import encode_mp4, decode_mp4, extract_audio_from_mp4
from backend.crypto_vault import generate_rsa_keys, encrypt_hybrid, decrypt_hybrid

app = Flask(__name__)

attempt_tracker = {}
MAX_ATTEMPTS = 3
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# --- Helpers (Capacity, Corruption, Security) ---

def get_image_capacity(filepath):
    try:
        with Image.open(filepath) as img:
            return (img.size[0] * img.size[1]) // 8
    except: return 0

def get_audio_capacity(filepath):
    try:
        with wave.open(filepath, 'rb') as audio:
            return audio.getnframes() // 8
    except: return 0

def corrupt_file(filepath):
    if not os.path.exists(filepath): return
    try:
        file_size = os.path.getsize(filepath)
        with open(filepath, 'r+b') as f:
            header_size = min(1024, file_size)
            f.seek(0)
            f.write(os.urandom(header_size))
            if file_size > 1024:
                for _ in range(5):
                    f.seek(random.randint(1024, file_size - 100))
                    f.write(os.urandom(100))
        print(f"SECURITY ACTION: Corrupted {filepath}")
    except Exception as e: print(f"Error corrupting: {e}")

def handle_failed_attempt(filename, filepath):
    if filename not in attempt_tracker: attempt_tracker[filename] = 0
    attempt_tracker[filename] += 1
    if attempt_tracker[filename] >= MAX_ATTEMPTS:
        corrupt_file(filepath)
        return jsonify({'error': 'SECURITY ALERT: 3 failed attempts. File corrupted.'}), 410
    return jsonify({'error': f'Decryption failed. {MAX_ATTEMPTS - attempt_tracker[filename]} attempts remaining.'}), 401

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'png', 'wav', 'mp4'}

# --- NEW ROUTE: Generate Keys ---
@app.route('/api/generate_keys', methods=['GET'])
def generate_keys():
    """Generates RSA keys and returns a ZIP file."""
    private_key, public_key = generate_rsa_keys()
    memory_file = io.BytesIO()
    with zipfile.ZipFile(memory_file, 'w') as zf:
        zf.writestr("private_key.pem", private_key)
        zf.writestr("public_key.pem", public_key)
    memory_file.seek(0)
    return send_file(memory_file, download_name="pixelcrypt_keys.zip", as_attachment=True)

# --- NEW ROUTE: Capacity Check ---
@app.route('/api/check_capacity', methods=['POST'])
def check_capacity():
    file = request.files.get('file')
    if not file: return jsonify({'error': 'No file'}), 400
    
    filepath = os.path.join(UPLOAD_FOLDER, "temp_cap_" + file.filename)
    file.save(filepath)
    
    capacity = 0
    ftype = "unknown"
    
    try:
        if file.filename.endswith('.png'):
            capacity = get_image_capacity(filepath)
            ftype = "image"
        elif file.filename.endswith('.wav'):
            capacity = get_audio_capacity(filepath)
            ftype = "audio"
        elif file.filename.endswith('.mp4'):
            temp_audio = filepath + ".wav"
            try:
                extract_audio_from_mp4(filepath, temp_audio)
                capacity = get_audio_capacity(temp_audio)
                ftype = "video"
            finally:
                if os.path.exists(temp_audio): os.remove(temp_audio)
        
        return jsonify({'file_type': ftype, 'max_bytes': capacity, 'message': f"Capacity: {capacity} bytes"})
    finally:
        if os.path.exists(filepath): os.remove(filepath)

# --- UPDATED ENCODE ROUTES (Public Key) ---

@app.route('/api/encode', methods=['POST'])
def encode():
    file = request.files.get('file')
    key_file = request.files.get('key') # User uploads 'public_key.pem'
    secret = request.form.get('secret')

    if not file or not key_file or not secret: return jsonify({'error': 'Missing data'}), 400
    if not allowed_file(file.filename): return jsonify({'error': 'Invalid file'}), 400

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)
    public_key = key_file.read()

    try:
        encrypted_pkg = encrypt_hybrid(secret, public_key)
        encoded_path = encode_png(filepath, encrypted_pkg)
        return send_file(encoded_path, as_attachment=True)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/encode_audio', methods=['POST'])
def encode_audio():
    file = request.files.get('file')
    key_file = request.files.get('key')
    secret = request.form.get('secret')
    if not file or not key_file: return jsonify({'error': 'Missing data'}), 400

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)
    public_key = key_file.read()

    try:
        encrypted_pkg = encrypt_hybrid(secret, public_key)
        encoded_path = encode_wav(filepath, encrypted_pkg.encode('utf-8'))
        return send_file(encoded_path, as_attachment=True)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/encode_video', methods=['POST'])
def encode_video():
    file = request.files.get('file')
    key_file = request.files.get('key')
    secret = request.form.get('secret')
    if not file or not key_file: return jsonify({'error': 'Missing data'}), 400

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)
    public_key = key_file.read()

    try:
        encoded_path = encode_mp4(filepath, secret, public_key)
        return send_file(encoded_path, as_attachment=True)
    except Exception as e:
        return jsonify({'error': 'Encoding failed'}), 500

# --- UPDATED DECODE ROUTES (Private Key) ---

@app.route('/api/decode', methods=['POST'])
def decode_secret():
    file = request.files.get('file')
    key_file = request.files.get('key') # User uploads 'private_key.pem'
    if not file or not key_file: return jsonify({'error': 'Missing data'}), 400

    if attempt_tracker.get(file.filename, 0) >= MAX_ATTEMPTS:
        return jsonify({'error': 'This file ID is banned/destroyed.'}), 410

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)
    private_key = key_file.read()

    try:
        hidden_data = decode_png(filepath)
        secret = decrypt_hybrid(hidden_data, private_key)
        attempt_tracker[file.filename] = 0
        return jsonify({'secret': secret})
    except Exception:
        return handle_failed_attempt(file.filename, filepath)

@app.route('/api/decode_audio', methods=['POST'])
def decode_audio():
    file = request.files.get('file')
    key_file = request.files.get('key')
    if not file or not key_file: return jsonify({'error': 'Missing data'}), 400

    if attempt_tracker.get(file.filename, 0) >= MAX_ATTEMPTS:
        return jsonify({'error': 'Banned.'}), 410

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)
    private_key = key_file.read()

    try:
        hidden_bytes = decode_wav(filepath)
        if not hidden_bytes: raise Exception("No data")
        secret = decrypt_hybrid(hidden_bytes.decode('utf-8'), private_key)
        attempt_tracker[file.filename] = 0
        return jsonify({'secret': secret})
    except Exception:
        return handle_failed_attempt(file.filename, filepath)

@app.route('/api/decode_video', methods=['POST'])
def decode_video():
    file = request.files.get('file')
    key_file = request.files.get('key')
    if not file or not key_file: return jsonify({'error': 'Missing data'}), 400

    if attempt_tracker.get(file.filename, 0) >= MAX_ATTEMPTS:
        return jsonify({'error': 'Banned.'}), 410

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)
    private_key = key_file.read()

    try:
        secret = decode_mp4(filepath, private_key)
        if secret:
            attempt_tracker[file.filename] = 0
            return jsonify({'secret': secret})
        else: raise Exception("Decode failed")
    except Exception:
        return handle_failed_attempt(file.filename, filepath)

@app.route('/api/status', methods=['GET'])
def status(): return jsonify({'uptime': 'running'})

@app.route('/')
def hello(): return 'PixelCrypt Active'

if __name__ == '__main__':
    app.run(debug=True)