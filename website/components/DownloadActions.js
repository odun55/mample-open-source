import { githubUrl, googlePlayUrl } from '../lib/projectLinks';
import styles from '../app/page.module.css';

export default function DownloadActions({ lang, t }) {
  const badge = <img
    src={`/brand/GetItOnGooglePlay_Badge_Web_color_${lang === 'tr' ? 'Turkish' : 'English'}.svg`}
    width="238.96" height="70.87" alt="" aria-hidden="true"
  />;
  return <div className={`${styles.ctas} ${styles.heroActions}`} id="download">
    <span id="iletisim" className={styles.supportAnchor} aria-hidden="true" />
    {googlePlayUrl ? <a href={googlePlayUrl} className={styles.playBadge} aria-label={t.google_play_download} target="_blank" rel="noopener noreferrer">{badge}</a>
      : <button type="button" className={styles.playBadge} disabled aria-label={t.google_play_download}>{badge}</button>}
    <a href={githubUrl} className={styles.githubButton} aria-label={t.github_button} target="_blank" rel="noopener noreferrer">
      <img src="/brand/GitHub_Lockup_Black_Clearspace.svg" width="448" height="127" alt="" aria-hidden="true" />
    </a>
  </div>;
}
