import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import SmoothScroll from "../../components/SmoothScroll";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(props) {
  const params = await props.params;
  const lang = params.lang || 'en';

  const title = lang === 'tr'
    ? "Mample - Ücretsiz Terminal Bildirimleri"
    : "Mample - Free Terminal Notifications";

  const description = lang === 'tr'
    ? "Uzun süren işlemlerde ekrana bakmaya son. Terminal komutları ve yapay zeka asistanlarının görevleri bittiğinde telefonunuza ücretsiz bildirim alın. Aylık bildirim kotası yok."
    : "Stop staring at the screen. Get free notifications on your phone when terminal commands or AI coding tasks finish. No monthly notification quota.";

  return {
    metadataBase: new URL("https://mample.vercel.app"),
    title: {
      default: title,
      template: "%s | Mample",
    },
    description: description,
    keywords: [
      "mample",
      "send notification to phone",
      "cli push notification",
      "terminal notifications",
      "productivity tool",
      "automation",
      "push notification api",
      "cursor ai automation",
      "telefona bildirim",
      "terminalden bildirim"
    ],
    applicationName: "Mample",
    authors: [{ name: "Mample Team" }],
    openGraph: {
      title: title,
      description: description,
      url: `https://mample.vercel.app/${lang}`,
      siteName: "Mample",
      locale: lang === 'tr' ? "tr_TR" : "en_US",
      type: "website",
      images: [
        {
          url: "https://mample.vercel.app/images/og-banner.png",
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
      images: ["https://mample.vercel.app/images/og-banner.png"],
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
    <html lang={lang} className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        {children}
        <SmoothScroll />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
