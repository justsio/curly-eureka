'use client';

import { useState, useEffect } from 'react';

export default function LanguageSwitcher() {
  const [currentLang, setCurrentLang] = useState<'ar' | 'fr'>('ar');

  useEffect(() => {
    // Load language from localStorage on mount
    const savedLang = localStorage.getItem('language') as 'ar' | 'fr' || 'ar';
    setCurrentLang(savedLang);
    if (typeof window !== 'undefined') {
      document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = savedLang;
    }
  }, []);

  const toggleLanguage = () => {
    const newLang = currentLang === 'ar' ? 'fr' : 'ar';
    setCurrentLang(newLang);
    
    // Update HTML dir and lang attributes
    if (typeof window !== 'undefined') {
      document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = newLang;
    }
    
    // Store in localStorage
    localStorage.setItem('language', newLang);
    
    // Reload page to update all translations
    window.location.reload();
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow"
    >
      <span className="text-lg">
        {currentLang === 'ar' ? '🇦🇪' : '🇫🇷'}
      </span>
      <span className="font-medium">
        {currentLang === 'ar' ? 'العربية' : 'Français'}
      </span>
    </button>
  );
}
