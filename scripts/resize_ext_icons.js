const sharp = require('sharp');

async function processIcons() {
  const input = 'mample_app/assets/images/rounded_icon.png';
  
  await sharp(input).resize(16, 16).toFile('chrome-extension/icons/icon-16.png');
  await sharp(input).resize(48, 48).toFile('chrome-extension/icons/icon-48.png');
  await sharp(input).resize(128, 128).toFile('chrome-extension/icons/icon-128.png');
  
  console.log('Chrome extension icons updated.');
}

processIcons().catch(console.error);
