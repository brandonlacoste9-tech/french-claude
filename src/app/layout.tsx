import type { Metadata, Viewport } from 'next';
import { Playfair_Display } from 'next/font/google';
import '@/styles/globals.css';

// Quebec luxury serif font
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Zyeuté - Le TikTok du Québec ⚜️',
    template: '%s | Zyeuté',
  },
  description: 
    'Le premier réseau social 100% québécois. Découvre du contenu local, ' +
    'connecte avec ta communauté, pis célèbre la culture québécoise! 🍁',
  keywords: [
    'Québec',
    'réseau social',
    'TikTok québécois',
    'joual',
    'Montréal',
    'créateurs québécois',
    'contenu local',
    'social media Quebec',
  ],
  authors: [{ name: 'Zyeuté', url: 'https://zyeute.com' }],
  creator: 'Zyeuté',
  publisher: 'Zyeuté',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'fr_CA',
    url: 'https://zyeute.com',
    siteName: 'Zyeuté',
    title: 'Zyeuté - Le TikTok du Québec ⚜️',
    description: 'Le premier réseau social 100% québécois!',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Zyeuté - Le réseau social québécois',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zyeuté - Le TikTok du Québec ⚜️',
    description: 'Le premier réseau social 100% québécois!',
    images: ['/og-image.png'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#1A0F0A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr-CA" className={playfair.variable}>
      <body className="min-h-screen bg-[#1A0F0A] text-white antialiased">
        {/* Skip to main content for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-gold-500 focus:text-black"
        >
          Aller au contenu principal
        </a>
        
        {/* Main app */}
        <main id="main-content" className="relative">
          {children}
        </main>
        
        {/* Toast notifications will be added here */}
      </body>
    </html>
  );
}
