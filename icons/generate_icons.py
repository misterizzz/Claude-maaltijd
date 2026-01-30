#!/usr/bin/env python3
"""
Generate PWA icons as valid PNGs using only Python stdlib.
Each icon: rounded-rectangle dark-green background (#2c5f2d) with a white "M".
"""

import struct
import zlib
import math
import os

# -- PNG low-level helpers --

def make_chunk(chunk_type: bytes, data: bytes) -> bytes:
    """Build one PNG chunk (length + type + data + CRC)."""
    out = struct.pack(">I", len(data)) + chunk_type + data
    crc = zlib.crc32(chunk_type + data) & 0xFFFFFFFF
    out += struct.pack(">I", crc)
    return out


def make_png(width, height, pixels):
    """
    Create a minimal RGBA PNG from a 2-D pixel grid.
    pixels[y][x] = (R, G, B, A)
    """
    signature = b"\x89PNG\r\n\x1a\n"

    # IHDR: width, height, bit-depth=8, color-type=6 (RGBA)
    ihdr_data = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    ihdr = make_chunk(b"IHDR", ihdr_data)

    # IDAT: filtered scanlines compressed with zlib
    raw = bytearray()
    for y in range(height):
        raw.append(0)  # filter type "None" for this row
        for x in range(width):
            r, g, b, a = pixels[y][x]
            raw += bytes((r, g, b, a))
    compressed = zlib.compress(bytes(raw), 9)
    idat = make_chunk(b"IDAT", compressed)

    iend = make_chunk(b"IEND", b"")

    return signature + ihdr + idat + iend


# -- Drawing helpers --

BG = (0x2C, 0x5F, 0x2D, 255)    # dark green
WHITE = (255, 255, 255, 255)
TRANSPARENT = (0, 0, 0, 0)


def _point_in_rrect(px, py, w, h, r):
    """Continuous point-in-rounded-rect test."""
    if px < 0 or py < 0 or px > w - 1 or py > h - 1:
        return False
    if r <= px <= w - 1 - r:
        return True
    if r <= py <= h - 1 - r:
        return True
    corners = [
        (r, r),
        (w - 1 - r, r),
        (r, h - 1 - r),
        (w - 1 - r, h - 1 - r),
    ]
    for cx, cy in corners:
        dx = px - cx
        dy = py - cy
        if dx * dx + dy * dy <= r * r:
            return True
    return False


def rounded_rect_aa(x, y, w, h, r):
    """
    Return coverage 0.0-1.0 of pixel (x,y) inside the rounded rect,
    using 4x4 super-sampling for anti-aliased edges.
    """
    # Fast interior check
    if r < x < w - 1 - r and r < y < h - 1 - r:
        return 1.0
    if x < -1 or y < -1 or x > w or y > h:
        return 0.0

    samples = 4
    count = 0
    for sy in range(samples):
        for sx in range(samples):
            fx = x + (sx + 0.5) / samples
            fy = y + (sy + 0.5) / samples
            if _point_in_rrect(fx, fy, w, h, r):
                count += 1
    return count / (samples * samples)


# -- "M" glyph as a 9x10 bitmap (X = filled) --

M_GLYPH = [
    "X.......X",
    "XX.....XX",
    "X.X...X.X",
    "X..X.X..X",
    "X...X...X",
    "X.......X",
    "X.......X",
    "X.......X",
    "X.......X",
    "X.......X",
]
M_W = len(M_GLYPH[0])
M_H = len(M_GLYPH)


def draw_m(pixels, size):
    """
    Render the letter M into the pixel grid, centered and scaled.
    Uses area-coverage blending at cell edges.
    """
    # The glyph occupies ~50% of the icon height
    glyph_h = int(size * 0.50)
    glyph_w = int(glyph_h * (M_W / M_H))

    cell_w = glyph_w / M_W
    cell_h = glyph_h / M_H

    # Offsets to centre the glyph
    ox = (size - glyph_w) / 2.0
    oy = (size - glyph_h) / 2.0 + size * 0.02  # nudge down for optical centre

    for py in range(size):
        for px in range(size):
            gx = (px - ox) / cell_w
            gy = (py - oy) / cell_h
            gi = int(gx)
            gj = int(gy)
            if 0 <= gi < M_W and 0 <= gj < M_H and M_GLYPH[gj][gi] == "X":
                # Compute sub-pixel coverage for smooth edges
                x_lo = max(px, ox + gi * cell_w)
                x_hi = min(px + 1, ox + (gi + 1) * cell_w)
                y_lo = max(py, oy + gj * cell_h)
                y_hi = min(py + 1, oy + (gj + 1) * cell_h)
                coverage = max(0.0, x_hi - x_lo) * max(0.0, y_hi - y_lo)
                if coverage > 0.001:
                    bg = pixels[py][px]
                    a = coverage
                    r = int(bg[0] * (1 - a) + 255 * a + 0.5)
                    g = int(bg[1] * (1 - a) + 255 * a + 0.5)
                    b = int(bg[2] * (1 - a) + 255 * a + 0.5)
                    r = min(255, max(0, r))
                    g = min(255, max(0, g))
                    b = min(255, max(0, b))
                    pixels[py][px] = (r, g, b, bg[3])


def generate_icon(size):
    """Build the full icon at the given size and return PNG bytes."""
    radius = max(1, size // 8)  # corner radius ~ 12.5%

    # 1. Create canvas (transparent)
    pixels = [[TRANSPARENT for _ in range(size)] for _ in range(size)]

    # 2. Draw rounded-rect background with AA
    for y in range(size):
        for x in range(size):
            cov = rounded_rect_aa(x, y, size, size, radius)
            if cov >= 1.0:
                pixels[y][x] = BG
            elif cov > 0.0:
                a = int(255 * cov + 0.5)
                pixels[y][x] = (BG[0], BG[1], BG[2], a)

    # 3. Draw "M"
    draw_m(pixels, size)

    return make_png(size, size, pixels)


# -- Main --

SIZES = [72, 96, 128, 144, 152, 192, 384, 512]
OUT_DIR = "/home/user/Claude-maaltijd/icons"

os.makedirs(OUT_DIR, exist_ok=True)

for sz in SIZES:
    print(f"Generating {sz}x{sz} ... ", end="", flush=True)
    png_data = generate_icon(sz)
    path = os.path.join(OUT_DIR, f"icon-{sz}.png")
    with open(path, "wb") as f:
        f.write(png_data)
    print(f"wrote {len(png_data):,} bytes -> {path}")

print("\nDone. All icons generated.")
