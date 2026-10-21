'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ErrorModal from '@/components/ErrorModal';
import { apiService } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [entryCode, setEntryCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorModal, setErrorModal] = useState({
    isOpen: false,
    message: '',
  });
  const [language, setLanguage] = useState<'ar' | 'fr'>('ar');

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as 'ar' | 'fr' || 'ar';
    setLanguage(savedLang);
    if (typeof window !== 'undefined') {
      document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = savedLang;
    }
  }, []);

  const translations = {
    ar: {
      title: 'التسجيل في المسابقة',
      phoneLabel: 'رقم الهاتف',
      phonePlaceholder: 'أدخل رقم هاتفك (8 أرقام)',
      codeLabel: 'رمز المشاركة',
      codePlaceholder: 'أدخل رمز مكون من 4 أرقام',
      submit: 'التسجيل',
      errorTitle: 'خطأ',
      errorMessage: 'معلومات التسجيل غير صحيحة',
      retry: 'حاول مرة أخرى',
    },
    fr: {
      title: "Inscription au concours",
      phoneLabel: 'Numéro de téléphone',
      phonePlaceholder: 'Entrez votre numéro (8 chiffres)',
      codeLabel: 'Code de participation',
      codePlaceholder: 'Entrez un code à 4 chiffres',
      submit: "S'inscrire",
      errorTitle: 'Erreur',
      errorMessage: "Informations d'inscription incorrectes",
      retry: 'Réessayer',
    },
  };

  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiService.register(phone, entryCode);

      if (response.success && response.participantId) {
        // Store participant data in sessionStorage
        sessionStorage.setItem('participantId', response.participantId);
        sessionStorage.setItem('phone', phone);
        sessionStorage.setItem('entryCode', entryCode);
        
        // Redirect to OTP1 page
        router.push('/otp1');
      } else {
        setErrorModal({
          isOpen: true,
          message: response.message || t.errorMessage,
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrorModal({
        isOpen: true,
        message: t.errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-light to-white flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-dark mb-8">{t.title}</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Phone Number */}
          <div>
            <label htmlFor="phone" className="block text-gray-700 font-semibold mb-2">
              {t.phoneLabel}
            </label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 8))}
              placeholder={t.phonePlaceholder}
              maxLength={8}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-left"
              dir="ltr"
            />
          </div>

          {/* Entry Code */}
          <div>
            <label htmlFor="entryCode" className="block text-gray-700 font-semibold mb-2">
              {t.codeLabel}
            </label>
            <input
              type="tel"
              id="entryCode"
              value={entryCode}
              onChange={(e) => setEntryCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder={t.codePlaceholder}
              maxLength={4}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-left"
              dir="ltr"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'جاري المعالجة...' : t.submit}
          </button>
        </form>
      </div>

      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, message: '' })}
        title={t.errorTitle}
        message={errorModal.message}
        retryText={t.retry}
      />
    </div>
  );
}
