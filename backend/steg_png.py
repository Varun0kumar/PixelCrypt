from PIL import Image
import numpy as np
import io

def encode_png(filepath, data_bytes):
    with Image.open(filepath) as img:
        img = img.convert("RGB")
        pixels = np.array(img)

    length = len(data_bytes)
    full_payload = length.to_bytes(4, 'big') + data_bytes
    bits = ''.join(f'{byte:08b}' for byte in full_payload)
    
    if len(bits) > pixels.size: raise ValueError("Image too small.")

    flat = pixels.flatten()
    for i, bit in enumerate(bits):
        flat[i] = (flat[i] & 0xFE) | int(bit)
    
    new_img = Image.fromarray(flat.reshape(pixels.shape), "RGB")
    output = io.BytesIO()
    new_img.save(output, format="PNG")
    output.seek(0)
    return output

def decode_png(filepath):
    with Image.open(filepath) as img:
        img = img.convert("RGB")
        flat = np.array(img).flatten()
    
    bits = [str(val & 1) for val in flat]
    len_bits = "".join(bits[:32])
    if not len_bits: return None
    length = int(len_bits, 2)
    
    if length > len(flat) // 8: return None

    data_bits = "".join(bits[32 : 32 + (length * 8)])
    data_bytes = bytearray()
    for i in range(0, len(data_bits), 8):
        data_bytes.append(int(data_bits[i:i+8], 2))
        
    return bytes(data_bytes)