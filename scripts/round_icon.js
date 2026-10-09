const sharp = require('sharp');

async function processIcon() {
  const input = 'mample_app/assets/images/new_icon.png';
  const output = 'mample_app/assets/images/rounded_icon.png';
  
  const metadata = await sharp(input).metadata();
  const width = metadata.width;
  const height = metadata.height;
  
  // 22% corner radius
  const rx = Math.round(width * 0.22);
  
  const svg = `<svg><rect x="0" y="0" width="${width}" height="${height}" rx="${rx}" ry="${rx}" /></svg>`;
  
  const roundedCorners = Buffer.from(svg);
  
  await sharp(input)
    .composite([{
      input: roundedCorners,
      blend: 'dest-in'
    }])
    .png()
    .toFile(output);
    
  console.log('Rounded icon generated at ' + output);
}

processIcon().catch(console.error);
