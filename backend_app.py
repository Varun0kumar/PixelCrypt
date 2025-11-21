from flask import Flask, request, send_file, jsonify
import os
import random
from steg_png import encode_png, decode_png
from steg_wav import encode_wav, decode_wav
from steg_mp4 import encode_mp4, decode_mp4 
from crypto_vault import encrypt_message, decrypt_message

app = Flask(__name__)

# Dictionary to track failed attempts: { "filename": failure_count }
attempt_tracker = {}
MAX_ATTEMPTS = 3

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# --- Helper: Corruption Logic ---
def corrupt_file(filepath):
    """
    Corrupts the file header and data to make it unopenable 
    and destroy steganographic content, but keeps the file on disk.
    """
    if not os.path.exists(filepath):
        return

    try:
        file_size = os.path.getsize(filepath)
        with open(filepath, 'r+b') as f:
            # 1. Corrupt the Header (first 1024 bytes)
            # This breaks the file format (PNG, WAV, MP4) so it won't open.
            header_size = min(1024, file_size)
            f.seek(0)
            f.write(os.urandom(header_size))
            
            # 2. Corrupt random chunks throughout the file
            # This ensures steganographic data is likely destroyed
            # even if someone fixes the header.
            if file_size > 1024:
                for _ in range(5): # Corrupt 5 random spots
                    pos = random.randint(1024, file_size - 100)
                    f.seek(pos)
                    f.write(os.urandom(100))
                    
        print(f"SECURITY ACTION: Corrupted {filepath}")
    except Exception as e:
        print(f"Error corrupting file: {e}")

# --- Helper: Security Logic ---
def handle_failed_attempt(filename, filepath):
    """
    Tracks attempts. 
    If 3rd strike: CORRUPT the file (do not delete).
    """
    if filename not in attempt_tracker:
        attempt_tracker[filename] = 0
    
    attempt_tracker[filename] += 1
    count = attempt_tracker[filename]
    remaining = MAX_ATTEMPTS - count

    if count < MAX_ATTEMPTS:
        return jsonify({
            'error': f'Incorrect password. Warning: {remaining} attempt(s) remaining.'
        }), 401
    else:
        # 3rd Strike: CORRUPT FILE
        corrupt_file(filepath)
            
        return jsonify({
            'error': 'SECURITY ALERT: 3 failed attempts. The file has been permanently corrupted and is no longer readable.'
        }), 410

# --- Health check ---
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok'}), 200

# Allowed file types
ALLOWED_EXTENSIONS = {'png', 'wav', 'mp4'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# --- ENCODE ROUTES ---

@app.route('/api/encode_image', methods=['POST'])
def encode():
    file = request.files.get('file')
    secret = request.form.get('secret')
    password = request.form.get('password')

    if not file or not secret or not password: return jsonify({'error': 'Missing data'}), 400
    if not allowed_file(file.filename): return jsonify({'error': 'Invalid file'}), 400

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    try:
        encrypted_secret = encrypt_message(secret, password)
        encoded_path = encode_png(filepath, encrypted_secret)
        return send_file(encoded_path, as_attachment=True)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/encode_audio', methods=['POST'])
def encode_audio():
    file = request.files.get('file')
    secret = request.form.get('secret')
    password = request.form.get('password')
    if not file or not secret or not password: return jsonify({'error': 'Missing data'}), 400

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)
    
    try:
        encrypted_str = encrypt_message(secret, password)
        encoded_path = encode_wav(filepath, encrypted_str.encode('utf-8'))
        return send_file(encoded_path, as_attachment=True)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/encode_video', methods=['POST'])
def encode_video():
    file = request.files.get('file')
    secret = request.form.get('secret')
    password = request.form.get('password')
    if not file or not secret or not password: return jsonify({'error': 'Missing data'}), 400

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    try:
        encoded_path = encode_mp4(filepath, secret, password)
        return send_file(encoded_path, as_attachment=True)
    except Exception as e:
        print("Encode Error:", e)
        return jsonify({'error': 'Encoding failed'}), 500

# --- DECODE ROUTES ---

@app.route('/api/decode_image', methods=['POST'])
def decode_secret():
    file = request.files.get('file')
    password = request.form.get('password')
    if not file or not password: return jsonify({'error': 'Missing data'}), 400

    # Check if already banned (optional, since file is corrupted anyway)
    if attempt_tracker.get(file.filename, 0) >= MAX_ATTEMPTS:
         return jsonify({'error': 'This file has been corrupted due to security violations.'}), 410

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    try:
        hidden_data = decode_png(filepath)
        secret = decrypt_message(hidden_data, password)
        attempt_tracker[file.filename] = 0 
        return jsonify({'secret': secret})
    except Exception:
        return handle_failed_attempt(file.filename, filepath)

@app.route('/api/decode_audio', methods=['POST'])
def decode_audio():
    file = request.files.get('file')
    password = request.form.get('password')
    if not file or not password: return jsonify({'error': 'Missing data'}), 400

    if attempt_tracker.get(file.filename, 0) >= MAX_ATTEMPTS:
         return jsonify({'error': 'This file has been corrupted due to security violations.'}), 410

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    try:
        hidden_bytes = decode_wav(filepath)
        if not hidden_bytes: raise Exception("No data")
        
        hidden_str = hidden_bytes.decode('utf-8')
        secret = decrypt_message(hidden_str, password)
        attempt_tracker[file.filename] = 0
        return jsonify({'secret': secret})
    except Exception:
        return handle_failed_attempt(file.filename, filepath)

@app.route('/api/decode_video', methods=['POST'])
def decode_video():
    file = request.files.get('file')
    password = request.form.get('password')
    if not file or not password: return jsonify({'error': 'Missing data'}), 400

    if attempt_tracker.get(file.filename, 0) >= MAX_ATTEMPTS:
         return jsonify({'error': 'This file has been corrupted due to security violations.'}), 410

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    try:
        secret = decode_mp4(filepath, password)
        if secret:
            attempt_tracker[file.filename] = 0
            return jsonify({'secret': secret})
        else:
            raise Exception("Decode failed")
    except Exception as e:
        print("Video Decode Error:", e)
        return handle_failed_attempt(file.filename, filepath)

@app.route('/api/status', methods=['GET'])
def status():
    return jsonify({'uptime': 'running'})

@app.route('/')
def hello():
    return 'PixelCrypt Active'

if __name__ == '__main__':
    app.run(debug=True)