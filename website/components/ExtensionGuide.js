import styles from '../app/[lang]/guide/guide.module.css';
export default function ExtensionGuide({ t }) {
return (
      
      <section className={styles.section} id="browser-extension">
        <h2 className={styles.sectionTitle}>{t.guide_sec2_title}</h2>
        
        <div className={styles.subSection} id="browser-download">
          <h3 className={styles.subSectionTitle}>{t.guide_sec2_sub0_title}</h3>
          <p className={styles.subSectionDesc} dangerouslySetInnerHTML={{ __html: t.guide_sec2_sub0_desc }} />
        </div>

        <div className={styles.subSection} id="browser-pairing">
          <h3 className={styles.subSectionTitle}>{t.guide_sec2_sub1_title}</h3>
          <p className={styles.subSectionDesc} dangerouslySetInnerHTML={{ __html: t.guide_sec2_sub1_desc }} />
        </div>

        <div className={styles.subSection} id="browser-custom-key">
          <h3 className={styles.subSectionTitle}>{t.guide_sec2_sub2_title}</h3>
          <p className={styles.subSectionDesc} dangerouslySetInnerHTML={{ __html: t.guide_sec2_sub2_desc }} />
        </div>

        <div className={styles.subSection} id="browser-downloads">
          <h3 className={styles.subSectionTitle}>{t.guide_sec2_sub5_title}</h3>
          <p className={styles.subSectionDesc} dangerouslySetInnerHTML={{ __html: t.guide_sec2_sub5_desc }} />
        </div>
      </section>


);
}
