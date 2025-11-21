import wave
import os

def encode_wav(filepath, secret_data: bytes):
    """
    Hides raw bytes (secret_data) inside a WAV file.
    """
    try:
        audio = wave.open(filepath, mode='rb')
        frame_bytes = bytearray(list(audio.readframes(audio.getnframes())))
        audio.close()
    except Exception as e:
        print(f"Error opening WAV file: {e}")
        raise

    delimiter = b"###"
    if isinstance(secret_data, str):
        secret_data = secret_data.encode('utf-8')

    data_to_hide = secret_data + delimiter
    bits = ''.join([format(byte, '08b') for byte in data_to_hide])

    if len(bits) > len(frame_bytes):
        raise ValueError("Error: Data to hide is larger than the audio file capacity.")

    for i in range(len(bits)):
        frame_bytes[i] = (frame_bytes[i] & 254) | int(bits[i])

    # Avoid "file_encoded.wav_encoded.wav" chains.
    # Just append _encoded once.
    if filepath.endswith("_encoded.wav"):
        encoded_path = filepath 
    else:
        encoded_path = filepath.replace(".wav", "_encoded.wav")
        
    try:
        with wave.open(encoded_path, 'wb') as encoded:
            encoded.setparams(audio.getparams())
            encoded.writeframes(bytes(frame_bytes))
    except Exception as e:
        print(f"Error writing encoded WAV file: {e}")
        raise
        
    return encoded_path

def decode_wav(filepath):
    """
    Extracts raw bytes from a WAV file until a delimiter is found.
    """
    try:
        audio = wave.open(filepath, mode='rb')
        frame_bytes = bytearray(list(audio.readframes(audio.getnframes())))
        audio.close()
    except Exception as e:
        print(f"Error opening WAV file for decoding: {e}")
        raise

    extracted_bytes = bytearray()
    binary_string = ""
    delimiter = b"###"
    
    for i in range(len(frame_bytes)):
        binary_string += str(frame_bytes[i] & 1)
        if len(binary_string) == 8:
            try:
                byte = int(binary_string, 2)
                extracted_bytes.append(byte)
                binary_string = ""
                if extracted_bytes.endswith(delimiter):
                    return bytes(extracted_bytes[:-len(delimiter)])
            except Exception:
                binary_string = ""
    
    return None