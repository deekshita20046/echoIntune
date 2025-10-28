// Simple script to generate placeholder PNG icons
// Run with: node generate-icons.js

import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#4F46E5');
  gradient.addColorStop(1, '#06B6D4');

  // Draw rounded rectangle
  const radius = size / 5;
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  // Draw "E" letter
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size * 0.625}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('E', size / 2, size / 2);

  // Save as PNG
  const buffer = canvas.toBuffer('image/png');
  const publicPath = path.join(__dirname, 'public', `icon-${size}.png`);
  fs.writeFileSync(publicPath, buffer);
  console.log(`✅ Generated icon-${size}.png`);
}

// Generate both sizes
try {
  generateIcon(192);
  generateIcon(512);
  console.log('🎉 All icons generated successfully!');
} catch (error) {
  console.error('❌ Error generating icons:', error.message);
  console.log('\n⚠️  canvas module not installed. Install it with:');
  console.log('npm install canvas');
  process.exit(1);
}

