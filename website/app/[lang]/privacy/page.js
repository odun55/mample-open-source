import SiteNav from '../../../components/SiteNav';
import { getDictionary } from '../../../getDictionary';
import styles from '../guide/guide.module.css';


export async function generateMetadata(props) {
  const params = await props.params;
  const lang = params.lang || 'en';
  const t = await getDictionary(lang);
  
  return {
    title: t.privacy_page_title || 'Privacy Policy',
    description: lang === 'tr' ? 'Mample gizlilik politikası ve veri güvenliği detayları.' : 'Mample privacy policy and data security details.',
    alternates: {
      canonical: `/${lang}/privacy`,
      languages: {
        'en': '/en/privacy',
        'tr': '/tr/privacy',
        'x-default': '/en/privacy',
      },
    },
  };
}

export default async function Privacy({ params }) {
  const { lang } = await params;
  const t = await getDictionary(lang);

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `https://mample.vercel.app/${lang}`
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: t.privacy_page_title || 'Privacy Policy',
        item: `https://mample.vercel.app/${lang}/privacy`
      }
    ]
  };

  return (
    <>
    <SiteNav lang={lang} t={t} current="privacy" />
    <div className={styles.pageWrapper}>
      <aside className={styles.sidebar}>
        <div className={styles.tocSection}>
          <a href="#top" className={styles.tocMainTitle}>{t.privacy_page_title}</a>
          <a href="#privacy-1" className={styles.tocSubItem}>{t.privacy_1_title}</a>
          <a href="#privacy-2" className={styles.tocSubItem}>{t.privacy_2_title}</a>
          <a href="#privacy-3" className={styles.tocSubItem}>{t.privacy_3_title}</a>
          <a href="#privacy-4" className={styles.tocSubItem}>{t.privacy_4_title}</a>
          <a href="#privacy-5" className={styles.tocSubItem}>{t.privacy_5_title}</a>
          <a href="#privacy-6" className={styles.tocSubItem}>{t.privacy_6_title}</a>
          <a href="#privacy-7" className={styles.tocSubItem}>{t.privacy_7_title}</a>
        </div>
      </aside>

      <main className={styles.container}>
        <div style={{ maxWidth: '800px', width: '100%', display: 'flex', flexDirection: 'column', gap: '48px' }}>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
          />

          <header className={styles.header} id="top">
            <h1 className={styles.title}>{t.privacy_page_title}</h1>
          </header>

        <section id="privacy-1" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#FFFFFF' }}>{t.privacy_1_title}</h2>
          <p style={{ color: '#A1A1AA', fontSize: '16px', lineHeight: '1.6' }}>{t.privacy_1_p1}</p>
          <ul style={{ color: '#A1A1AA', fontSize: '16px', lineHeight: '1.6', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li>{t.privacy_1_li1}</li>
            <li>{t.privacy_1_li2}</li>
            <li>{t.privacy_1_li3}</li>
          </ul>
        </section>

        <section id="privacy-2" style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#FFFFFF' }}>{t.privacy_2_title}</h2>
          <p style={{ color: '#A1A1AA', fontSize: '16px', lineHeight: '1.6' }}>{t.privacy_2_desc}</p>
          {t.privacy_2_li1 && (
            <ul style={{ color: '#A1A1AA', fontSize: '16px', lineHeight: '1.6', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li>{t.privacy_2_li1}</li>
            </ul>
          )}
        </section>

        <section id="privacy-3" style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#FFFFFF' }}>{t.privacy_3_title}</h2>
          <p style={{ color: '#A1A1AA', fontSize: '16px', lineHeight: '1.6' }}>{t.privacy_3_desc}</p>
        </section>

        <section id="privacy-4" style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#FFFFFF' }}>{t.privacy_4_title}</h2>
          <p style={{ color: '#A1A1AA', fontSize: '16px', lineHeight: '1.6' }}>{t.privacy_4_desc}</p>
        </section>

        <section id="privacy-5" style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#FFFFFF' }}>{t.privacy_5_title}</h2>
          <p style={{ color: '#A1A1AA', fontSize: '16px', lineHeight: '1.6' }}>{t.privacy_5_desc}</p>
        </section>

        <section id="privacy-6" style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#FFFFFF' }}>{t.privacy_6_title}</h2>
          <p style={{ color: '#A1A1AA', fontSize: '16px', lineHeight: '1.6' }}>{t.privacy_6_desc}</p>
          <a href="mailto:odun.coop@gmail.com?subject=Mample%20data%20deletion%20request" style={{ color: '#88D49E' }}>odun.coop@gmail.com</a>
        </section>

        <section id="privacy-7" style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#FFFFFF' }}>{t.privacy_7_title}</h2>
          <p style={{ color: '#A1A1AA', fontSize: '16px', lineHeight: '1.6' }}>{t.privacy_7_desc}</p>
        </section>
      </div>
      </main>
    </div>
    </>
  );
}
