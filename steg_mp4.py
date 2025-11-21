import subprocess
import os
from steg_wav import encode_wav, decode_wav
from crypto_vault import encrypt_message, decrypt_message

# ----------------------------------------
# Helper Functions
# ----------------------------------------
def extract_audio_from_mp4(mp4_path, wav_path):
    """
    Extracts audio from MP4. Injects silent audio if none exists.
    Returns the path of the video file to be used (original or new silent one).
    """
    # Probe for audio
    probe = subprocess.run(["ffmpeg", "-i", mp4_path], stderr=subprocess.PIPE, text=True, shell=True)
    has_audio = "Audio:" in probe.stderr

    working_mp4 = mp4_path

    if not has_audio:
        print("⚠️ No audio stream found. Injecting silent audio...")
        base_dir = os.path.dirname(mp4_path)
        base_name = os.path.splitext(os.path.basename(mp4_path))[0]
        silent_mp4 = os.path.join(base_dir, f"{base_name}_temp_silent.mp4")
        
        inject_cmd = [
            "ffmpeg", "-y", "-i", mp4_path,
            "-f", "lavfi", "-i", "anullsrc=channel_layout=stereo:sample_rate=44100",
            "-shortest", "-c:v", "copy", "-c:a", "aac", silent_mp4
        ]
        subprocess.run(inject_cmd, check=True, shell=True)
        
        # Update working path to the new video with audio
        working_mp4 = silent_mp4
    
    # Extract audio (ALWAYS run this, using the working_mp4)
    extract_cmd = ["ffmpeg", "-y", "-i", working_mp4, "-vn", "-acodec", "pcm_s16le", wav_path]
    subprocess.run(extract_cmd, check=True, shell=True)
    
    return working_mp4

def replace_audio_in_mp4(original_mp4, encoded_wav, output_mp4):
    """Replaces audio in MP4 with the encoded WAV using lossless ALAC codec."""
    cmd = [
        "ffmpeg", "-y", "-i", original_mp4, "-i", encoded_wav,
        "-c:v", "copy", 
        "-map", "0:v:0", 
        "-map", "1:a:0", 
        "-c:a", "alac", 
        "-map_metadata", "-1", # PRIVACY SHIELD: Wipe all metadata
        output_mp4
    ]
    subprocess.run(cmd, check=True, shell=True)

# ----------------------------------------
# Main Encode Function
# ----------------------------------------
def encode_mp4(mp4_path, secret, password):
    base_dir = os.path.dirname(mp4_path)
    base_name = os.path.splitext(os.path.basename(mp4_path))[0]
    
    temp_audio_path = os.path.join(base_dir, "temp_audio_extract.wav")
    # This needs to be defined before try block for cleanup safety
    generated_wav_path = None 
    working_mp4 = mp4_path
    
    # Final output name
    output_mp4 = os.path.join(base_dir, f"encoded_{base_name}.mp4")

    try:
        # 1. Extract Audio
        # This now correctly returns the path AND creates temp_audio_extract.wav
        working_mp4 = extract_audio_from_mp4(mp4_path, temp_audio_path)

        # 2. Encrypt & Prepare Data
        encrypted_secret_string = encrypt_message(secret, password)
        data_to_hide_bytes = encrypted_secret_string.encode('utf-8')

        # 3. Encode into Audio
        generated_wav_path = encode_wav(temp_audio_path, data_to_hide_bytes)
        
        # 4. Merge back into Video
        replace_audio_in_mp4(working_mp4, generated_wav_path, output_mp4)

        return output_mp4

    finally:
        # --- CLEANUP ---
        # Only delete if variable is defined and file exists
        files_to_remove = [temp_audio_path]
        if generated_wav_path:
            files_to_remove.append(generated_wav_path)
        
        # If we created a temp video with silent audio, delete it too
        if working_mp4 != mp4_path:
            files_to_remove.append(working_mp4)
            
        for f in files_to_remove:
            if f and os.path.exists(f):
                try:
                    os.remove(f)
                except Exception:
                    pass

# ----------------------------------------
# Main Decode Function
# ----------------------------------------
def decode_mp4(mp4_path, password):
    base_dir = os.path.dirname(mp4_path)
    temp_audio_path = os.path.join(base_dir, "temp_decode_audio.wav")
    working_mp4 = mp4_path

    try:
        # 1. Extract Audio
        working_mp4 = extract_audio_from_mp4(mp4_path, temp_audio_path)

        # 2. Decode Data
        hidden_data_bytes = decode_wav(temp_audio_path)
        
        if not hidden_data_bytes:
            return None

        # 3. Decrypt
        try:
            hidden_data_string = hidden_data_bytes.rstrip(b'\x00').decode('utf-8')
            secret = decrypt_message(hidden_data_string, password)
            return secret
        except Exception as e:
            print(f"Decryption failed: {e}")
            return None
            
    finally:
        # --- CLEANUP ---
        files_to_remove = [temp_audio_path]
        if working_mp4 != mp4_path:
            files_to_remove.append(working_mp4)
            
        for f in files_to_remove:
            if f and os.path.exists(f):
                try:
                    os.remove(f)
                except:
                    pass