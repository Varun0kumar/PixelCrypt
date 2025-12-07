import requests
import os
import zipfile
import io

# --- Configuration ---
SERVER_URL = "http://127.0.0.1:5000"
TEST_MESSAGE = "This is a super secret test message using RSA-2048!"

# --- PATH CORRECTION ---
# Based on your screenshot, input files are inside the 'uploads' folder.
IMAGE_IN = os.path.join("uploads", "test_image.png")
AUDIO_IN = os.path.join("uploads", "test_audio.wav")
VIDEO_IN = os.path.join("uploads", "test_video.mp4")

# Output Directory
OUTPUT_DIR = "processed_test_outputs"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Key Paths (These will be created by the script)
PUB_KEY_PATH = os.path.join(OUTPUT_DIR, "public_key.pem")
PRI_KEY_PATH = os.path.join(OUTPUT_DIR, "private_key.pem")

def print_result(name, success, msg=""):
    status = "SUCCESS" if success else "FAILURE"
    print(f"[{status}] {name}")
    if msg: print(f"  > {msg}")
    print("-" * 40)

# --- 1. Generate & Download Keys ---
def test_generate_keys():
    print("\n--- 1. Generating RSA Keys ---")
    try:
        # Call the new endpoint
        response = requests.get(f"{SERVER_URL}/api/generate_keys")
        
        if response.status_code == 200:
            print("  > Downloading ZIP file...")
            # Extract the ZIP file in memory
            with zipfile.ZipFile(io.BytesIO(response.content)) as z:
                z.extractall(OUTPUT_DIR)
            
            if os.path.exists(PUB_KEY_PATH) and os.path.exists(PRI_KEY_PATH):
                print_result("Keys Downloaded & Extracted", True, f"Saved to {OUTPUT_DIR}")
                return True
            else:
                print_result("Key Extraction", False, "PEM files not found in zip")
                return False
        else:
            print_result("Key Generation", False, f"Status: {response.status_code}")
            return False
    except Exception as e:
        print_result("Key Generation Error", False, str(e))
        return False

# --- 2. Image Test ---
def test_image():
    print("\n--- 2. Testing Image Steganography (RSA) ---")
    if not os.path.exists(IMAGE_IN):
        print(f"SKIPPED: {IMAGE_IN} not found. Please put a file named test_image.png in the uploads folder.")
        return

    encoded_file = os.path.join(OUTPUT_DIR, "rsa_encoded_image.png")
    
    # ENCODE (Upload File + Public Key)
    try:
        with open(IMAGE_IN, 'rb') as f, open(PUB_KEY_PATH, 'rb') as key:
            files = {'file': f, 'key': key}
            data = {'secret': TEST_MESSAGE}
            print("  > Encoding...")
            res = requests.post(f"{SERVER_URL}/api/encode", files=files, data=data)
            
        if res.status_code == 200:
            with open(encoded_file, 'wb') as f: f.write(res.content)
            print_result("Encode Image", True)
        else:
            print_result("Encode Image", False, res.text)
            return
    except Exception as e:
        print_result("Encode Crash", False, str(e))
        return

    # DECODE (Upload Encoded File + Private Key)
    try:
        with open(encoded_file, 'rb') as f, open(PRI_KEY_PATH, 'rb') as key:
            # Note: sending the file again as 'file'
            files = {'file': (os.path.basename(encoded_file), f, 'image/png'), 'key': key}
            print("  > Decoding...")
            res = requests.post(f"{SERVER_URL}/api/decode", files=files)
            
        if res.status_code == 200:
            decrypted = res.json().get('secret')
            if decrypted == TEST_MESSAGE:
                print_result("Decode Image", True, f"Verified: {decrypted}")
            else:
                print_result("Decode Image", False, "Message Mismatch")
        else:
            print_result("Decode Image", False, res.text)
    except Exception as e:
        print_result("Decode Crash", False, str(e))

