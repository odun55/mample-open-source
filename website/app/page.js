import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export const runtime = 'edge';

export default async function RootPage() {
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language') || '';
  
  // Tarayıcının birincil (en baskın) dilini al (örn: 'en-US,en;q=0.9,tr;q=0.8' -> 'en-us')
  const primaryLang = acceptLanguage.split(',')[0].toLowerCase();
  
  if (primaryLang.startsWith('tr')) {
    redirect('/tr');
  } else {
    redirect('/en');
  }
}
