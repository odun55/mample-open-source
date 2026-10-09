const sharp = require('sharp');
async function getColor() {
  const input = 'mample_app/assets/images/new_icon.png';
  const { dominant } = await sharp(input).stats();
  console.log(`dominant: rgb(${dominant.r}, ${dominant.g}, ${dominant.b})`);
  // also get the top-left pixel color
  const buffer = await sharp(input).raw().toBuffer();
  const meta = await sharp(input).metadata();
  const r = buffer[0];
  const g = buffer[1];
  const b = buffer[2];
  const hex = '#' + [r,g,b].map(x => x.toString(16).padStart(2, '0')).join('');
  console.log('top-left hex:', hex);
}
getColor().catch(console.error);
