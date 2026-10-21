import { createContext, useContext, useState, useEffect } from 'react';

const ContestContext = createContext(null);

export function ContestProvider({ children }) {
  const [phone, setPhone] = useState('');
  const [entryCode, setEntryCode] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPhone = sessionStorage.getItem('contest_phone');
      const savedCode = sessionStorage.getItem('contest_entryCode');
      if (savedPhone) setPhone(savedPhone);
      if (savedCode) setEntryCode(savedCode);
    }
  }, []);

  const updateRegistration = (newPhone, newEntryCode) => {
    setPhone(newPhone);
    setEntryCode(newEntryCode);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('contest_phone', newPhone);
      sessionStorage.setItem('contest_entryCode', newEntryCode);
    }
  };

  const clearRegistration = () => {
    setPhone('');
    setEntryCode('');
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('contest_phone');
      sessionStorage.removeItem('contest_entryCode');
    }
  };

  return (
    <ContestContext.Provider
      value={{ phone, entryCode, updateRegistration, clearRegistration }}
    >
      {children}
    </ContestContext.Provider>
  );
}

export function useContest() {
  const context = useContext(ContestContext);
  if (!context) {
    throw new Error('useContest must be used within ContestProvider');
  }
  return context;
}
