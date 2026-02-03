const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Create a Letreco app icon - 2x2 grid of tiles like the game
function generateIcon(size, outputPath) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background - dark theme matching the app
  ctx.fillStyle = '#1d232a';
  ctx.fillRect(0, 0, size, size);
  
  // Tile size and positioning for 2x2 grid
  const padding = size * 0.1;
  const tileGap = size * 0.03;
  const tileSize = (size - padding * 2 - tileGap) / 2;
  
  // Colors matching Wordle/Letreco
  const colors = {
    correct: '#538d4e',   // Green
    present: '#b59f3b',   // Yellow
    absent: '#3a3a3c',    // Dark gray
  };
  
  // Draw 4 tiles in a 2x2 grid representing LETR
  const tiles = [
    { letter: 'L', color: colors.correct, x: 0, y: 0 },
    { letter: 'E', color: colors.present, x: 1, y: 0 },
    { letter: 'T', color: colors.absent, x: 0, y: 1 },
    { letter: 'R', color: colors.correct, x: 1, y: 1 },
  ];
  
  const cornerRadius = size * 0.05;
  
  tiles.forEach(tile => {
    const x = padding + tile.x * (tileSize + tileGap);
    const y = padding + tile.y * (tileSize + tileGap);
    
    // Draw rounded rectangle tile
    ctx.fillStyle = tile.color;
    ctx.beginPath();
    ctx.roundRect(x, y, tileSize, tileSize, cornerRadius);
    ctx.fill();
    
    // Draw letter
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${tileSize * 0.65}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tile.letter, x + tileSize / 2, y + tileSize / 2 + size * 0.02);
  });
  
  // Save the image
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`Created ${outputPath} (${size}x${size})`);
}

// Generate all required sizes
const publicDir = path.join(__dirname, '..', 'public');

generateIcon(512, path.join(publicDir, 'icon-512.png'));
generateIcon(192, path.join(publicDir, 'icon-192.png'));
generateIcon(180, path.join(publicDir, 'apple-touch-icon.png'));
generateIcon(48, path.join(publicDir, 'favicon-48.png'));

console.log('All icons generated!');
