export default function manifest() {
  return {
    name: 'Mample',
    short_name: 'Mample',
    description: 'Free phone notifications for terminal commands and AI coding tasks.',
    start_url: '/',
    display: 'standalone',
    background_color: '#1a1a1c',
    theme_color: '#88d49e',
    icons: [
      {
        src: '/images/logo.png',
        sizes: '128x128',
        type: 'image/png',
      },
    ],
  };
}
