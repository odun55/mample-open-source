const fs = require('fs');
const file = 'd:/kodlama/projeler/Mample/website/app/[lang]/page.js';
let content = fs.readFileSync(file, 'utf8');

const regex = /({\/\* Bölüm 3: Yapay Zeka Asistanları \*\/}[\s\S]*?<h3[^>]*>.*?<\/h3>)\s*<div className=\{styles\.guideGrid\}>[\s\S]*?<\/div>\s*<\/section>/;

const replacement = `$1
          <InteractiveGif 
            reverse={false}
            text1Title={t.hw_3_card1_title} 
            text1Desc={t.hw_3_card1_desc} 
            text2Title={t.hw_3_card2_title} 
            text2Desc={t.hw_3_card2_desc} 
            text3Title={t.hw_3_card3_title} 
            text3Desc={t.hw_3_card3_desc} 
          />
        </section>`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync(file, content);
  console.log('Successfully replaced Section 3 lines using regex!');
} else {
  console.log('Regex did not match Section 3');
}
