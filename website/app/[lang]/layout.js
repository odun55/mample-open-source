import { Geist } from "next/font/google";
import "../globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { siteUrl } from '../../lib/siteUrl';
import { getDictionary } from '../../getDictionary';
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  preload: false,
  display: "swap",
});


export async function generateMetadata(props) {
  const params = await props.params;
  const lang = params.lang || 'en';

  const t = await getDictionary(lang);
  const title = t.seo_title;
  const description = t.seo_description;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: "%s | Mample",
    },
    description: description,
    applicationName: "Mample",
    authors: [{ name: "Mample Team" }],
    openGraph: {
      title: title,
      description: description,
      url: `${siteUrl}/${lang}`,
      siteName: "Mample",
      locale: lang === 'tr' ? "tr_TR" : "en_US",
      type: "website",
      images: [
        {
          url: `${siteUrl}/images/og-banner.png`,
          width: 1200,
          height: 630,
          alt: "Mample Banner",
        }
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: [`${siteUrl}/images/og-banner.png`],
    }
  };
}

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'tr' }];
}

export default async function RootLayout(props) {
  const params = await props.params;
  const lang = params.lang || 'en';
  const { children } = props;

  return (
    <html lang={lang} className={geistSans.variable}>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
