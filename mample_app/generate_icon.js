const sharp = require('sharp');
const fs = require('fs');

async function generate() {
  try {
    const svgContent = fs.readFileSync('../website/public/images/logo.svg', 'utf8');
    
    // We want the app icon to not have transparent rounded corners, so we will replace rx="284" with rx="0" to make the outer box square
    // For iOS and Android adaptive icons, a square is required.
    const modifiedSvg = svgContent.replace('rx="284"', 'rx="0"');
    
    await sharp(Buffer.from(modifiedSvg))
      .resize(1024, 1024)
      .png()
      .toFile('assets/images/app_icon.png');
      
    console.log('Successfully generated app_icon.png');
  } catch (err) {
    console.error('Error:', err);
  }
}

generate();
