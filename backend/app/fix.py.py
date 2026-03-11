import os

BASE = os.path.join(os.path.expanduser("~"), "Desktop", "alone-ai", "backend", "app")

# 1. image_router.py
path = os.path.join(BASE, "routers", "image_router.py")
with open(path, "w", encoding="utf-8") as f:
    f.write("from fastapi import APIRouter\n")
    f.write('router = APIRouter(prefix="/api/image", tags=["image"])\n')
print("image_router.py OK:", path)

# 2. model_router.py ga choose_model qo'shish
path = os.path.join(BASE, "core", "model_router.py")
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

if "def choose_model" not in content:
    with open(path, "a", encoding="utf-8") as f:
        f.write("\n\ndef choose_model(message=\"\", plan=\"free\"):\n")
        f.write("    from config import DEFAULT_MODEL\n")
        f.write("    return DEFAULT_MODEL\n")
    print("model_router.py: choose_model qoshildi")
else:
    print("model_router.py: choose_model allaqachon bor")

# 3. config.py ga STRIPE qo'shish
path = os.path.join(BASE, "config.py")
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

if "STRIPE_PRICE_PRO" not in content:
    with open(path, "a", encoding="utf-8") as f:
        f.write('\nSTRIPE_PRICE_PRO = ""\n')
        f.write('STRIPE_PRICE_PREMIUM = ""\n')
    print("config.py: STRIPE_PRICE_PRO qoshildi")
else:
    print("config.py: STRIPE_PRICE_PRO allaqachon bor")

print("\nHammasi tayyor!")