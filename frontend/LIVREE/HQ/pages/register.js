import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import ErrorModal from '@/components/ErrorModal';
import { useContest } from '@/context/ContestContext';
import { PHONE_DIGITS, PHONE_PREFIX } from '@/utils/validation';

export default function RegisterPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { updateRegistration } = useContest();
  const [phone, setPhone] = useState('');
  const [entryCode, setEntryCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, PHONE_DIGITS);
    setPhone(value);
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setEntryCode(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.post('/api/register', { phone, entryCode });

      if (data.success) {
        updateRegistration(phone, entryCode);
        router.push('/otp');
      } else {
        setShowError(true);
      }
    } catch {
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>{t('registration.submit')}</title>
      </Head>

      <main className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-100 flex items-center justify-center text-3xl">
                📝
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{t('registration.submit')}</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('registration.phone_label')}
                </label>
                <div className="flex ltr-input">
                  <span className="inline-flex items-center px-4 py-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-gray-700 font-medium">
                    {PHONE_PREFIX}
                  </span>
                  <input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={PHONE_DIGITS}
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder={t('registration.phone_placeholder')}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-r-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition ltr-input"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="entryCode" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('registration.password_label')}
                </label>
                <input
                  id="entryCode"
                  type="tel"
                  inputMode="numeric"
                  maxLength={4}
                  value={entryCode}
                  onChange={handleCodeChange}
                  placeholder={t('registration.password_placeholder')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition ltr-input"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 disabled:opacity-60 text-white font-bold rounded-xl transition-all shadow-md"
              >
                {loading ? '...' : t('registration.submit')}
              </button>
            </form>
          </div>
        </div>
      </main>

      <ErrorModal
        isOpen={showError}
        title={t('errors.title')}
        message={t('errors.invalid_registration')}
        buttonText={t('errors.retry')}
        onClose={() => setShowError(false)}
      />
    </>
  );
}
