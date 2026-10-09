import Link from 'next/link';
import SiteNav from '../../components/SiteNav';
import styles from '../page.module.css';
import { getDictionary } from '../../getDictionary';
import HeroTitle from '../../components/HeroTitle';
import InteractiveGif from "../../components/InteractiveGif";

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
  const supportUrl = process.env.NEXT_PUBLIC_SUPPORT_URL || '';
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
    url: `https://mample.vercel.app/${lang}`,
  };

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Mample',
    url: `https://mample.vercel.app/${lang}`,
    logo: 'https://mample.vercel.app/images/logo.png',
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
              <div className={styles.ctas}>
                <a href="#iletisim" className={styles.primaryBtn} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{t.hero_download}</a>
              </div>
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
                  
                  {/* Left: Mini Browser (N1) */}
                  <div className={`${styles.miniBrowser} ${styles.sideLeft}`}>
                    <div className={styles.miniHeader}>
                      <span className={styles.dot} style={{backgroundColor: '#ff5f56'}}></span>
                      <span className={styles.dot} style={{backgroundColor: '#ffbd2e'}}></span>
                      <span className={styles.dot} style={{backgroundColor: '#27c93f'}}></span>
                    </div>
                    <div className={styles.miniBody}>
                      <div className={styles.miniSkeleton} style={{width: '60%'}}></div>
                      <div className={styles.miniSkeleton} style={{width: '80%'}}></div>
                      <div className={styles.miniSkeleton} style={{width: '40%'}}></div>
                    </div>
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

                  {/* Right: ZIP Icon Browser (N2) */}
                  <div className={`${styles.miniBrowser} ${styles.sideRight}`}>
                    <div className={styles.miniHeader}>
                      <span className={styles.dot} style={{backgroundColor: '#ff5f56'}}></span>
                      <span className={styles.dot} style={{backgroundColor: '#ffbd2e'}}></span>
                      <span className={styles.dot} style={{backgroundColor: '#27c93f'}}></span>
                    </div>
                    <div className={styles.miniBody} style={{ alignItems: 'center', justifyContent: 'center', height: '46px' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"/><polyline points="14 2 14 8 20 8"/><path d="M10 12v-2"/><path d="M10 16v-2"/><path d="M10 20v-2"/></svg>
                    </div>
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

                  {/* Left: Mini Terminal (N3) */}
                  <div className={`${styles.miniTerminal} ${styles.sideLeft}`}>
                    <div className={styles.miniHeaderDark}>
                      <span className={styles.dot} style={{backgroundColor: '#ff5f56'}}></span>
                      <span className={styles.dot} style={{backgroundColor: '#ffbd2e'}}></span>
                      <span className={styles.dot} style={{backgroundColor: '#27c93f'}}></span>
                    </div>
                    <div className={styles.miniBodyDark}>
                      <span style={{color: '#a1a1aa'}}>&gt; npm run build</span>
                      <span style={{color: '#88D49E'}}>&gt; Done.</span>
                    </div>
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

                  {/* Right: Mini IDE (N4) */}
                  <div className={`${styles.miniIDE} ${styles.sideRight}`}>
                    <div className={styles.miniHeaderDark}>
                      <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px'}}>IDE</span>
                    </div>
                    <div className={styles.miniBodyIDE}>
                      <div className={styles.ideSidebar}></div>
                      <div className={styles.ideCode}>
                        <div className={styles.miniSkeletonDark} style={{width: '60%', backgroundColor: '#c678dd'}}></div>
                        <div className={styles.miniSkeletonDark} style={{width: '80%', backgroundColor: '#98c379'}}></div>
                        <div className={styles.miniSkeletonDark} style={{width: '40%', backgroundColor: '#61afef'}}></div>
                      </div>
                    </div>
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
        <section className={styles.section} id="nasil-calisir" style={{ backgroundColor: 'var(--background)', paddingTop: '120px' }}>
          
          {/* Bölüm 2: Terminal (CLI) */}
          <div id="terminal" style={{ paddingTop: '100px' }}>
            <h3 className={styles.subSectionTitle} style={{ marginTop: 0 }}>{t.how_2_title}</h3>
            <InteractiveGif 
              startIndex={4}
              reverse={true}
              text1Title={t.hw_2_card1_title} 
              text1Desc={<>{t.hw_2_card1_desc_1}<code style={{ backgroundColor: '#000', padding: '2px 6px', borderRadius: '4px' }}>npm install -g mample</code>{t.hw_2_card1_desc_2}</>} 
              text2Title={t.hw_2_card2_title} 
              text2Desc={<>{t.hw_2_card2_desc_1}<code style={{ backgroundColor: '#000', padding: '2px 6px', borderRadius: '4px' }}>mample auth --qr</code>{t.hw_2_card2_desc_2}<code style={{ backgroundColor: '#000', padding: '2px 6px', borderRadius: '4px' }}>mample auth "secret_key"</code>{t.hw_2_card2_desc_3}</>}
              text3Title={t.hw_2_card3_title} 
              text3Desc={<>{t.hw_2_card3_desc_1}<code style={{ backgroundColor: '#000', padding: '2px 6px', borderRadius: '4px' }}>{t.hw_2_card3_code_inline}</code>{t.hw_2_card3_desc_2}<code style={{ backgroundColor: '#000', padding: '2px 6px', borderRadius: '4px' }}>{t.hw_2_card3_code_inline_2}</code>{t.hw_2_card3_desc_3}</>} 
            />
          </div>

          {/* Bölüm 3: Yapay Zeka Asistanları */}
          <div id="ide" style={{ paddingTop: '100px' }}>
            <h3 className={styles.subSectionTitle} style={{ marginTop: 0 }}>{t.how_3_title}</h3>
            <InteractiveGif 
              startIndex={7}
              reverse={false}
              text1Title={t.hw_3_card1_title} 
              text1Desc={t.hw_3_card1_desc} 
            />
            <div style={{ textAlign: 'center', marginTop: '60px' }}>
              <Link href={`/${lang}/guide`} className={styles.primaryBtn}>
                {t.guide_button_text}
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className={styles.section} id="sss" style={{ backgroundColor: 'var(--background)' }}>
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
                <div dangerouslySetInnerHTML={{ __html: t.guide_faq_a6 }} />
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
              {validSupportUrl ? (
                <a href={supportUrl} className={styles.supportPrimary} target="_blank" rel="noopener noreferrer">
                  {t.support_button}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10" /></svg>
                </a>
              ) : (
                <span className={styles.supportPending}>{t.support_pending}</span>
              )}
              <a href="mailto:odun.coop@gmail.com" className={styles.supportSecondary}>{t.support_feedback}</a>
              <span className={styles.supportCaption}>{t.support_caption}</span>
            </div>
          </div>
        </section>

        {/* Contact / Download Section */}
        <footer className={styles.section} id="iletisim" style={{ minHeight: 'auto', padding: '100px 20px' }}>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px', gap: '16px' }}>
            <p style={{ color: 'var(--text)', fontSize: '18px', fontWeight: '500', margin: 0, textAlign: 'center' }}>
              {lang === 'tr' ? 'Uygulama çıktığında haberdar olmak ister misiniz?' : 'Want to be notified when it\'s released?'}
            </p>
            <a
              href={`https://mail.google.com/mail/?view=cm&fs=1&to=odun.coop@gmail.com&su=${encodeURIComponent(lang === 'tr' ? 'Mample yayınlandığında haberdar olmak istiyorum' : 'I want to be notified when Mample is released')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                backgroundColor: 'var(--primary, #0070f3)',
                color: 'white',
                textDecoration: 'none',
                fontWeight: 'bold',
                display: 'inline-block'
              }}
            >
              {lang === 'tr' ? 'Bize E-posta Gönderin' : 'Send Us an Email'}
            </a>
          </div>

          <div className={styles.contactBox} style={{ position: 'relative', overflow: 'hidden' }}>

            {/* SOON Overlay */}
            <div style={{
              position: 'absolute',
              inset: 0,
              zIndex: 50,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(15, 15, 20, 0.4)',
              backdropFilter: 'blur(1px)'
            }}>
              <span style={{
                transform: 'rotate(-20deg)',
                fontSize: 'clamp(5rem, 12vw, 10rem)',
                fontWeight: '900',
                color: 'rgba(255, 255, 255, 0.3)',
                letterSpacing: '0.15em',
                userSelect: 'none',
                pointerEvents: 'none'
              }}>
                SOON
              </span>
            </div>

            <h2 className={styles.sectionTitle}>{t.contact_title}</h2>

            <div className={styles.ctas} style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <span style={{ color: 'var(--text)', fontWeight: '500', fontSize: '16px' }}>{t.chrome_ext_for}</span>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>

                  <div style={{ position: 'relative' }}>
                    <a href="https://chromewebstore.google.com/detail/mample/hchafammpojjehdbmjefhkdoljhcnibi" target="_blank" rel="noopener noreferrer" title="Chrome Store" aria-label="Chrome Store" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', textDecoration: 'none', border: '2px solid var(--primary)', transition: 'all 0.2s' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C8.21 0 4.831 1.757 2.632 4.501l3.953 6.848A5.454 5.454 0 0 1 12 6.545h10.691A12 12 0 0 0 12 0zM1.931 5.47A11.943 11.943 0 0 0 0 12c0 6.012 4.42 10.991 10.189 11.864l3.953-6.847a5.45 5.45 0 0 1-6.865-2.29zm13.342 2.166a5.446 5.446 0 0 1 1.45 7.09l.002.001h-.002l-5.344 9.257c.206.01.413.016.621.016 6.627 0 12-5.373 12-12 0-1.54-.29-3.011-.818-4.364zM12 16.364a4.364 4.364 0 1 1 0-8.728 4.364 4.364 0 0 1 0 8.728Z" /></svg>
                    </a>
                    <div style={{ position: 'absolute', top: '-6px', right: '-6px', color: 'var(--text)', fontWeight: 'bold', fontSize: '20px', lineHeight: 1 }}>
                      *
                    </div>
                  </div>

                  {/* Mac App Store (Inactive) */}
                  <button title="Mac App Store" aria-label="Mac App Store" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'transparent', color: '#666', border: '2px solid transparent', cursor: 'not-allowed', padding: 0 }} disabled>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" /></svg>
                  </button>

                  {/* Firefox (Active) */}
                  <a href="#" target="_blank" rel="noopener noreferrer" title="Mozilla Firefox" aria-label="Mozilla Firefox" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', textDecoration: 'none', border: '2px solid var(--primary)', transition: 'all 0.2s' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.452 3.445a11.002 11.002 0 00-2.482-1.908C16.944.997 15.098.093 12.477.032c-.734-.017-1.457.03-2.174.144-.72.114-1.398.292-2.118.56-1.017.377-1.996.975-2.574 1.554.583-.349 1.476-.733 2.55-.992a10.083 10.083 0 013.729-.167c2.341.34 4.178 1.381 5.48 2.625a8.066 8.066 0 011.298 1.587c1.468 2.382 1.33 5.376.184 7.142-.85 1.312-2.67 2.544-4.37 2.53-.583-.023-1.438-.152-2.25-.566-2.629-1.343-3.021-4.688-1.118-6.306-.632-.136-1.82.13-2.646 1.363-.742 1.107-.7 2.816-.242 4.028a6.473 6.473 0 01-.59-1.895 7.695 7.695 0 01.416-3.845A8.212 8.212 0 019.45 5.399c.896-1.069 1.908-1.72 2.75-2.005-.54-.471-1.411-.738-2.421-.767C8.31 2.583 6.327 3.061 4.7 4.41a8.148 8.148 0 00-1.976 2.414c-.455.836-.691 1.659-.697 1.678.122-1.445.704-2.994 1.248-4.055-.79.413-1.827 1.668-2.41 3.042C.095 9.37-.2 11.608.14 13.989c.966 5.668 5.9 9.982 11.843 9.982C18.62 23.971 24 18.591 24 11.956a11.93 11.93 0 00-3.548-8.511z" /></svg>
                  </a>

                  {/* Opera (Active) */}
                  <a href="#" target="_blank" rel="noopener noreferrer" title="Opera" aria-label="Opera" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', textDecoration: 'none', border: '2px solid var(--primary)', transition: 'all 0.2s' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8.051 5.238c-1.328 1.566-2.186 3.883-2.246 6.48v.564c.061 2.598.918 4.912 2.246 6.479 1.721 2.236 4.279 3.654 7.139 3.654 1.756 0 3.4-.537 4.807-1.471C17.879 22.846 15.074 24 12 24c-.192 0-.383-.004-.57-.014C5.064 23.689 0 18.436 0 12 0 5.371 5.373 0 12 0h.045c3.055.012 5.84 1.166 7.953 3.055-1.408-.93-3.051-1.471-4.81-1.471-2.858 0-5.417 1.42-7.14 3.654h.003zM24 12c0 3.556-1.545 6.748-4.002 8.945-3.078 1.5-5.946.451-6.896-.205 3.023-.664 5.307-4.32 5.307-8.74 0-4.422-2.283-8.075-5.307-8.74.949-.654 3.818-1.703 6.896-.205C22.455 5.25 24 8.445 24 12z" /></svg>
                  </a>

                  {/* Edge (Active) */}
                  <a href="#" target="_blank" rel="noopener noreferrer" title="Microsoft Edge" aria-label="Microsoft Edge" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', textDecoration: 'none', border: '2px solid var(--primary)', transition: 'all 0.2s' }}>
                    <svg width="20" height="20" viewBox="0 0 512 512" fill="currentColor"><path d="M481.92,134.48C440.87,54.18,352.26,8,255.91,8,137.05,8,37.51,91.68,13.47,203.66c26-46.49,86.22-79.14,149.46-79.14,79.27,0,121.09,48.93,122.25,50.18,22,23.8,33,50.39,33,83.1,0,10.4-5.31,25.82-15.11,38.57-1.57,2-6.39,4.84-6.39,11,0,5.06,3.29,9.92,9.14,14,27.86,19.37,80.37,16.81,80.51,16.81A115.39,115.39,0,0,0,444.94,322a118.92,118.92,0,0,0,58.95-102.44C504.39,176.13,488.39,147.26,481.92,134.48ZM212.77,475.67a154.88,154.88,0,0,1-46.64-45c-32.94-47.42-34.24-95.6-20.1-136A155.5,155.5,0,0,1,203,215.75c59-45.2,94.84-5.65,99.06-1a80,80,0,0,0-4.89-10.14c-9.24-15.93-24-36.41-56.56-53.51-33.72-17.69-70.59-18.59-77.64-18.59-38.71,0-77.9,13-107.53,35.69C35.68,183.3,12.77,208.72,8.6,243c-1.08,12.31-2.75,62.8,23,118.27a248,248,0,0,0,248.3,141.61C241.78,496.26,214.05,476.24,212.77,475.67Zm250.72-98.33a7.76,7.76,0,0,0-7.92-.23,181.66,181.66,0,0,1-20.41,9.12,197.54,197.54,0,0,1-69.55,12.52c-91.67,0-171.52-63.06-171.52-144A61.12,61.12,0,0,1,200.61,228,168.72,168.72,0,0,0,161.85,278c-14.92,29.37-33,88.13,13.33,151.66,6.51,8.91,23,30,56,47.67,23.57,12.65,49,19.61,71.7,19.61,35.14,0,115.43-33.44,163-108.87A7.75,7.75,0,0,0,463.49,377.34Z" /></svg>
                  </a>


                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <span style={{ color: 'var(--text)', fontWeight: '500', fontSize: '16px' }}>{t.mobile_app_for}</span>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button title="Google Play" aria-label="Google Play" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', border: '2px solid var(--primary)', cursor: 'pointer', transition: 'all 0.2s', padding: 0 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22.018 13.298l-3.919 2.218-3.515-3.493 3.543-3.521 3.891 2.202a1.49 1.49 0 0 1 0 2.594zM1.337.924a1.486 1.486 0 0 0-.112.568v21.017c0 .217.045.419.124.6l11.155-11.087L1.337.924zm12.207 10.065l3.258-3.238L3.45.195a1.466 1.466 0 0 0-.946-.179l11.04 10.973zm0 2.067l-11 10.933c.298.036.612-.016.906-.183l13.324-7.54-3.23-3.21z" /></svg>
                  </button>
                  <button title="App Store" aria-label="App Store" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'transparent', color: '#666', border: '2px solid transparent', cursor: 'not-allowed', padding: 0 }} disabled>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" /></svg>
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <span style={{ color: 'var(--text)', fontWeight: '500', fontSize: '16px' }}>{t.wearable_for || "Giyilebilir Teknoloji İçin:"}</span>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button title="Play Store (Wear OS)" aria-label="Play Store (Wear OS)" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'transparent', color: '#666', border: '2px solid transparent', cursor: 'not-allowed', padding: 0 }} disabled>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22.018 13.298l-3.919 2.218-3.515-3.493 3.543-3.521 3.891 2.202a1.49 1.49 0 0 1 0 2.594zM1.337.924a1.486 1.486 0 0 0-.112.568v21.017c0 .217.045.419.124.6l11.155-11.087L1.337.924zm12.207 10.065l3.258-3.238L3.45.195a1.466 1.466 0 0 0-.946-.179l11.04 10.973zm0 2.067l-11 10.933c.298.036.612-.016.906-.183l13.324-7.54-3.23-3.21z" /></svg>
                  </button>
                  <button title="App Store (watchOS)" aria-label="App Store (watchOS)" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'transparent', color: '#666', border: '2px solid transparent', cursor: 'not-allowed', padding: 0 }} disabled>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" /></svg>
                  </button>
                </div>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '24px', textAlign: 'center', width: '100%', maxWidth: '500px', lineHeight: '1.5' }}>
                {t.supported_browsers}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '40px', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: 'var(--text)', fontWeight: '500', fontSize: '16px' }}>{t.contact_us}:</span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=odun.coop@gmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Send email to odun.coop@gmail.com"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', textDecoration: 'none' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                </a>
                <span style={{ color: 'var(--text-muted)', fontSize: '15px', fontWeight: '500' }}>odun.coop@gmail.com</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginTop: '12px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', fontSize: '15px' }}>
              <a href={`/${lang}/terms`} style={{ color: 'var(--text-muted)', fontWeight: '500' }}>{t.terms_of_use}</a>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              <a href={`/${lang}/privacy`} style={{ color: 'var(--text-muted)', fontWeight: '500' }}>{t.privacy_policy}</a>
              <a href="#support" style={{ color: 'var(--text-muted)', fontWeight: '500' }}>{t.nav_support}</a>
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
}
