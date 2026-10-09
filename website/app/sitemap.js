export default function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mample.vercel.app';
  
  const locales = ['en', 'tr'];
  const routes = ['', '/privacy', '/terms', '/guide', '/extension'];

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
