#!/usr/bin/env python3
"""Generate JChat PWA icons — teal rounded square with a chat bubble."""

from PIL import Image, ImageDraw
import os

TEAL  = (26, 83, 92)
CYAN  = (78, 205, 196)
WHITE = (255, 255, 255)

def make_icon(size, maskable=False):
    img  = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    pad    = int(size * 0.12) if maskable else 0
    radius = int((size - pad * 2) * 0.22)
    draw.rounded_rectangle([pad, pad, size - pad, size - pad],
                            radius=radius, fill=TEAL)

    cx, cy = size // 2, size // 2
    s = size * 0.26

    # Main bubble body
    bx0 = cx - s
    by0 = cy - s * 0.75
    bx1 = cx + s
    by1 = cy + s * 0.45
    br  = s * 0.32
    draw.rounded_rectangle([bx0, by0, bx1, by1], radius=br, fill=CYAN)

    # Tail
    tail = [
        (cx - s * 0.05, by1 - 1),
        (cx - s * 0.55, by1 + s * 0.5),
        (cx + s * 0.15, by1 - 1),
    ]
    draw.polygon(tail, fill=CYAN)

    # Dots
    dot_r  = s * 0.1
    mid_y  = (by0 + by1) / 2 - s * 0.06
    for dx in (-s * 0.3, 0, s * 0.3):
        draw.ellipse(
            [cx + dx - dot_r, mid_y - dot_r,
             cx + dx + dot_r, mid_y + dot_r],
            fill=TEAL
        )
    return img

sizes = [
    ("icon-192.png",          192, False),
    ("icon-512.png",          512, False),
    ("icon-512-maskable.png", 512, True),
    ("favicon-32.png",         32, False),
    ("apple-touch-icon.png",  180, False),
]

for filename, size, maskable in sizes:
    make_icon(size, maskable).save(filename)
    print(filename)

print("Done.")
