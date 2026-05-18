import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollAnimator from '@/components/ScrollAnimator';
import FloatingCTA from '@/components/FloatingCTA';
import type { Metadata } from 'next';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const alternates = {
    canonical: `https://abccentre.es/${locale}`,
    languages: {
      'es': 'https://abccentre.es/es',
      'ca': 'https://abccentre.es/ca',
    },
  };
  return { alternates };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as 'es' | 'ca')) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Navbar />
      <main id="main-content" className="pb-16 lg:pb-0">{children}</main>
      <Footer />
      <ScrollAnimator />
      <FloatingCTA />
    </NextIntlClientProvider>
  );
}
