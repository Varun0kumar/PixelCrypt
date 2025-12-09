import os
import subprocess
import shutil
from steg_wav import encode_wav, decode_wav
from crypto_vault import encrypt_hybrid, decrypt_hybrid

def check_ffmpeg():
    if shutil.which("ffmpeg") is None:
        raise RuntimeError("FFmpeg not found. Install it and add to PATH.")

def encode_mp4(video_path, secret, public_key_bytes):
    check_ffmpeg()
    base_dir = os.path.dirname(video_path)
    base_name = os.path.splitext(os.path.basename(video_path))[0]
    
    temp_audio = os.path.join(base_dir, f"{base_name}_temp.wav")
    temp_steg = os.path.join(base_dir, f"{base_name}_steg.wav")
    output = os.path.join(base_dir, f"{base_name}_encoded.mp4")
    
    try:
        # 1. Encrypt
        encrypted = encrypt_hybrid(secret, public_key_bytes)

        # 2. Extract Audio (or generate silence)
        subprocess.run(["ffmpeg", "-y", "-i", video_path, "-vn", "-acodec", "pcm_s16le", "-ar", "44100", "-ac", "2", temp_audio], 
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
        if not os.path.exists(temp_audio) or os.path.getsize(temp_audio) < 1000:
            subprocess.run(["ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo", "-t", "10", "-f", "wav", temp_audio],
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

        # 3. Embed
        steg_buf = encode_wav(temp_audio, encrypted)
        with open(temp_steg, "wb") as f: f.write(steg_buf.getbuffer())

        # 4. Merge (Use ALAC for lossless audio)
        subprocess.run(["ffmpeg", "-y", "-i", video_path, "-i", temp_steg, "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-c:a", "alac", output],
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

        with open(output, "rb") as f: return f.read()
    finally:
        for f in [temp_audio, temp_steg, output]:
            if os.path.exists(f): 
                try: os.remove(f) 
                except: pass

def decode_mp4(video_path, private_key_bytes):
    check_ffmpeg()
    temp_audio = video_path + ".temp.wav"
    try:
        # 1. Extract
        subprocess.run(["ffmpeg", "-y", "-i", video_path, "-vn", "-acodec", "pcm_s16le", "-ar", "44100", "-ac", "2", temp_audio],
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        # 2. Decode & Decrypt
        hidden_bytes = decode_wav(temp_audio)
        if not hidden_bytes: return None
        return decrypt_hybrid(hidden_bytes, private_key_bytes)
    finally:
        if os.path.exists(temp_audio): 
            try: os.remove(temp_audio)
            except: pass