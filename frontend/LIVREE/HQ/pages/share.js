import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useContest } from '@/context/ContestContext';

export default function SharePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { phone } = useContest();
  const [siteUrl, setSiteUrl] = useState('');

  useEffect(() => {
    if (!phone) {
      router.replace('/register');
      return;
    }
    setSiteUrl(window.location.origin);
  }, [phone, router]);

  const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME || 'Entreprise';
  const shareText = `🎉 Rejoignez le concours ${companyName} et gagnez des prix précieux!\n${siteUrl}`;

  const trackShare = async (platform) => {
    try {
      await axios.post('/api/track-share', { phone, platform });
    } catch (error) {
      console.error('Track share error:', error);
    }
  };

  const handleWhatsApp = () => {
    trackShare('WhatsApp');
    window.open(
      `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleMessenger = () => {
    trackShare('Messenger');
    window.open(
      `fb-messenger://share?link=${encodeURIComponent(siteUrl)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleSnapchat = () => {
    trackShare('Snapchat');
    window.open(
      `https://www.snapchat.com/scan?attachmentUrl=${encodeURIComponent(siteUrl)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  if (!phone) return null;

  return (
    <>
      <Head>
        <title>{t('share.success')}</title>
      </Head>

      <main className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center text-4xl">
              ✅
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">{t('share.success')}</h1>
            <p className="text-gray-600 mb-8">{t('share.message')}</p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleWhatsApp}
                className="w-full py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <span>💬</span> {t('share.whatsapp')}
              </button>
              <button
                type="button"
                onClick={handleMessenger}
                className="w-full py-3.5 bg-[#0084FF] hover:bg-[#0073e6] text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <span>💙</span> {t('share.messenger')}
              </button>
              <button
                type="button"
                onClick={handleSnapchat}
                className="w-full py-3.5 bg-[#FFFC00] hover:bg-[#e6e300] text-gray-900 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <span>👻</span> {t('share.snapchat')}
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
