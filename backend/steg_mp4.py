import subprocess
import os
from backend.steg_wav import encode_wav, decode_wav
# Note: Importing the NEW hybrid functions
from backend.crypto_vault import encrypt_hybrid, decrypt_hybrid

# ----------------------------------------
# Helper Functions
# ----------------------------------------
def extract_audio_from_mp4(mp4_path, wav_path):
    """Extracts audio from MP4. Injects silent audio if none exists."""
    probe = subprocess.run(["ffmpeg", "-i", mp4_path], stderr=subprocess.PIPE, text=True, shell=True)
    has_audio = "Audio:" in probe.stderr

    if not has_audio:
        print("⚠️ No audio stream found. Injecting silent audio...")
        silent_mp4 = mp4_path.replace(".mp4", "_temp_silent.mp4")
        inject_cmd = [
            "ffmpeg", "-y", "-i", mp4_path,
            "-f", "lavfi", "-i", "anullsrc=channel_layout=stereo:sample_rate=44100",
            "-shortest", "-c:v", "copy", "-c:a", "aac", silent_mp4
        ]
        subprocess.run(inject_cmd, check=True, shell=True)
        # Extract from the new silent file
        extract_cmd = ["ffmpeg", "-y", "-i", silent_mp4, "-vn", "-acodec", "pcm_s16le", wav_path]
        subprocess.run(extract_cmd, check=True, shell=True)
        return silent_mp4
    
    extract_cmd = ["ffmpeg", "-y", "-i", mp4_path, "-vn", "-acodec", "pcm_s16le", wav_path]
    subprocess.run(extract_cmd, check=True, shell=True)
    return mp4_path

def replace_audio_in_mp4(original_mp4, encoded_wav, output_mp4):
    """Replaces audio in MP4 with encoded WAV using Lossless Codec & Privacy Shield."""
    cmd = [
        "ffmpeg", "-y", "-i", original_mp4, "-i", encoded_wav,
        "-c:v", "copy", 
        "-map", "0:v:0", 
        "-map", "1:a:0", 
        "-c:a", "alac", 
        "-map_metadata", "-1", # PRIVACY SHIELD
        output_mp4
    ]
    subprocess.run(cmd, check=True, shell=True)

# ----------------------------------------
# Main Encode Function (Public Key)
# ----------------------------------------
def encode_mp4(mp4_path, secret, public_key_pem):
    base_dir = os.path.dirname(mp4_path)
    base_name = os.path.splitext(os.path.basename(mp4_path))[0]
    
    temp_audio_path = os.path.join(base_dir, "temp_audio_extract.wav")
    generated_wav_path = None 
    working_mp4 = mp4_path
    
    output_mp4 = os.path.join(base_dir, f"encoded_{base_name}.mp4")

    try:
        # 1. Extract Audio
        working_mp4 = extract_audio_from_mp4(mp4_path, temp_audio_path)

        # 2. Encrypt with RSA Hybrid (Returns String)
        encrypted_string = encrypt_hybrid(secret, public_key_pem)
        data_bytes = encrypted_string.encode('utf-8')

        # 3. Encode into Audio (Expects Bytes)
        generated_wav_path = encode_wav(temp_audio_path, data_bytes)
        
        # 4. Merge
        replace_audio_in_mp4(working_mp4, generated_wav_path, output_mp4)

        return output_mp4

    finally:
        # Cleanup
        files = [temp_audio_path]
        if generated_wav_path: files.append(generated_wav_path)
        if working_mp4 != mp4_path: files.append(working_mp4)
        
        for f in files:
            if f and os.path.exists(f):
                try: os.remove(f)
                except: pass

# ----------------------------------------
# Main Decode Function (Private Key)
# ----------------------------------------
def decode_mp4(mp4_path, private_key_pem):
    base_dir = os.path.dirname(mp4_path)
    temp_audio_path = os.path.join(base_dir, "temp_decode_audio.wav")
    working_mp4 = mp4_path

    try:
        working_mp4 = extract_audio_from_mp4(mp4_path, temp_audio_path)
        
        # Decode (Returns Bytes)
        hidden_bytes = decode_wav(temp_audio_path)
        if not hidden_bytes: return None

        # Convert to String for Decryption
        hidden_string = hidden_bytes.rstrip(b'\x00').decode('utf-8')
        
        # Decrypt with RSA Hybrid
        secret = decrypt_hybrid(hidden_string, private_key_pem)
        return secret
    except Exception as e:
        print(f"Video Decryption failed: {e}")
        return None
    finally:
        # Cleanup
        files = [temp_audio_path]
        if working_mp4 != mp4_path: files.append(working_mp4)
        for f in files:
            if f and os.path.exists(f):
                try: os.remove(f)
                except: pass