from flask import Flask, request, send_file
import os
from steg_png import encode_png, decode_png
from crypto_vault import encrypt_message
from crypto_vault import decrypt_message

app = Flask(__name__)

# Health check
@app.route('/api/health', methods=['GET'])
def health_check():
    return {'status': 'ok'}, 200

# Allowed file types
ALLOWED_EXTENSIONS = {'png', 'wav', 'mp4'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Encode route
@app.route('/api/encode', methods=['POST'])
def encode():
    file = request.files.get('file')
    secret = request.form.get('secret')
    password = request.form.get('password')

    if not file or not secret or not password:
        return {'error': 'Missing file, secret, or password'}, 400

    if not allowed_file(file.filename):
        return {'error': 'Unsupported file type'}, 400

    UPLOAD_FOLDER = 'uploads'
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    encrypted_secret = encrypt_message(secret, password)
    encoded_path = encode_png(filepath, encrypted_secret)

    return send_file(encoded_path, as_attachment=True)

# Decode route
@app.route('/api/decode', methods=['POST'])
def decode_secret():
    file = request.files.get('file')
    password = request.form.get('password')

    if not file or not password:
        return {'error': 'Missing file or password'}, 400

    if not allowed_file(file.filename):
        return {'error': 'Unsupported file type'}, 400

    UPLOAD_FOLDER = 'uploads'
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    hidden_data = decode_png(filepath)
    try:
        secret = decrypt_message(hidden_data, password)
    except Exception:
        return {'error': 'Incorrect password or corrupted file'}, 403

    return {'secret': secret}
# Status route
@app.route('/api/status', methods=['GET'])
def status():
    return {'uptime': 'running', 'version': '0.1.0'}

# Root route
@app.route('/')
def hello_world():
    return 'Hello, PixelCrypt!'

if __name__ == '__main__':
    app.run(debug=True)