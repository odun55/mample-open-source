const fs = require('fs');
const file = 'd:/kodlama/projeler/Mample/website/app/[lang]/page.js';
let content = fs.readFileSync(file, 'utf8');
let lines = content.split('\n');

const newImport = 'import InteractiveGif from "../../components/InteractiveGif";';
lines.splice(4, 0, newImport);

let sIdx = lines.findIndex(l => l.includes('{/* Bölüm 1: Chrome Eklentisi */}'));
if (sIdx !== -1) {
  let gridStart = sIdx + 2; 
  let gridEnd = lines.findIndex((l, i) => i > gridStart && l.includes('</div>') && lines[i+2] && lines[i+2].includes('{/* Bölüm 2: Terminal (CLI) */}'));
  
  if (gridStart !== -1 && gridEnd !== -1) {
    const replacement = [
      '          <InteractiveGif ',
      '            text1Title={t.hw_1_card_title} ',
      '            text1Desc={t.hw_1_card_desc} ',
      '            text2Title={t.hw_1_card2_title} ',
      '            text2Desc={t.hw_1_card2_desc} ',
      '          />'
    ];
    lines.splice(gridStart, gridEnd - gridStart + 1, ...replacement);
    fs.writeFileSync(file, lines.join('\n'));
    console.log('Successfully replaced lines!');
  } else {
    console.log('Could not find grid boundaries');
  }
} else {
  console.log('Could not find section comment');
}
