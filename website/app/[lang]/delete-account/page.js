import Link from 'next/link';
import SiteNav from '../../../components/SiteNav';
import DeleteAccountForm from '../../../components/DeleteAccountForm';
import { getDictionary } from '../../../getDictionary';
import styles from '../guide/guide.module.css';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const t = await getDictionary(lang);
  return { title: t.delete_web_title, description: t.delete_web_intro,
    alternates: { canonical: `/${lang}/delete-account`, languages: {
      en: '/en/delete-account', tr: '/tr/delete-account', 'x-default': '/en/delete-account',
    } },
  };
}

export default async function DeleteAccountPage({ params }) {
  const { lang } = await params;
  const t = await getDictionary(lang);
  return <>
    <SiteNav lang={lang} t={t} current="delete-account" />
    <main className={styles.container} style={{ maxWidth: 900, margin: '0 auto', padding: '140px 24px 80px', display: 'flex', flexDirection: 'column', gap: 32 }}>
      <h1 className={styles.title}>{t.delete_web_title}</h1>
      <p className={styles.description}>{t.delete_web_intro}</p>
      <h2>{t.delete_web_scope_title}</h2>
      <p className={styles.description}>{t.delete_web_scope}</p>
      <DeleteAccountForm t={t} />
      <h2>{t.delete_web_no_key_title}</h2>
      <p className={styles.description}>{t.delete_web_no_key}</p>
      <a href={`mailto:odun.coop@gmail.com?subject=${encodeURIComponent('Mample account deletion request')}`}>odun.coop@gmail.com</a>
      <Link href={`/${lang}/privacy#privacy-6`}>{t.privacy_page_title}</Link>
    </main>
  </>;
}
