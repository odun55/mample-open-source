const fs = require('fs');
const file = 'd:/kodlama/projeler/Mample/website/app/[lang]/page.js';
let content = fs.readFileSync(file, 'utf8');

const importStmt = "import SingleGifBlock from '../../components/SingleGifBlock';\n";
if (!content.includes('SingleGifBlock')) {
  // Insert import at the top
  content = content.replace("import InteractiveGif from '../../components/InteractiveGif';", "import InteractiveGif from '../../components/InteractiveGif';\n" + importStmt);
}

// Use regex to replace the entire Terminal section grid
const regex = /({\/\* Bölüm 2: Terminal \(CLI\) \*\/}[\s\S]*?<h3[^>]*>.*?<\/h3>)\s*<div className=\{styles\.guideGrid\}>[\s\S]*?<\/div>\s*(?={\/\* Bölüm 3: Yapay Zeka Asistanları \*\/})/;

const replacement = `$1
          <SingleGifBlock 
            reverse={true}
            text1Title={t.hw_2_card1_title} 
            text1Desc={<>{t.hw_2_card1_desc_1}<code style={{ backgroundColor: '#000', padding: '2px 6px', borderRadius: '4px' }}>npm install -g mample</code>{t.hw_2_card1_desc_2}</>} 
            text2Title={t.hw_2_card2_title} 
            text2Desc={<>{t.hw_2_card2_desc_1}<code style={{ backgroundColor: '#000', padding: '2px 6px', borderRadius: '4px' }}>mample auth "secret_key"</code>{t.hw_2_card2_desc_2}</>} 
            text3Title={t.hw_2_card3_title} 
            text3Desc={<>{t.hw_2_card3_desc_1}<code style={{ backgroundColor: '#000', padding: '2px 6px', borderRadius: '4px' }}>{t.hw_2_card3_code_inline}</code>{t.hw_2_card3_desc_2}<code style={{ backgroundColor: '#000', padding: '2px 6px', borderRadius: '4px' }}>{t.hw_2_card3_code_inline_2}</code>{t.hw_2_card3_desc_3}</>} 
          />

          `;

content = content.replace(regex, replacement);
fs.writeFileSync(file, content);
console.log('Successfully replaced Terminal section lines using regex!');
