from PIL import Image
import sys

img_path = sys.argv[1]
img = Image.open(img_path)
print(f"Size: {img.width}x{img.height}")
print(f"Mode: {img.mode}")