# --- 3. Audio Test ---
def test_audio():
    print("\n--- 3. Testing Audio Steganography (RSA) ---")
    if not os.path.exists(AUDIO_IN):
        print(f"SKIPPED: {AUDIO_IN} not found. Please put a file named test_audio.wav in the uploads folder.")
        return

    encoded_file = os.path.join(OUTPUT_DIR, "rsa_encoded_audio.wav")
    
    # ENCODE
    try:
        with open(AUDIO_IN, 'rb') as f, open(PUB_KEY_PATH, 'rb') as key:
            files = {'file': f, 'key': key}
            data = {'secret': TEST_MESSAGE}
            print("  > Encoding...")
            res = requests.post(f"{SERVER_URL}/api/encode_audio", files=files, data=data)
            
        if res.status_code == 200:
            with open(encoded_file, 'wb') as f: f.write(res.content)
            print_result("Encode Audio", True)
        else:
            print_result("Encode Audio", False, res.text)
            return
    except Exception as e:
        print_result("Encode Crash", False, str(e))
        return

    # DECODE
    try:
        with open(encoded_file, 'rb') as f, open(PRI_KEY_PATH, 'rb') as key:
            files = {'file': (os.path.basename(encoded_file), f, 'audio/wav'), 'key': key}
            print("  > Decoding...")
            res = requests.post(f"{SERVER_URL}/api/decode_audio", files=files)
            
        if res.status_code == 200:
            decrypted = res.json().get('secret')
            if decrypted == TEST_MESSAGE:
                print_result("Decode Audio", True, f"Verified: {decrypted}")
            else:
                print_result("Decode Audio", False, "Message Mismatch")
        else:
            print_result("Decode Audio", False, res.text)
    except Exception as e:
        print_result("Decode Crash", False, str(e))

# --- 4. Video Test ---
def test_video():
    print("\n--- 4. Testing Video Steganography (RSA) ---")
    if not os.path.exists(VIDEO_IN):
        print(f"SKIPPED: {VIDEO_IN} not found. Please put a file named test_video.mp4 in the uploads folder.")
        return

    encoded_file = os.path.join(OUTPUT_DIR, "rsa_encoded_video.mp4")
    
    # ENCODE
    try:
        with open(VIDEO_IN, 'rb') as f, open(PUB_KEY_PATH, 'rb') as key:
            files = {'file': f, 'key': key}
            data = {'secret': TEST_MESSAGE}
            print("  > Encoding (This may take time)...")
            res = requests.post(f"{SERVER_URL}/api/encode_video", files=files, data=data)
            
        if res.status_code == 200:
            with open(encoded_file, 'wb') as f: f.write(res.content)
            print_result("Encode Video", True)
        else:
            print_result("Encode Video", False, res.text)
            return
    except Exception as e:
        print_result("Encode Crash", False, str(e))
        return

    # DECODE
    try:
        with open(encoded_file, 'rb') as f, open(PRI_KEY_PATH, 'rb') as key:
            files = {'file': (os.path.basename(encoded_file), f, 'video/mp4'), 'key': key}
            print("  > Decoding...")
            res = requests.post(f"{SERVER_URL}/api/decode_video", files=files)
            
        if res.status_code == 200:
            decrypted = res.json().get('secret')
            if decrypted == TEST_MESSAGE:
                print_result("Decode Video", True, f"Verified: {decrypted}")
            else:
                print_result("Decode Video", False, "Message Mismatch")
        else:
            print_result("Decode Video", False, res.text)
    except Exception as e:
        print_result("Decode Crash", False, str(e))

if __name__ == "__main__":
    print(f"Starting RSA Tests against {SERVER_URL}")
    # 1. First, get the keys. Without them, nothing else works.
    if test_generate_keys():
        # 2. Run the tests
        test_image()
        test_audio()
        test_video()
    else:
        print("CRITICAL: Could not generate keys. Aborting tests.")