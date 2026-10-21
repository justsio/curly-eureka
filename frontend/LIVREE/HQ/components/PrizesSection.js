import { useTranslation } from 'react-i18next';

const PRIZE_KEYS = ['cash_1', 'cash_2', 'cash_3', 'phone', 'tv', 'fridge'];
const PRIZE_ICONS = ['💰', '💵', '🪙', '📱', '📺', '🧊'];

export default function PrizesSection() {
  const { t } = useTranslation();

  return (
    <section className="py-12 px-4 bg-white/60">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8">
          {t('landing.prizes_title')}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {PRIZE_KEYS.map((key, index) => (
            <div
              key={key}
              className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 text-center hover:scale-105 transition-transform"
            >
              <span className="text-4xl mb-3 block">{PRIZE_ICONS[index]}</span>
              <p className="font-semibold text-gray-800">{t(`prizes.${key}`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
