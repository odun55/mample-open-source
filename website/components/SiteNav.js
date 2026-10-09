import Link from 'next/link';
import styles from './SiteNav.module.css';

export default function SiteNav({ lang, t, current = '' }) {
  const suffix = current ? '/' + current : '';
  return (
    <nav className={styles.navbar} aria-label={t.nav_label}>
      <Link href={'/' + lang} className={styles.brand}>
        <img src="/images/logo.png" alt="" width={32} height={32} />
        <span>Mample</span>
      </Link>
      <div className={styles.links}>
        <Link href={'/' + lang + '/guide'} aria-current={current === 'guide' ? 'page' : undefined}>{t.nav_guide}</Link>
        <Link href={'/' + lang + '/extension'} aria-current={current === 'extension' ? 'page' : undefined}>{t.nav_extension}</Link>
        <Link href={'/' + lang + '#support'} className={styles.supportLink}>{t.nav_support}</Link>
        <div className={styles.languages} aria-label={t.nav_language}>
          <Link href={'/tr' + suffix} aria-current={lang === 'tr' ? 'true' : undefined}>TR</Link>
          <Link href={'/en' + suffix} aria-current={lang === 'en' ? 'true' : undefined}>EN</Link>
        </div>
      </div>
    </nav>
  );
}
