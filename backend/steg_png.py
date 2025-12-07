from PIL import Image
import os

def encode_png(filepath, secret):
    # Ensure secret is a string before encoding (if it's bytes, decode it)
    # BUT, based on your crypto_vault, encrypt_message returns a STRING (base64).
    # So 'secret' is a string here.
    
    img = Image.open(filepath)
    # Create a fresh image buffer with the same size and mode.
    # This strips EXIF tags, GPS data, and Camera Model info.
    clean_img = Image.new(img.mode, img.size)
    clean_img.putdata(list(img.getdata()))
    encoded = clean_img.copy()
    width, height = img.size
    
    # Delimiter to mark end of message
    secret += "###" 
    
    # Convert secret string to binary string
    # encrypt_message returns a string, so ord(c) works fine.
    bits = ''.join([format(ord(c), '08b') for c in secret])
    
    bit_idx = 0
    pixels = encoded.load()

    for y in range(height):
        for x in range(width):
            if bit_idx < len(bits):
                r, g, b = img.getpixel((x, y))
                
                # Modify LSB of Red channel
                r = (r & 254) | int(bits[bit_idx])
                bit_idx += 1
                
                pixels[x, y] = (r, g, b)
            else:
                break
        if bit_idx >= len(bits):
            break
            
    # FIX: Save to the same directory as input (uploads/), not root
    base_dir = os.path.dirname(filepath)
    filename = os.path.basename(filepath)
    name, ext = os.path.splitext(filename)
    
    encoded_filename = f"encoded_{name}.png"
    encoded_path = os.path.join(base_dir, encoded_filename)
    
    encoded.save(encoded_path)
    return encoded_path

def decode_png(filepath):
    img = Image.open(filepath)
    width, height = img.size
    bits = ""
    
    for y in range(height):
        for x in range(width):
            r, g, b = img.getpixel((x, y))
            bits += str(r & 1)

    # Convert bits to characters
    chars = []
    for i in range(0, len(bits), 8):
        byte = bits[i:i+8]
        if len(byte) < 8: break
        chars.append(chr(int(byte, 2)))
        
        # Optimization: Check for delimiter every char to stop early
        if len(chars) >= 3 and "".join(chars[-3:]) == "###":
            break
            
    message = "".join(chars)
    
    if "###" in message:
        return message.split("###")[0]
    else:
        # If no delimiter found, return empty or error
        return ""