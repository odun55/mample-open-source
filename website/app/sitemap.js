import { siteUrl } from '../lib/siteUrl';

export default function sitemap() {
  const baseUrl = siteUrl;
  
  const locales = ['en', 'tr'];
  const routes = ['', '/privacy', '/terms', '/guide', '/extension', '/delete-account'];

  const sitemapEntries = [];

  locales.forEach((locale) => {
    routes.forEach((route) => {
      const alternates = {
        languages: {
          en: `${baseUrl}/en${route}`,
          tr: `${baseUrl}/tr${route}`,
        },
      };

      sitemapEntries.push({
        url: `${baseUrl}/${locale}${route}`,
        changeFrequency: route === '' ? 'weekly' : 'monthly',
        priority: route === '' ? 1 : 0.8,
        alternates,
      });
    });
  });

  return sitemapEntries;
}
