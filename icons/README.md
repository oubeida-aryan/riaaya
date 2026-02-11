# PWA Icons Directory

This folder contains the Progressive Web App (PWA) icons for the Riaya application.

## Icon Files

All icons are generated from the original `logo.png` file:

- `icon-72x72.png` - 72x72 pixels
- `icon-96x96.png` - 96x96 pixels  
- `icon-128x128.png` - 128x128 pixels
- `icon-144x144.png` - 144x144 pixels
- `icon-152x152.png` - 152x152 pixels
- `icon-192x192.png` - 192x192 pixels
- `icon-384x384.png` - 384x384 pixels
- `icon-512x512.png` - 512x512 pixels

## Usage

These icons are referenced in:
- `manifest.json` - For PWA installation and splash screens
- `index.html` - For browser favicons and Apple touch icons
- `sw.js` - Cached for offline functionality

## Regenerating Icons

If you need to regenerate the icons with proper sizing:

1. Install ImageMagick from https://imagemagick.org/
2. Run the PowerShell script (if available) or manually resize the icons
3. Ensure all sizes maintain the aspect ratio and quality

## Notes

- The icons are currently copies of the original logo.png
- For optimal PWA experience, consider properly resizing each icon to its target dimensions
- Icons should be square and maintain good visibility at small sizes
