from Crypto.PublicKey import RSA
from Crypto.Cipher import AES, PKCS1_OAEP
from Crypto.Random import get_random_bytes

def generate_rsa_keys():
    key = RSA.generate(2048)
    return key.export_key(), key.publickey().export_key()

def encrypt_hybrid(secret_text, public_key_bytes):
    try:
        if isinstance(public_key_bytes, str): 
            public_key_bytes = public_key_bytes.encode('utf-8')
        public_key_bytes = public_key_bytes.strip()

        recipient_key = RSA.import_key(public_key_bytes)
        cipher_rsa = PKCS1_OAEP.new(recipient_key)
        session_key = get_random_bytes(32) 

        cipher_aes = AES.new(session_key, AES.MODE_EAX)
        ciphertext, tag = cipher_aes.encrypt_and_digest(secret_text.encode('utf-8'))

        enc_session_key = cipher_rsa.encrypt(session_key)
        return enc_session_key + cipher_aes.nonce + tag + ciphertext
    except Exception as e:
        raise ValueError(f"Crypto Error: {str(e)}")

def decrypt_hybrid(encrypted_data, private_key_bytes):
    try:
        if isinstance(private_key_bytes, str): 
            private_key_bytes = private_key_bytes.encode('utf-8')
        private_key_bytes = private_key_bytes.strip()

        private_key = RSA.import_key(private_key_bytes)
        cipher_rsa = PKCS1_OAEP.new(private_key)

        if len(encrypted_data) < 288:
            raise ValueError("Data corrupted.")

        enc_session_key = encrypted_data[:256]
        nonce = encrypted_data[256:272]
        tag = encrypted_data[272:288]
        ciphertext = encrypted_data[288:]

        session_key = cipher_rsa.decrypt(enc_session_key)
        cipher_aes = AES.new(session_key, AES.MODE_EAX, nonce)
        decrypted_text = cipher_aes.decrypt_and_verify(ciphertext, tag)
        
        return decrypted_text.decode('utf-8')
    except Exception as e:
        raise ValueError("Decryption Failed: Wrong Key or Corrupted Data.")