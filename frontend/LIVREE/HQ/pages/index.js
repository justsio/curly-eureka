import Head from 'next/head';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import PrizesSection from '@/components/PrizesSection';
import WinnersSection from '@/components/WinnersSection';

export default function Home() {
  const { t } = useTranslation();
  const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME || 'Entreprise';

  return (
    <>
      <Head>
        <title>{t('landing.title', { company: companyName })}</title>
        <meta name="description" content={t('landing.subtitle')} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-accent-500/10" />
          <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24 text-center">
            <div className="inline-block mb-6 px-4 py-2 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
              🎉 {t('landing.subtitle')}
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              {t('landing.title', { company: companyName })}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              {t('landing.subtitle')}
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
            >
              {t('landing.cta')}
              <span>→</span>
            </Link>
          </div>
        </section>

        <PrizesSection />
        <WinnersSection />
      </main>
    </>
  );
}
