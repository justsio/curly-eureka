'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';

export default function SharePage() {
  const router = useRouter();
  const [language, setLanguage] = useState<'ar' | 'fr'>('ar');
  const [participantId, setParticipantId] = useState<string | null>(null);

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as 'ar' | 'fr' || 'ar';
    setLanguage(savedLang);
    if (typeof window !== 'undefined') {
      document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = savedLang;
    }

    // Get participant ID from sessionStorage
    const id = sessionStorage.getItem('participantId');
    if (!id) {
      router.push('/register');
      return;
    }
    setParticipantId(id);
  }, [router]);

  const translations = {
    ar: {
      success: 'تم التسجيل بنجاح!',
      subtitle: 'شارك المسابقة مع أصدقائك لزيادة فرصك',
      message: 'شارك رابط المسابقة لزيادة فرصك في الفوز',
      submessage: 'كل مشاركة صحيحة تزيد من فرصتك للفوز بالجوائز القيمة!',
      whatsapp: 'مشاركة عبر واتساب',
      messenger: 'مشاركة عبر ماسنجر',
      snapchat: 'مشاركة عبر سناب شات',
    },
    fr: {
      success: 'Inscription réussie!',
      subtitle: 'Partagez le concours avec vos amis pour augmenter vos chances',
      message: 'Partagez le lien du concours pour augmenter vos chances de gagner',
      submessage: 'Chaque partage correct augmente vos chances de gagner des prix précieux!',
      whatsapp: 'Partager via WhatsApp',
      messenger: 'Partager via Messenger',
      snapchat: 'Partager via Snapchat',
    },
  };

  const t = translations[language];

  const shareUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const handleShare = async (platform: 'whatsapp' | 'messenger' | 'snapchat') => {
    if (!participantId) return;

    // Track the share
    try {
      await apiService.trackShare(participantId, platform);
    } catch (error) {
      console.error('Error tracking share:', error);
    }

    const shareText = language === 'ar' 
      ? '🎉 انضم لمسابقة Bankily واربح جوائز قيمة!'
      : '🎉 Rejoignez le concours Bankily et gagnez des prix précieux!';

    switch (platform) {
      case 'whatsapp':
        window.open(
          `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`,
          '_blank'
        );
        break;
      case 'messenger':
        // Try native app first, fallback to web
        const messengerUrl = `fb-messenger://share?link=${encodeURIComponent(shareUrl)}`;
        window.open(messengerUrl, '_blank');
        // Fallback to web if native fails
        setTimeout(() => {
          window.open(
            `https://www.facebook.com/dialog/send?link=${encodeURIComponent(shareUrl)}&app_id=YOUR_APP_ID&redirect_uri=${encodeURIComponent(shareUrl)}`,
            '_blank'
          );
        }, 500);
        break;
      case 'snapchat':
        window.open(
          `https://www.snapchat.com/scan?attachmentUrl=${encodeURIComponent(shareUrl)}`,
          '_blank'
        );
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-light to-white flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-6">✅</div>
        <h1 className="text-3xl font-bold text-dark mb-2">{t.success}</h1>
        <p className="text-gray-600 mb-8">{t.subtitle}</p>

        <div className="bg-primary bg-opacity-10 rounded-lg p-6 mb-8">
          <p className="text-gray-800 font-semibold mb-2">{t.message}</p>
          <p className="text-gray-600 text-sm">{t.submessage}</p>
        </div>

        <div className="space-y-4">
          {/* WhatsApp */}
          <button
            onClick={() => handleShare('whatsapp')}
            className="w-full bg-green-500 text-white py-4 px-6 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-3"
          >
            <span className="text-2xl">💬</span>
            <span>{t.whatsapp}</span>
          </button>

          {/* Messenger */}
          <button
            onClick={() => handleShare('messenger')}
            className="w-full bg-blue-500 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-3"
          >
            <span className="text-2xl">💙</span>
            <span>{t.messenger}</span>
          </button>

          {/* Snapchat */}
          <button
            onClick={() => handleShare('snapchat')}
            className="w-full bg-yellow-400 text-white py-4 px-6 rounded-lg font-semibold hover:bg-yellow-500 transition-colors flex items-center justify-center gap-3"
          >
            <span className="text-2xl">👻</span>
            <span>{t.snapchat}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
