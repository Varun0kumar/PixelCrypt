import wave
import io

def encode_wav(filepath, data_bytes):
    with wave.open(filepath, 'rb') as audio:
        frames = bytearray(list(audio.readframes(audio.getnframes())))
        params = audio.getparams()

    length = len(data_bytes)
    full_payload = length.to_bytes(4, 'big') + data_bytes
    bits = ''.join(f'{byte:08b}' for byte in full_payload)

    if len(bits) > len(frames): raise ValueError("Audio too short.")

    for i, bit in enumerate(bits):
        frames[i] = (frames[i] & 0xFE) | int(bit)

    output = io.BytesIO()
    with wave.open(output, 'wb') as new_audio:
        new_audio.setparams(params)
        new_audio.writeframes(frames)
    output.seek(0)
    return output

def decode_wav(filepath):
    with wave.open(filepath, 'rb') as audio:
        frames = bytearray(list(audio.readframes(audio.getnframes())))

    bits = [str(b & 1) for b in frames]
    len_bits = "".join(bits[:32])
    if not len_bits: return None
    length = int(len_bits, 2)
    
    if length > len(frames) // 8: return None

    data_bits = "".join(bits[32 : 32 + (length * 8)])
    data_bytes = bytearray()
    for i in range(0, len(data_bits), 8):
        data_bytes.append(int(data_bits[i:i+8], 2))
    return bytes(data_bytes)