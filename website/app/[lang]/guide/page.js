import CodeBlock from '../../../components/CodeBlock';
import GuideContents from '../../../components/GuideContents';
import Link from 'next/link';
import SiteNav from '../../../components/SiteNav';
import styles from './guide.module.css';
import { getDictionary } from '../../../getDictionary';


export async function generateMetadata(props) {
  const params = await props.params;
  const lang = params.lang || 'en';
  const t = await getDictionary(lang);

  return {
    title: t.guide_page_title || "Mample Setup Guide",
    description: t.guide_page_desc || "Detailed setup instructions for Mample.",
    alternates: {
      canonical: `/${lang}/guide`,
      languages: {
        'en': '/en/guide',
        'tr': '/tr/guide',
        'x-default': '/en/guide',
      },
    },
  };
}

export default async function GuidePage(props) {
  const params = await props.params;
  const lang = params.lang || 'en';
  const t = await getDictionary(lang);

  const howToJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: t.guide_page_title || "Mample Setup Guide",
    description: t.guide_page_desc || "Detailed setup instructions for Mample.",
    step: [
      {
        '@type': 'HowToStep',
        name: t.guide_sec3_title || 'CLI Tool',
        text: (t.guide_sec3_sub1_desc || '').replace(/<\/?[^>]+(>|$)/g, "")
      },
      {
        '@type': 'HowToStep',
        name: t.guide_sec4_title || 'AI Agents',
        text: (t.guide_sec4_sub1_desc || '').replace(/<\/?[^>]+(>|$)/g, "")
      }
    ]
  };

  const contents = (<>
        <div className={styles.tocSection}>
          <a href="#top" className={styles.tocMainTitle}>{t.guide_page_title}</a>
        </div>


        
        <div className={styles.tocSection}>
          <a href="#cli-tool" className={styles.tocTitle}>{t.guide_sec3_title}</a>
          <a href="#cli-setup" className={styles.tocSubItem}>{t.guide_sec3_sub1_title}</a>
          <a href="#cli-sending" className={styles.tocSubItem}>{t.guide_test_direct_title}</a>
          <a href="#cli-command-completion" className={styles.tocSubItem}>{t.guide_usage_title}</a>
          <a href="#cli-troubleshooting" className={styles.tocSubItem}>{t.guide_troubleshooting_title}</a>
          <a href="#cli-disconnect" className={styles.tocSubItem}>{t.guide_sec3_sub3_title}</a>
          <a href="#cli-uninstall" className={styles.tocSubItem}>{t.guide_sec3_sub4_title}</a>
          <a href="#cli-help" className={styles.tocSubItem}>{t.guide_sec3_sub5_title}</a>
        </div>

        <div className={styles.tocSection}>
          <a href="#ai-agents" className={styles.tocTitle}>{t.guide_sec4_title}</a>
          <a href="#ai-setup" className={styles.tocSubItem}>{t.guide_sec4_sub1_title}</a>
          <a href="#ai-instructions" className={styles.tocSubItem}>{t.guide_sec4_sub2_title}</a>
          {t.guide_sec4_sub4_title && (
            <a href="#ai-disable-prompts" className={styles.tocSubItem}>{t.guide_sec4_sub4_title}</a>
          )}
        </div>

        <div className={styles.tocSection}>
          <a href="#detailed-info" className={styles.tocMainTitle}>{t.guide_sec0_title}</a>
          <a href="#detail-cli" className={styles.tocSubItem}>{t.guide_sec0_li2_title}</a>
          <a href="#detail-ai" className={styles.tocSubItem}>{t.guide_sec0_li3_title}</a>
          <a href="#detail-cloud" className={styles.tocSubItem}>{t.guide_sec0_li4_title}</a>
          <a href="#detail-free" className={styles.tocSubItem}>{t.guide_sec0_li5_title}</a>
        </div>
  </>);

  return (
    <>
    <SiteNav lang={lang} t={t} current="guide" />
    <div className={styles.pageWrapper}>
      <aside className={styles.sidebar}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
        />
        {contents}
      </aside>

      <main className={styles.container}>
      <GuideContents lang={lang}>{contents}</GuideContents>
      {/* SETUP GUIDE HEADER */}
      <header className={styles.header} id="top">
        <h1 className={styles.title}>{t.guide_page_title}</h1>
        <p className={styles.description}>{t.guide_page_desc}</p>
      </header>
      {/* SECTION 3: CLI TOOL */}
      <section className={styles.section} id="cli-tool">
        <h2 className={styles.sectionTitle}>{t.guide_sec3_title}</h2>
        
        <div className={styles.subSection} id="cli-setup">
          <h3 className={styles.subSectionTitle}>{t.guide_sec3_sub1_title}</h3>
          <p className={styles.subSectionDesc} dangerouslySetInnerHTML={{ __html: t.guide_sec3_sub1_desc }} />
          <CodeBlock lang={lang}>npm install -g mample</CodeBlock>
          <p className={styles.subSectionDesc} style={{ marginTop: '16px' }} dangerouslySetInnerHTML={{ __html: t.guide_sec3_sub1_desc2 }} />
          <h4 className={styles.cardTitle}>{t.guide_sec3_qr_title}</h4>
          <p className={styles.subSectionDesc}>{t.guide_sec3_qr_desc}</p>
          <CodeBlock lang={lang}>mample auth qr</CodeBlock>
          <h4 className={styles.cardTitle}>{t.guide_sec3_key_title}</h4>
          <p className={styles.subSectionDesc}>{t.guide_sec3_key_desc}</p>
          <CodeBlock lang={lang}>mample auth <b>&quot;your-secret-key&quot;</b></CodeBlock>
        </div>

        <div className={styles.subSection} id="cli-sending">
          <h3 className={styles.subSectionTitle}>{t.guide_test_direct_title}</h3>
          <p className={styles.subSectionDesc}>{t.guide_sec3_sub2_desc}</p>
          <p className={styles.subSectionDesc}>{t.guide_test_direct_desc}</p>
          <CodeBlock lang={lang}>{t.guide_test_direct_command}</CodeBlock>
          <p className={styles.subSectionDesc}>{t.guide_test_direct_result}</p>
        </div>

        <div className={styles.subSection} id="cli-command-completion">
          <h3 className={styles.subSectionTitle}>{t.guide_usage_title}</h3>
          <p className={styles.subSectionDesc}>{t.guide_usage_desc}</p>
          <h4 className={styles.cardTitle}>{t.guide_sec3_powershell_title}</h4>
          <p className={styles.subSectionDesc}>{t.guide_test_powershell_desc}</p>
          <CodeBlock lang={lang} task="Start-Sleep -Seconds 5" suffix={t.guide_usage_powershell_suffix} />
          <h4 className={styles.cardTitle}>{t.guide_test_cmd_title}</h4>
          <p className={styles.subSectionDesc}>{t.guide_test_cmd_desc}</p>
          <CodeBlock lang={lang} task="timeout /t 5 /nobreak >nul" suffix={t.guide_usage_cmd_suffix} />
          <h4 className={styles.cardTitle}>{t.guide_test_unix_title}</h4>
          <CodeBlock lang={lang} task="sleep 5" suffix={t.guide_usage_unix_suffix} />
        </div>

        <div className={styles.subSection} id="cli-troubleshooting">
          <h3 className={styles.subSectionTitle}>{t.guide_troubleshooting_title}</h3>
          <p className={styles.subSectionDesc}>{t.guide_troubleshooting_desc}</p>
          <p className={styles.subSectionDesc}>{t.guide_rate_limit_desc}</p>
        </div>

        <div className={styles.subSection} id="cli-disconnect">
          <h3 className={styles.subSectionTitle}>{t.guide_sec3_sub3_title}</h3>
          <CodeBlock lang={lang}>mample disconnect</CodeBlock>
          <p className={styles.subSectionDesc} dangerouslySetInnerHTML={{ __html: t.guide_sec3_sub3_desc }} />
        </div>
        
        <div className={styles.subSection} id="cli-uninstall">
          <h3 className={styles.subSectionTitle}>{t.guide_sec3_sub4_title}</h3>
          <p className={styles.subSectionDesc}>{t.guide_sec3_sub4_desc}</p>
          <CodeBlock lang={lang}>npm uninstall -g mample</CodeBlock>
        </div>
        
        <div className={styles.subSection} id="cli-help">
          <h3 className={styles.subSectionTitle}>{t.guide_sec3_sub5_title}</h3>
          <p className={styles.subSectionDesc}>{t.guide_sec3_sub5_desc}</p>
          <CodeBlock lang={lang}>mample help</CodeBlock>
        </div>
      </section>

      {/* SECTION 4: AI AGENTS */}
      <section className={styles.section} id="ai-agents">
        <h2 className={styles.sectionTitle}>{t.guide_sec4_title}</h2>
        
        <div className={styles.subSection} id="ai-setup">
          <h3 className={styles.subSectionTitle}>{t.guide_sec4_sub1_title}</h3>
          <p className={styles.subSectionDesc} dangerouslySetInnerHTML={{ __html: t.guide_sec4_sub1_desc }} />
          <p className={styles.subSectionDesc}><strong>{t.guide_ai_requirements_label}</strong> {t.guide_ai_requirements_note}</p>
        </div>

        <div className={styles.subSection} id="ai-instructions">
          <h3 className={styles.subSectionTitle}>{t.guide_sec4_sub2_title}</h3>
          <p className={styles.subSectionDesc} dangerouslySetInnerHTML={{ __html: t.guide_sec4_sub2_desc }} />
        </div>

        
        {t.guide_sec4_sub4_title && (
          <div className={styles.subSection} id="ai-disable-prompts">
            <h3 className={styles.subSectionTitle}>{t.guide_sec4_sub4_title}</h3>
            <p className={styles.subSectionDesc} dangerouslySetInnerHTML={{ __html: t.guide_sec4_sub4_desc }} />
          </div>
        )}

      </section>

      {/* DETAILED INFO HEADER */}
      <header className={styles.header} style={{ marginTop: '64px' }}>
        <h2 className={styles.title}>{t.guide_sec0_title}</h2>
        <p className={styles.description}>{t.guide_sec0_desc}</p>
      </header>
      
      <section className={styles.section} id="detailed-info" style={{ paddingTop: 0 }}>

        <div className={styles.subSection} id="detail-cli">
          <h3 className={styles.subSectionTitle}>{t.guide_sec0_li2_title}</h3>
          <p className={styles.subSectionDesc} dangerouslySetInnerHTML={{ __html: t.guide_sec0_li2_desc }} />
        </div>

        <div className={styles.subSection} id="detail-ai">
          <h3 className={styles.subSectionTitle}>{t.guide_sec0_li3_title}</h3>
          <p className={styles.subSectionDesc} dangerouslySetInnerHTML={{ __html: t.guide_sec0_li3_desc }} />
        </div>

        <div className={styles.subSection} id="detail-cloud">
          <h3 className={styles.subSectionTitle}>{t.guide_sec0_li4_title}</h3>
          <p className={styles.subSectionDesc} dangerouslySetInnerHTML={{ __html: t.guide_sec0_li4_desc }} />
        </div>

        <div className={styles.subSection} id="detail-free">
          <h3 className={styles.subSectionTitle}>{t.guide_sec0_li5_title}</h3>
          <p className={styles.subSectionDesc} dangerouslySetInnerHTML={{ __html: t.guide_sec0_li5_desc }} />
        </div>
      </section>

      </main>
    </div>
    </>
  );
}
