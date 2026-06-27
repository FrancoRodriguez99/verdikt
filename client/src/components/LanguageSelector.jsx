import { useLang } from '../contexts/LanguageContext';

const LANGS = ['en', 'it', 'es'];

export default function LanguageSelector() {
  const { lang, setLang } = useLang();

  return (
    <div className="lang-selector">
      {LANGS.map(l => (
        <button
          key={l}
          className={`lang-btn${lang === l ? ' active' : ''}`}
          onClick={() => setLang(l)}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
