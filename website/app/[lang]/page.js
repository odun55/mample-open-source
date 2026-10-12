import Link from 'next/link';
import SiteNav from '../../components/SiteNav';
import styles from '../page.module.css';
import { getDictionary } from '../../getDictionary';
import HeroTitle from '../../components/HeroTitle';
import TerminalDemo from '../../components/TerminalDemo';
import { aiDemo } from '../../lib/aiDemo';
import DownloadActions from '../../components/DownloadActions';
import SupportButton from '../../components/SupportButton';
import { githubUrl } from '../../lib/projectLinks';
import { siteUrl } from '../../lib/siteUrl';

export async function generateMetadata(props) {
  const params = await props.params;
  const lang = params.lang || 'en';

  return {
    alternates: {
      canonical: `/${lang}`,
      languages: {
        'en': '/en',
        'tr': '/tr',
        'x-default': '/en',
      },
    },
  };
}

export default async function Home(props) {
  const params = await props.params;
  const lang = params.lang || 'en';
  const t = await getDictionary(lang);
  const [extensionDescriptionBefore, extensionDescriptionAfter] = t.extension_preview_desc.split('{extension}');
  const supportUrl = process.env.NEXT_PUBLIC_SUPPORT_URL ?? 'https://buymeacoffee.com/mample';
  let validSupportUrl = false;
  try {
    const parsed = new URL(supportUrl);
    validSupportUrl = parsed.protocol === 'https:' &&
      ['buymeacoffee.com', 'www.buymeacoffee.com', 'patreon.com', 'www.patreon.com'].includes(parsed.hostname) &&
      parsed.pathname !== '/' && !parsed.username && !parsed.password;
  } catch {}
  const softwareJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Mample',
    operatingSystem: 'Windows, macOS, Linux, Android',
    applicationCategory: 'DeveloperApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description: t.about_desc ? t.about_desc.replace(/<\/?[^>]+(>|$)/g, "") : "",
    url: `${siteUrl}/${lang}`,
  };

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Mample',
    url: `${siteUrl}/${lang}`,
    logo: `${siteUrl}/images/logo.png`,
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: t.guide_faq_q1, acceptedAnswer: { '@type': 'Answer', text: t.guide_faq_a1 } },
      { '@type': 'Question', name: t.guide_faq_q2, acceptedAnswer: { '@type': 'Answer', text: t.guide_faq_a2 } },
      { '@type': 'Question', name: t.guide_faq_q3, acceptedAnswer: { '@type': 'Answer', text: t.guide_faq_a3 } },
      { '@type': 'Question', name: t.guide_faq_q4, acceptedAnswer: { '@type': 'Answer', text: t.guide_faq_a4 } },
      { '@type': 'Question', name: t.guide_faq_q5, acceptedAnswer: { '@type': 'Answer', text: t.guide_faq_a5 } },
      { '@type': 'Question', name: t.guide_faq_q6, acceptedAnswer: { '@type': 'Answer', text: t.guide_faq_a6 } },
      { '@type': 'Question', name: t.guide_faq_q7, acceptedAnswer: { '@type': 'Answer', text: t.guide_faq_a7 } }
    ]
  };

  return (
    <div className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <SiteNav lang={lang} t={t} />

      <main className={styles.main}>

        {/* Hero Section */}
        <section className={`${styles.section} ${styles.heroSection}`} id="hero">
          <div className={styles.hero}>
            <div className={styles.heroContent}>
              <HeroTitle lang={lang} />
              <p>{t.hero_desc}</p>
              <DownloadActions lang={lang} t={t} />
            </div>
            <div className={styles.heroVisual}>


              <div className={styles.heroPhoneMockup}>
                <div className={styles.heroPhoneNotch}></div>
                <div className={styles.heroPhoneTime}>09:41</div>
                <div className={styles.heroPhoneIcons}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M2 22h20V2z"/></svg>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12.01 21.49L23.64 7c-.45-.34-4.93-4-11.64-4C5.28 3 .81 6.66.36 7l11.63 14.49.01.01.01-.01z"/></svg>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z"/></svg>
                </div>

                <div className={`${styles.mockNotification} ${styles.n1}`}>
                  <div className={styles.notifHeader}>
                    <div className={styles.notifIcon}>
                      <img src="/images/logo.png" alt="Mample Logo" width={24} height={24} />
                    </div>
                    <div className={styles.notifTitle}>Mample</div>
                    <div className={styles.notifTime}>{t.notif_now}</div>
                  </div>
                  <div className={styles.notifBody}>
                    {t.notif_1_body}
                  </div>

                  
                </div>

                <div className={`${styles.mockNotification} ${styles.n2}`}>
                  <div className={styles.notifHeader}>
                    <div className={styles.notifIcon}>
                      <img src="/images/logo.png" alt="Mample Logo" width={24} height={24} />
                    </div>
                    <div className={styles.notifTitle}>Mample</div>
                    <div className={styles.notifTime}>{t.notif_1min}</div>
                  </div>
                  <div className={styles.notifBody}>
                    {t.notif_2_body}
                  </div>


                </div>

                <div className={`${styles.mockNotification} ${styles.n3}`}>
                  <div className={styles.notifHeader}>
                    <div className={styles.notifIcon}>
                      <img src="/images/logo.png" alt="Mample Logo" width={24} height={24} />
                    </div>
                    <div className={styles.notifTitle}>Mample</div>
                    <div className={styles.notifTime}>{t.notif_3min}</div>
                  </div>
                  <div className={styles.notifBody}>
                    {t.notif_3_body}
                  </div>


                </div>

                <div className={`${styles.mockNotification} ${styles.n4}`}>
                  <div className={styles.notifHeader}>
                    <div className={styles.notifIcon}>
                      <img src="/images/logo.png" alt="Mample Logo" width={24} height={24} />
                    </div>
                    <div className={styles.notifTitle}>Mample</div>
                    <div className={styles.notifTime}>{t.notif_5min}</div>
                  </div>
                  <div className={styles.notifBody}>
                    {t.notif_4_body}
                  </div>


                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mample Nedir? & Güvenlik Section */}
        <section className={styles.aboutSection} id="neden-mample">
          <div className={styles.aboutContent}>
            <h2>{t.about_title}</h2>
            <p className={styles.aboutDesc} dangerouslySetInnerHTML={{ __html: t.about_desc }} />
          </div>
        </section>

        {/* How It Works Section */}
        <section className={`${styles.section} ${styles.workflowSection}`} id="nasil-calisir">
          
          {/* Bölüm 2: Terminal (CLI) */}
          <div id="terminal" className={styles.workflowBlock}>
            <h3 className={styles.subSectionTitle} style={{ marginTop: 0 }}>{t.how_2_title}</h3>
            <p className={styles.workflowIntro}>{t.terminal_use_case_intro}</p>
            <TerminalDemo lang={lang} steps={[
              { title: t.hw_2_card1_title, description: <>{t.hw_2_card1_desc_1}<code style={{ backgroundColor: '#000', padding: '2px 6px', borderRadius: '4px' }}>npm install -g mample</code>{t.hw_2_card1_desc_2}</> },
              { title: t.hw_2_card2_title, description: <>{t.hw_2_card2_desc_1}<code style={{ backgroundColor: '#000', padding: '2px 6px', borderRadius: '4px' }}>mample auth qr</code>{t.hw_2_card2_desc_2}<code style={{ backgroundColor: '#000', padding: '2px 6px', borderRadius: '4px' }}>mample auth "secret_key"</code>{t.hw_2_card2_desc_3}</> },
              { title: t.hw_2_card3_title, description: <>{t.hw_2_card3_desc_1}<code style={{ backgroundColor: '#000', padding: '2px 6px', borderRadius: '4px' }}>{t.hw_2_card3_code_inline}</code>{t.hw_2_card3_desc_2}<a href={`/${lang}/guide#cli-command-completion`}>{t.hw_2_terminal_examples_link}</a>{t.hw_2_card3_desc_3}</> },
            ]} />
          </div>

          {/* Bölüm 3: Yapay Zeka Asistanları */}
          <div id="ide" className={styles.workflowBlock}>
            <h3 className={styles.subSectionTitle} style={{ marginTop: 0 }}>{t.how_3_title}</h3>
            <p className={styles.workflowIntro}>{t.ai_use_case_intro}</p>
            <TerminalDemo lang={lang} media={aiDemo} title={t.hw_3_card1_title}
              steps={[
                { title: t.hw_3_setup_title, description: t.hw_3_setup_desc },
                { title: t.hw_3_card1_title, description: t.hw_3_card1_desc },
              ]} />
            <div className={styles.guideAction}>
              <Link href={`/${lang}/guide`} className={styles.primaryBtn}>
                {t.guide_button_text}
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className={styles.section} id="sss">
          <div className={styles.freeBox}>
            <h2 className={styles.sectionTitle}>{t.guide_faq_title || 'Frequently Asked Questions'}</h2>
            <style dangerouslySetInnerHTML={{
              __html: `
              details > summary {
                list-style: none;
                cursor: pointer;
                padding: 16px;
                background-color: var(--card-bg, #1E1E20);
                border-radius: 8px;
                border: 1px solid var(--border, rgba(255,255,255,0.05));
                display: flex;
                align-items: center;
                gap: 12px;
                font-size: 16px;
                font-weight: 500;
                transition: background-color 0.2s;
              }
              details > summary:hover {
                background-color: rgba(255,255,255,0.05);
              }
              details > summary::before {
                content: '+';
                color: #88D49E;
                font-weight: bold;
                font-size: 20px;
                width: 20px;
                text-align: center;
              }
              details[open] > summary::before {
                content: '-';
              }
              details > summary::-webkit-details-marker {
                display: none;
              }
              details > div {
                padding: 16px;
                padding-left: 48px;
                color: var(--text-muted, #A1A1AA);
                line-height: 1.6;
                background-color: rgba(0,0,0,0.2);
                border-radius: 0 0 8px 8px;
                margin-top: -4px;
                border: 1px solid var(--border, rgba(255,255,255,0.05));
                border-top: none;
              }
            `}} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left', width: '100%' }}>

              <details style={{ width: '100%' }}>
                <summary>{t.guide_faq_q1}</summary>
                <div>{t.guide_faq_a1}</div>
              </details>
              <details style={{ width: '100%' }}>
                <summary>{t.guide_faq_q2}</summary>
                <div dangerouslySetInnerHTML={{ __html: t.guide_faq_a2 }} />
              </details>
              <details style={{ width: '100%' }}>
                <summary>{t.guide_faq_q3}</summary>
                <div>{t.guide_faq_a3}</div>
              </details>
              <details style={{ width: '100%' }}>
                <summary>{t.guide_faq_q4}</summary>
                <div>{t.guide_faq_a4}</div>
              </details>
              <details style={{ width: '100%' }}>
                <summary>{t.guide_faq_q5}</summary>
                <div>{t.guide_faq_a5}</div>
              </details>
              <details style={{ width: '100%' }}>
                <summary>{t.guide_faq_q6}</summary>
                <div>
                  <p>{t.guide_faq_a6}</p>
                </div>
              </details>
              <details style={{ width: '100%' }}>
                <summary>{t.guide_faq_q7}</summary>
                <div dangerouslySetInnerHTML={{ __html: t.guide_faq_a7 }} />
              </details>
            </div>
          </div>
        </section>

        <section className={styles.supportSection} id="support" aria-labelledby="support-title">
          <span id="free" className={styles.supportAnchor} aria-hidden="true" />
          <div className={styles.supportPanel}>
            <div className={styles.supportCopy}>
              <span className={styles.supportEyebrow}>{t.support_eyebrow}</span>
              <h2 id="support-title">{t.support_title}</h2>
              <p>{t.support_desc}</p>
              <p className={styles.supportNote}>{t.support_note}</p>
            </div>
            <div className={styles.supportActions}>
              {validSupportUrl && (
                <SupportButton url={supportUrl} label={t.support_button} />
              )}
              <span className={styles.supportCaption}>{t.support_caption}</span>
            </div>
          </div>
        </section>

        <section className={styles.extensionPreview} aria-labelledby="extension-preview-title">
          <div>
            <h2 id="extension-preview-title">{t.extension_preview_title}</h2>
            <p>
              {extensionDescriptionBefore}
              <Link href={`/${lang}/extension`} className={styles.extensionPreviewLink}>Mample Extension</Link>
              {extensionDescriptionAfter}
            </p>
          </div>
        </section>

        <footer className={styles.siteFooter}>
          <div className={styles.footerBrand}>
            <Link href={`/${lang}`}>Mample</Link>
            <p>{t.footer_description}</p>
          </div>
          <nav className={styles.footerLinks} aria-label={t.footer_navigation}>
            <Link href={`/${lang}/guide`}>{t.nav_guide}</Link>
            <Link href={`/${lang}/extension`}>Mample Extension</Link>
            <a href="#sss">{t.footer_faq}</a>
            <a href={githubUrl} target="_blank" rel="noopener noreferrer">GitHub</a>
            <Link href={`/${lang}/privacy`}>{t.privacy_policy}</Link>
            <Link href={`/${lang}/terms`}>{t.terms_of_use}</Link>
            <a href="mailto:odun.coop@gmail.com">{t.contact_us}</a>
          </nav>
          <p className={styles.footerLegal}>© {new Date().getFullYear()} Mample · MIT</p>
        </footer>

      </main>
    </div>
  );
}
