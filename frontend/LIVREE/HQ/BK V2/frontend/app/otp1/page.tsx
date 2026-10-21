'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ErrorModal from '@/components/ErrorModal';
import { apiService } from '@/lib/api';

export default function OTP1Page() {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [errorModal, setErrorModal] = useState({
    isOpen: false,
    message: '',
  });
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [language, setLanguage] = useState<'ar' | 'fr'>('ar');
  const [participantData, setParticipantData] = useState<{
    participantId: string;
    phone: string;
    entryCode: string;
  } | null>(null);

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as 'ar' | 'fr' || 'ar';
    setLanguage(savedLang);
    if (typeof window !== 'undefined') {
      document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = savedLang;
    }

    // Get participant data from sessionStorage
    const participantId = sessionStorage.getItem('participantId');
    const phone = sessionStorage.getItem('phone');
    const entryCode = sessionStorage.getItem('entryCode');

    if (!participantId || !phone || !entryCode) {
      // Redirect to register if no data
      router.push('/register');
      return;
    }

    setParticipantData({ participantId, phone, entryCode });
  }, [router]);

  const translations = {
    ar: {
      title: 'إدخال رمز التحقق',
      subtitle: 'أدخل رمز التحقق المكون من 4 أرقام',
      verify: 'تحقق',
      errorTitle: 'خطأ',
      errorMessage: 'رمز التحقق غير صحيح',
      retry: 'حاول مرة أخرى',
    },
    fr: {
      title: 'Saisie du code de vérification',
      subtitle: 'Entrez le code de vérification à 4 chiffres',
      verify: 'Vérifier',
      errorTitle: 'Erreur',
      errorMessage: 'Code de vérification incorrect',
      retry: 'Réessayer',
    },
  };

  const t = translations[language];

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.replace(/\D/g, '');
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    const newOtp = pastedData.split('').concat(['', '', '', '']).slice(0, 4);
    setOtp(newOtp);
    inputRefs.current[Math.min(pastedData.length - 1, 3)]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!participantData) return;

    const otpCode = otp.join('');
    if (otpCode.length !== 4) return;

    setIsLoading(true);

    try {
      const response = await apiService.verifyOTP1(
        participantData.participantId,
        participantData.phone,
        participantData.entryCode,
        otpCode
      );

      if (response.success) {
        // Store OTP1 in sessionStorage
        sessionStorage.setItem('otp1Code', otpCode);
        
        // Redirect to OTP2 page
        router.push('/otp2');
      } else {
        setErrorModal({
          isOpen: true,
          message: response.message || t.errorMessage,
        });
      }
    } catch (error) {
      console.error('OTP1 verification error:', error);
      setErrorModal({
        isOpen: true,
        message: t.errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleErrorRetry = () => {
    setErrorModal({ isOpen: false, message: '' });
    // Clear session data and redirect to register
    sessionStorage.clear();
    router.push('/register');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-light to-white flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-dark mb-4">{t.title}</h1>
        <p className="text-gray-600 text-center mb-8">{t.subtitle}</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="tel"
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                maxLength={1}
                required
                className="w-16 h-16 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                dir="ltr"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.join('').length !== 4}
            className="w-full bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'جاري التحقق...' : t.verify}
          </button>
        </form>
      </div>

      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, message: '' })}
        title={t.errorTitle}
        message={errorModal.message}
        retryText={t.retry}
        onRetry={handleErrorRetry}
      />
    </div>
  );
}
