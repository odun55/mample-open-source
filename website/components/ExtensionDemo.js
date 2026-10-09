import styles from '../app/page.module.css';
import InteractiveGif from './InteractiveGif';
export default function ExtensionDemo({ t }) {
  return (
          
          <div id="web" style={{ paddingTop: '100px' }}>
            <h3 className={styles.subSectionTitle} style={{ marginTop: 0 }}>{t.how_1_title}</h3>
            <InteractiveGif 
              startIndex={1}
              text1Title={t.hw_1_card_title} 
              text1Desc={t.hw_1_card_desc} 
              text2Title={t.hw_1_card2_title} 
              text2Desc={t.hw_1_card2_desc} 
              text3Title={t.hw_1_card3_title} 
              text3Desc={t.hw_1_card3_desc} 
            />
          </div>


  );
}
