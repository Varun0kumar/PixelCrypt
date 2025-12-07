from Crypto.PublicKey import RSA
from Crypto.Cipher import AES, PKCS1_OAEP
from Crypto.Random import get_random_bytes
import base64

# --- KEY GENERATION ---
def generate_rsa_keys():
    """
    Generates a Public/Private key pair (2048 bits).
    Returns them as PEM byte strings.
    """
    key = RSA.generate(2048)
    private_key = key.export_key()
    public_key = key.publickey().export_key()
    return private_key, public_key

# --- HYBRID ENCRYPTION (RSA + AES) ---
def encrypt_hybrid(message, recipient_public_key_pem):
    """
    Encrypts using a random AES key, then encrypts that key with RSA.
    Returns a Base64 string containing all components.
    """
    try:
        # 1. Generate a random 32-byte AES Session Key
        session_key = get_random_bytes(32)

        # 2. Encrypt the AES Session Key with RSA Public Key
        recipient_key = RSA.import_key(recipient_public_key_pem)
        cipher_rsa = PKCS1_OAEP.new(recipient_key)
        enc_session_key = cipher_rsa.encrypt(session_key)

        # 3. Encrypt the actual Message with the AES Session Key
        cipher_aes = AES.new(session_key, AES.MODE_EAX)
        ciphertext, tag = cipher_aes.encrypt_and_digest(message.encode('utf-8'))

        # 4. Bundle: [Encrypted_AES_Key] ::: [Nonce] ::: [Tag] ::: [Ciphertext]
        # We convert everything to Base64 strings joined by ":::"
        b64_rsa_key = base64.b64encode(enc_session_key).decode('utf-8')
        b64_nonce = base64.b64encode(cipher_aes.nonce).decode('utf-8')
        b64_tag = base64.b64encode(tag).decode('utf-8')
        b64_text = base64.b64encode(ciphertext).decode('utf-8')
        
        return f"{b64_rsa_key}:::{b64_nonce}:::{b64_tag}:::{b64_text}"

    except Exception as e:
        raise ValueError(f"Hybrid Encryption failed: {e}")

# --- HYBRID DECRYPTION ---
def decrypt_hybrid(hybrid_package, private_key_pem):
    """
    Decrypts the AES key using RSA Private Key, then decrypts the message.
    """
    try:
        parts = hybrid_package.split(":::")
        if len(parts) != 4:
            raise ValueError("Corrupted data format")
            
        enc_session_key = base64.b64decode(parts[0])
        nonce = base64.b64decode(parts[1])
        tag = base64.b64decode(parts[2])
        ciphertext = base64.b64decode(parts[3])

        # 1. Decrypt the Session Key with RSA Private Key
        private_key = RSA.import_key(private_key_pem)
        cipher_rsa = PKCS1_OAEP.new(private_key)
        session_key = cipher_rsa.decrypt(enc_session_key)

        # 2. Decrypt the Message
        cipher_aes = AES.new(session_key, AES.MODE_EAX, nonce)
        data = cipher_aes.decrypt_and_verify(ciphertext, tag)
        
        return data.decode('utf-8')

    except (ValueError, TypeError) as e:
        raise ValueError("Decryption failed. Wrong Key or corrupted data.")