/**
 * Color service to analyze image palettes and extract the subtle mood
 * of the most recently generated photo.
 */
import React from 'react';

export interface ColorPalette {
  dominant: { r: number; g: number; b: number; hex: string };
  colors: string[]; // List of HEX colors in the palette
  sidebarBgStyle: React.CSSProperties;
}

/**
 * Helper to convert RGB to HEX
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const componentToHex = (c: number) => {
    const hex = Math.max(0, Math.min(255, c)).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
}

/**
 * Extracts a color palette from an image URL and returns mood-aligned styles.
 */
export function analyzeImageColorPalette(imageUrl: string): Promise<ColorPalette | null> {
  return new Promise((resolve) => {
    if (!imageUrl) {
      resolve(null);
      return;
    }

    const img = new Image();
    // Allow cross-origin extraction for external URLs if applicable
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }

        // Downsample image to 10x10 to extract dominant clusters
        canvas.width = 10;
        canvas.height = 10;
        ctx.drawImage(img, 0, 0, 10, 10);

        const imgData = ctx.getImageData(0, 0, 10, 10).data;
        const colorCounts: { [key: string]: { r: number; g: number; b: number; count: number } } = {};
        
        let rSum = 0;
        let gSum = 0;
        let bSum = 0;
        let validPixels = 0;

        for (let i = 0; i < imgData.length; i += 4) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          const a = imgData[i + 3];

          // Only process fully opaque pixels
          if (a > 200) {
            rSum += r;
            gSum += g;
            bSum += b;
            validPixels++;

            // Bucket colors to find unique clusters (quantize to 16 levels)
            const qr = Math.round(r / 16) * 16;
            const qg = Math.round(g / 16) * 16;
            const qb = Math.round(b / 16) * 16;
            const key = `${qr},${qg},${qb}`;

            if (!colorCounts[key]) {
              colorCounts[key] = { r, g, b, count: 1 };
            } else {
              colorCounts[key].count++;
            }
          }
        }

        if (validPixels === 0) {
          resolve(null);
          return;
        }

        // Calculate exact average color (as fallback/primary dominant)
        const rAvg = Math.round(rSum / validPixels);
        const gAvg = Math.round(gSum / validPixels);
        const bAvg = Math.round(bSum / validPixels);
        const dominantHex = rgbToHex(rAvg, gAvg, bAvg);

        // Sort clustered buckets to find secondary/accent palette colors
        const sortedBuckets = Object.values(colorCounts).sort((a, b) => b.count - a.count);
        
        // Take up to 5 unique palette colors
        const paletteHexes: string[] = [];
        for (const bucket of sortedBuckets) {
          const hex = rgbToHex(bucket.r, bucket.g, bucket.b);
          // Simple duplicate/near-duplicate detection
          if (!paletteHexes.includes(hex)) {
            paletteHexes.push(hex);
            if (paletteHexes.length >= 5) break;
          }
        }

        // Generate subtle layout background reflecting the mood
        // We use a beautiful radial gradient that softly glows from the bottom right with the extracted dominant color
        const sidebarBgStyle: React.CSSProperties = {
          background: `radial-gradient(circle at bottom right, rgba(${rAvg}, ${gAvg}, ${bAvg}, 0.16) 0%, rgba(15, 23, 42, 0.98) 75%, rgba(2, 6, 23, 1) 100%)`,
          transition: 'background 1.5s cubic-bezier(0.16, 1, 0.3, 1)' // smooth mood shifting transition
        };

        resolve({
          dominant: { r: rAvg, g: gAvg, b: bAvg, hex: dominantHex },
          colors: paletteHexes.length > 0 ? paletteHexes : [dominantHex],
          sidebarBgStyle
        });
      } catch (err) {
        console.error("Error analyzing image color palette:", err);
        resolve(null);
      }
    };

    img.onerror = () => {
      resolve(null);
    };

    img.src = imageUrl;
  });
}
