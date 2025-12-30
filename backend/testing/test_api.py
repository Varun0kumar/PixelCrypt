import requests
import os
import sys

# --- CONFIGURATION ---
BASE_URL = "https://varunkumar.pythonanywhere.com/"  
VIDEO_FILE = "test_video.mp4"
PUB_KEY = "public_key.pem"
PRIV_KEY = "private_key.pem"
SECRET_MSG = "This is a direct API test message."

def test_cycle():
    print(f"--- STARTING DIRECT API TEST AGAINST {BASE_URL} ---")

    # 1. Check files
    if not all(os.path.exists(f) for f in [VIDEO_FILE, PUB_KEY, PRIV_KEY]):
        print("ERROR: Missing files. Make sure video and keys are in this folder.")
        return

    # 2. ENCODE STEP
    print("\n[1] Attempting to ENCODE...")
    try:
        files = {
            'file': open(VIDEO_FILE, 'rb'),
            'key': open(PUB_KEY, 'rb')
        }
        data = {'secret': SECRET_MSG}
        
        response = requests.post(f"{BASE_URL}/api/encode_video", files=files, data=data)
        
        if response.status_code == 200:
            print(">>> Encode Success!")
            with open("encoded_output.mp4", "wb") as f:
                f.write(response.content)
            print(">>> Saved result to 'encoded_output.mp4'")
        else:
            print(f"!!! ENCODE FAILED. Status: {response.status_code}")
            print(f"Response: {response.text}")
            return
    except Exception as e:
        print(f"!!! CONNECTION ERROR: {e}")
        return

    # 3. DECODE STEP
    print("\n[2] Attempting to DECODE the result...")
    try:
        files = {
            'file': open("encoded_output.mp4", 'rb'),
            'key': open(PRIV_KEY, 'rb')
        }
        
        response = requests.post(f"{BASE_URL}/api/decode_video", files=files)
        
        print(f"Status Code: {response.status_code}")
        print(f"Raw Response: {response.text}")
        
        if response.status_code == 200:
            json_response = response.json()
            if json_response.get("secret") == SECRET_MSG:
                print("\nSUCCESS: The secret message matches!")
            else:
                print(f"\nFAILURE: Message mismatch. Got: {json_response.get('secret')}")
        else:
            print("\n!!! DECODE FAILED !!!")
            # This will show us the REAL error (System error or Crypto error)
            print("If you see 'SYSTEM ERROR', the backend is broken.")
            print("If you see 'Wrong Key', the audio data is corrupt.")

    except Exception as e:
        print(f"!!! CONNECTION ERROR: {e}")

if __name__ == "__main__":
    test_cycle()