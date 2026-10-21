import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const BATCH_SIZE = 8;

export default function WinnersSection() {
  const { t } = useTranslation();
  const [winners, setWinners] = useState([]);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [fadeKey, setFadeKey] = useState(0);

  useEffect(() => {
    fetch('/api/winners')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setWinners(data.winners);
      })
      .catch(console.error);
  }, []);

  const totalBatches = useMemo(
    () => Math.max(1, Math.ceil(winners.length / BATCH_SIZE)),
    [winners.length]
  );

  useEffect(() => {
    if (winners.length === 0) return;

    const interval = setInterval(() => {
      setCurrentBatch((prev) => {
        const nextBatch = prev + 1;
        return nextBatch >= totalBatches ? 0 : nextBatch;
      });
      setFadeKey((k) => k + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, [totalBatches, winners.length]);

  const visibleWinners = winners.slice(
    currentBatch * BATCH_SIZE,
    currentBatch * BATCH_SIZE + BATCH_SIZE
  );

  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8">
          {t('landing.winners_title')}
        </h2>

        <div key={fadeKey} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 fade-transition">
          {visibleWinners.map((winner, index) => (
            <div
              key={`${winner.name}-${winner.phone_masked}-${index}`}
              className="bg-white rounded-2xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white font-bold">
                  🏆
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{winner.name}</p>
                  <p className="text-sm text-gray-500 ltr-input">{winner.phone_masked}</p>
                </div>
              </div>
              <p className="text-primary-700 font-bold text-lg">{winner.prize}</p>
            </div>
          ))}
        </div>

        {totalBatches > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: totalBatches }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentBatch ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
