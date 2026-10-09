const sharp = require('sharp');
const fs = require('fs');

async function generate() {
  try {
    const svgContent = fs.readFileSync('../website/public/images/logo.svg', 'utf8');
    
    // Generate rounded icon with transparency
    await sharp(Buffer.from(svgContent))
      .resize(1024, 1024)
      .png()
      .toFile('assets/images/rounded_icon.png');
      
    console.log('Successfully generated rounded_icon.png');
  } catch (err) {
    console.error('Error:', err);
  }
}

generate();
