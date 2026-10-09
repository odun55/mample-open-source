import SiteNav from '../../../components/SiteNav';
import ExtensionDemo from '../../../components/ExtensionDemo';
import ExtensionGuide from '../../../components/ExtensionGuide';
import { getDictionary } from '../../../getDictionary';
import styles from '../guide/guide.module.css';
import ui from '../../page.module.css';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const t = await getDictionary(lang);
  return { title: t.extension_title, description: t.extension_desc,
    alternates: { canonical: '/' + lang + '/extension',
      languages: { en: '/en/extension', tr: '/tr/extension', 'x-default': '/en/extension' } },
    openGraph: { title: t.extension_title, description: t.extension_desc,
      url: 'https://mample.vercel.app/' + lang + '/extension' },
  };
}
export default async function ExtensionPage({ params }) {
  const { lang } = await params;
  const t = await getDictionary(lang);
  return (
    <>
      <SiteNav lang={lang} t={t} current="extension" />
      <div className={styles.pageWrapper}>
        <aside className={styles.sidebar}>
          <a href="#stores" className={styles.tocTitle}>{t.extension_stores}</a>
          <a href="#browser-pairing" className={styles.tocSubItem}>{t.guide_sec2_sub1_title}</a>
          <a href="#browser-custom-key" className={styles.tocSubItem}>{t.guide_sec2_sub2_title}</a>
          <a href="#browser-downloads" className={styles.tocSubItem}>{t.guide_sec2_sub5_title}</a>
          <a href="#extension-background" className={styles.tocSubItem}>{t.extension_background_title}</a>
        </aside>
        <main className={styles.container}>
          <header className={styles.header}>
            <span className={ui.releaseBadge}>{t.extension_badge}</span>
            <h1 className={styles.title}>{t.extension_title}</h1>
            <p className={styles.description}>{t.extension_desc}</p>
          </header>
          <ExtensionDemo t={t} />
          <div className={ui.releaseNote}>{t.extension_status}</div>
          <section className={styles.section} id="stores">
            <h2 className={styles.sectionTitle}>{t.extension_stores}</h2>
            <p className={styles.subSectionDesc}>{t.extension_store_note}</p>
            <div className={ui.storeLinks}>
              <a href="https://chromewebstore.google.com/detail/mample/hchafammpojjehdbmjefhkdoljhcnibi" target="_blank" rel="noopener noreferrer">Chrome Web Store ↗</a>
            </div>
            <p className={styles.subSectionDesc}>{t.supported_browsers}</p>
          </section>
          <ExtensionGuide t={t} />
          <section className={styles.section} id="extension-background">
            <h2 className={styles.sectionTitle}>{t.extension_background_title}</h2>
            <p className={styles.subSectionDesc}>{t.extension_background_desc}</p>
          </section>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t.guide_sec0_li1_title}</h2>
            <p className={styles.subSectionDesc} dangerouslySetInnerHTML={{ __html: t.guide_sec0_li1_desc }} />
          </section>
        </main>
      </div>
    </>
  );
}
