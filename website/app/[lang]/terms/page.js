import SiteNav from '../../../components/SiteNav';
import { getDictionary } from '../../../getDictionary';
import styles from '../guide/guide.module.css';


export async function generateMetadata(props) {
  const params = await props.params;
  const lang = params.lang || 'en';
  const t = await getDictionary(lang);
  
  return {
    title: t.terms_page_title || 'Terms of Service',
    description: lang === 'tr' ? 'Mample hizmet şartları ve kullanım koşulları.' : 'Terms of service and usage conditions for Mample.',
    alternates: {
      canonical: `/${lang}/terms`,
      languages: {
        'en': '/en/terms',
        'tr': '/tr/terms',
        'x-default': '/en/terms',
      },
    },
  };
}

export default async function Terms({ params }) {
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
        name: t.terms_page_title || 'Terms of Service',
        item: `https://mample.vercel.app/${lang}/terms`
      }
    ]
  };

  return (
    <>
    <SiteNav lang={lang} t={t} current="terms" />
    <div className={styles.pageWrapper}>
      <aside className={styles.sidebar}>
        <div className={styles.tocSection}>
          <a href="#top" className={styles.tocMainTitle}>{t.terms_page_title}</a>
          <a href="#terms-1" className={styles.tocSubItem}>{t.terms_1_title}</a>
          <a href="#terms-2" className={styles.tocSubItem}>{t.terms_2_title}</a>
          <a href="#terms-3" className={styles.tocSubItem}>{t.terms_3_title}</a>
        </div>
      </aside>

      <main className={styles.container}>
        <div style={{ maxWidth: '800px', width: '100%', display: 'flex', flexDirection: 'column', gap: '48px' }}>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
          />

          <header className={styles.header} id="top">
            <h1 className={styles.title}>{t.terms_page_title}</h1>
          </header>

        <section id="terms-1" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#FFFFFF' }}>{t.terms_1_title}</h2>
          <p style={{ color: '#A1A1AA', fontSize: '16px', lineHeight: '1.6' }}>{t.terms_1_desc}</p>
        </section>

        <section id="terms-2" style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#FFFFFF' }}>{t.terms_2_title}</h2>
          <p style={{ color: '#A1A1AA', fontSize: '16px', lineHeight: '1.6' }}>{t.terms_2_desc}</p>
          <ul style={{ color: '#A1A1AA', fontSize: '16px', lineHeight: '1.6', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li>{t.terms_2_li1}</li>
            <li>{t.terms_2_li2}</li>
          </ul>
        </section>

        <section id="terms-3" style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#FFFFFF' }}>{t.terms_3_title}</h2>
          <p style={{ color: '#A1A1AA', fontSize: '16px', lineHeight: '1.6' }}>{t.terms_3_desc}</p>
        </section>
      </div>
      </main>
    </div>
    </>
  );
}
