"""Rebuild browser images with Pillow; originals remain the PNG fallback.

Backgrounds are displayed on a 540x960 canvas. Keep coordinate-sensitive
sprite sheets and the projected painting at their original dimensions.
"""
from pathlib import Path
from PIL import Image

assets = Path(__file__).resolve().parents[1] / 'dist' / 'assets'
output = assets / 'web'
output.mkdir(exist_ok=True)
keep_size = {'chest', 'portraits', 'change-storyboard', 'projection-storyboard'}
for source in sorted(assets.glob('*.png')):
    with Image.open(source) as image:
        if source.stem not in keep_size:
            image = image.resize((1080, 960) if source.stem == 'water' else (540, 960), Image.Resampling.LANCZOS)
        image.save(output / (source.stem + '.webp'), 'WEBP', quality=88, method=6)
    print(f'{source.name}: {source.stat().st_size} -> {(output / (source.stem + ".webp")).stat().st_size}')
