import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { makeT } from '../i18n/translations';

const LS_KEY = 'verdikt_language';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const stored = localStorage.getItem(LS_KEY);
    return stored === 'it' || stored === 'es' ? stored : 'en';
  });

  const setLang = useCallback((l) => {
    localStorage.setItem(LS_KEY, l);
    setLangState(l);
  }, []);

  const t = useMemo(() => makeT(lang), [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
