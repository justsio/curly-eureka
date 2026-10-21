import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import ErrorModal from '@/components/ErrorModal';
import { useContest } from '@/context/ContestContext';

export default function OtpPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { phone, entryCode, clearRegistration } = useContest();
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (!phone || !entryCode) {
      router.replace('/register');
    }
  }, [phone, entryCode, router]);

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setOtpCode(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.post('/api/verify-otp', {
        phone,
        entryCode,
        otpCode,
      });

      if (data.success) {
        router.push('/share');
      } else {
        setShowError(true);
      }
    } catch {
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleErrorClose = () => {
    setShowError(false);
    clearRegistration();
    router.push('/register');
  };

  if (!phone || !entryCode) return null;

  return (
    <>
      <Head>
        <title>{t('otp.title')}</title>
      </Head>

      <main className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-accent-500/10 flex items-center justify-center text-3xl">
                🔐
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('otp.title')}</h1>
              <p className="text-gray-600 text-sm">{t('otp.placeholder')}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                type="tel"
                inputMode="numeric"
                maxLength={4}
                value={otpCode}
                onChange={handleOtpChange}
                placeholder="0000"
                className="w-full px-4 py-4 text-center text-2xl tracking-[0.5em] border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition ltr-input font-mono"
                required
              />

              <button
                type="submit"
                disabled={loading || otpCode.length !== 4}
                className="w-full py-3.5 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 disabled:opacity-60 text-white font-bold rounded-xl transition-all shadow-md"
              >
                {loading ? '...' : t('otp.verify')}
              </button>
            </form>
          </div>
        </div>
      </main>

      <ErrorModal
        isOpen={showError}
        title={t('errors.title')}
        message={t('errors.invalid_otp')}
        buttonText={t('errors.retry')}
        onClose={handleErrorClose}
      />
    </>
  );
}
