'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { apiService, Winner } from '@/lib/api';

export default function LandingPage() {
  const router = useRouter();
  const [winners, setWinners] = useState<Winner[]>([]);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState<'ar' | 'fr'>('ar');

  useEffect(() => {
    // Load language from localStorage
    const savedLang = localStorage.getItem('language') as 'ar' | 'fr' || 'ar';
    setLanguage(savedLang);
    if (typeof window !== 'undefined') {
      document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = savedLang;
    }
  }, []);

  useEffect(() => {
    const fetchWinners = async () => {
      try {
        const data = await apiService.getWinners();
        setWinners(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching winners:', error);
        setIsLoading(false);
      }
    };

    fetchWinners();
  }, []);

  useEffect(() => {
    if (winners.length === 0) return;

    const batchSize = 10;
    const totalBatches = Math.ceil(winners.length / batchSize);

    const interval = setInterval(() => {
      setCurrentBatch((prev) => {
        const nextBatch = prev + 1;
        return nextBatch >= totalBatches ? 0 : nextBatch;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [winners]);

  const getCurrentWinners = () => {
    const batchSize = 10;
    const start = currentBatch * batchSize;
    const end = start + batchSize;
    return winners.slice(start, end);
  };

  const translations = {
    ar: {
      title: 'مسابقة Bankily الكبرى',
      subtitle: 'فرصتك للفوز بجوائز قيمة',
      cta: 'تسجيل الدخول / المشاركة',
      winnersTitle: '🏅 فائزون من حملات مقدمة من Bankily',
      grandPrize: 'الجائزة الكبرى',
      secondaryPrizes: 'جوائز نقدية ثانوية',
      physicalPrizes: 'جوائز عينية',
      prize1: '1,000,000 أوقية جديدة',
      prize2: '100,000 أوقية (5 فائزين)',
      prize3: '50 هاتف iPhone (17 & 17 Pro Max)',
      prize4: '3 سيارات Toyota Corolla 2020',
      prize5: '2 سيارة Toyota Hilux 2022',
      prize6: 'منزل في تفرغ زينه',
    },
    fr: {
      title: 'Grand Concours Bankily',
      subtitle: 'Votre chance de gagner des prix précieux',
      cta: "S'inscrire / Participer",
      winnersTitle: '🏅 Gagnants des campagnes Bankily',
      grandPrize: 'Grand Prix',
      secondaryPrizes: 'Prix secondaires en espèces',
      physicalPrizes: 'Prix physiques',
      prize1: '1,000,000 Ouguiya',
      prize2: '100,000 Ouguiya (5 gagnants)',
      prize3: '50 téléphones iPhone (17 & 17 Pro Max)',
      prize4: '3 voitures Toyota Corolla 2020',
      prize5: '2 voitures Toyota Hilux 2022',
      prize6: 'Une maison à Tefragh Zeina',
    },
  };

  const t = translations[language];

  return (
    <div className="min-h-screen bg-gradient-to-b from-light to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">B</span>
          </div>
          <span className="text-2xl font-bold text-dark">Bankily</span>
        </div>
        <LanguageSwitcher />
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-5xl font-bold text-dark mb-4">{t.title}</h1>
        <p className="text-xl text-gray-600 mb-8">{t.subtitle}</p>
        <button
          onClick={() => router.push('/register')}
          className="bg-primary text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-opacity-90 transition-colors shadow-lg"
        >
          {t.cta}
        </button>
      </section>

      {/* Prizes Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Grand Prize */}
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-5xl mb-4">🏆</div>
            <h3 className="text-2xl font-bold text-dark mb-4">{t.grandPrize}</h3>
            <p className="text-primary text-xl font-semibold">{t.prize1}</p>
          </div>

          {/* Secondary Prizes */}
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-5xl mb-4">🎁</div>
            <h3 className="text-2xl font-bold text-dark mb-4">{t.secondaryPrizes}</h3>
            <p className="text-primary text-xl font-semibold">{t.prize2}</p>
          </div>

          {/* Physical Prizes */}
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-dark mb-4">{t.physicalPrizes}</h3>
            <ul className="text-left space-y-2 text-gray-700">
              <li>• {t.prize3}</li>
              <li>• {t.prize4}</li>
              <li>• {t.prize5}</li>
              <li>• {t.prize6}</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Winners Section */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-8">{t.winnersTitle}</h2>
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">الاسم</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">رقم الهاتف</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">قيمة الجائزة</th>
                  </tr>
                </thead>
                <tbody>
                  {getCurrentWinners().map((winner, index) => (
                    <tr
                      key={winner.id}
                      className="border-b border-gray-100 transition-smooth"
                      style={{
                        animation: `fadeIn 0.5s ease-in-out ${index * 0.1}s both`,
                      }}
                    >
                      <td className="py-3 px-4 text-gray-800">{winner.name}</td>
                      <td className="py-3 px-4 text-gray-600 font-mono">{winner.phone_masked}</td>
                      <td className="py-3 px-4 text-primary font-semibold">{winner.prize_amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
