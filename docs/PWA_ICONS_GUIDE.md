# PWA Icon Generation Guide

## Quick Solution (Recommended)

Use **[PWA Asset Generator](https://www.pwaassetgenerator.com/)** online tool:

1. Go to https://www.pwaassetgenerator.com/
2. Upload your Achrilik logo (512x512 PNG with transparent background)
3. Select all icon sizes:
   - 72x72
   - 96x96
   - 128x128
   - 144x144
   - 152x152
   - 192x192
   - 384x384
   - 512x512
4. Download the generated icons
5. Place them in `public/` directory

## Alternative: Using Figma/Photoshop

1. Create a 512x512 canvas
2. Design your icon with:
   - Achrilik green (#006233) background
   - White "A" logo or shopping cart icon
   - Safe zone: Keep important elements within 432x432 center
3. Export at different sizes using batch export

## Alternative: ImageMagick CLI

If you have ImageMagick installed:

```bash
# Resize from 512x512 source
magick icon-512x512.png -resize 384x384 icon-384x384.png
magick icon-512x512.png -resize 192x192 icon-192x192.png
magick icon-512x512.png -resize 152x152 icon-152x152.png
magick icon-512x512.png -resize 144x144 icon-144x144.png
magick icon-512x512.png -resize 128x128 icon-128x128.png
magick icon-512x512.png -resize 96x96 icon-96x96.png
magick icon-512x512.png -resize 72x72 icon-72x72.png
```

## Placeholder Icons (Temporary)

For testing purposes, I've created a simple SVG placeholder that you can convert:

1. Use the `icon-template.svg` in this directory
2. Convert to PNG at each size using online converter or Inkscape

## Icon Design Guidelines

### Colors
- Background: #006233 (Achrilik green)
- Foreground: White (#FFFFFF)
- Accent: #00753D (optional)

### Layout
- Center-aligned logo/symbol
- 10% padding on all sides
- Avoid text (hard to read at small sizes)
- Use simple, bold shapes

### Format
- PNG with transparency
- sRGB color space
- Optimized for web

## Verify Installation

After adding icons:
1. Deploy to HTTPS server
2. Open in Chrome mobile
3. Check install prompt appears
4. Install and verify icon appears on home screen

## Files to Update

After generating icons, update `public/manifest.json`:
- All icon paths should match filenames in `public/`
- Verify sizes attribute matches actual file dimensions
