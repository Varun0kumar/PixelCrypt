from PIL import Image

def encode_png(image_path, secret, output_path='encoded_image.png'):
    img = Image.open(image_path)
    encoded = img.copy()
    width, height = img.size
    secret += '###'  # delimiter
    binary_secret = ''.join([format(ord(c), '08b') for c in secret])
    data_index = 0

    for y in range(height):
        for x in range(width):
            if data_index < len(binary_secret):
                r, g, b = img.getpixel((x, y))
                r = (r & ~1) | int(binary_secret[data_index])
                data_index += 1
                if data_index < len(binary_secret):
                    g = (g & ~1) | int(binary_secret[data_index])
                    data_index += 1
                if data_index < len(binary_secret):
                    b = (b & ~1) | int(binary_secret[data_index])
                    data_index += 1
                encoded.putpixel((x, y), (r, g, b))
            else:
                break
        if data_index >= len(binary_secret):
            break

    encoded.save(output_path)
    return output_path

def decode_png(image_path):
    img = Image.open(image_path)
    width, height = img.size
    binary_data = ''

    for y in range(height):
        for x in range(width):
            r, g, b = img.getpixel((x, y))
            binary_data += str(r & 1)
            binary_data += str(g & 1)
            binary_data += str(b & 1)

    all_bytes = [binary_data[i:i+8] for i in range(0, len(binary_data), 8)]
    decoded = ''
    for byte in all_bytes:
        decoded += chr(int(byte, 2))
        if decoded[-3:] == '###':
            break

    return decoded[:-3]