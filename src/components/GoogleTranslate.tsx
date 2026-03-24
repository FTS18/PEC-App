import { useEffect, useMemo, useRef, useState } from 'react';

interface GoogleTranslateElement {
  TranslateElement: {
    new (
      options: { pageLanguage: string; layout?: any; autoDisplay?: boolean; includedLanguages?: string },
      elementId: string
    ): void;
    InlineLayout: {
      SIMPLE: any;
      HORIZONTAL: any;
      VERTICAL: any;
    };
  };
}

interface GoogleTranslate {
  translate: GoogleTranslateElement;
}

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    __googleTranslateCustomInit?: () => void;
    google?: {
      translate?: GoogleTranslateElement;
    };
  }
}

interface GoogleTranslateProps {
  containerId?: string;
}

const languageOptions = [
  { value: 'en', nativeLabel: 'English', flag: '🇬🇧' },
  { value: 'hi', nativeLabel: 'हिन्दी', flag: '🇮🇳' },
  { value: 'fr', nativeLabel: 'Français', flag: '🇫🇷' },
  { value: 'es', nativeLabel: 'Español', flag: '🇪🇸' },
  { value: 'de', nativeLabel: 'Deutsch', flag: '🇩🇪' },
  { value: 'zh-CN', nativeLabel: '简体中文', flag: '🇨🇳' },
  { value: 'ja', nativeLabel: '日本語', flag: '🇯🇵' },
  { value: 'ar', nativeLabel: 'العربية', flag: '🇸🇦' },
];

const LANGUAGE_STORAGE_KEY = 'ui.language';

export function GoogleTranslate({ 
  containerId = "google_translate_element" 
}: GoogleTranslateProps) {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const selectedLanguageRef = useRef('en');
  const applyRequestIdRef = useRef(0);
  const widgetInitializedRef = useRef(false);

  const includedLanguages = useMemo(
    () => languageOptions.map((language) => language.value).join(','),
    [],
  );

  const applyLanguage = (language: string) => {
    const combo = document.querySelector<HTMLSelectElement>(`#${containerId} .goog-te-combo`);
    if (!combo) {
      return false;
    }

    combo.value = language;
    combo.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  };

  const applyLanguageWithRetry = (language: string) => {
    const maxAttempts = 20; // Increased attempts
    let attempts = 0;
    const requestId = ++applyRequestIdRef.current;

    const tryApply = () => {
      if (requestId !== applyRequestIdRef.current) {
        return;
      }

      attempts += 1;
      const applied = applyLanguage(language);
      if (applied || attempts >= maxAttempts) {
        return;
      }
      window.setTimeout(tryApply, 150);
    };

    tryApply();
  };

  const readLanguageFromCookie = () => {
    const cookie = document.cookie
      .split('; ')
      .find((item) => item.startsWith('googtrans='));
    if (!cookie) {
      return 'en';
    }

    const value = decodeURIComponent(cookie.split('=')[1] || '');
    const target = value.split('/').pop();
    return target || 'en';
  };

  const setGoogtransCookie = (language: string) => {
    const host = window.location.hostname;
    const isLocalhost = host === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(host);
    const cookieDomain = !isLocalhost ? `;domain=.${host}` : '';
    const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();

    if (language === 'en') {
      // Set to /en/en then clear to ensure it resets
      document.cookie = `googtrans=/en/en;expires=${expires};path=/`;
      document.cookie = `googtrans=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
      if (!isLocalhost) {
        document.cookie = `googtrans=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=.${host}`;
        document.cookie = `googtrans=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=${host}`;
      }
      return;
    }

    const normalized = `/en/${language}`;
    const encoded = encodeURIComponent(normalized);

    document.cookie = `googtrans=${encoded};expires=${expires};path=/`;
    if (!isLocalhost) {
      document.cookie = `googtrans=${encoded};expires=${expires};path=/;domain=.${host}`;
    }
  };

  const readPreferredLanguage = () => {
    const fromStorage = typeof window !== 'undefined' ? window.localStorage.getItem(LANGUAGE_STORAGE_KEY) : null;
    if (fromStorage && languageOptions.some((option) => option.value === fromStorage)) {
      return fromStorage;
    }

    // Default to 'en' explicitly if no preference is found
    return 'en';
  };

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    selectedLanguageRef.current = language;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      if (language === 'en') {
        document.documentElement.setAttribute('translate', 'no');
      } else {
        document.documentElement.removeAttribute('translate');
      }
    }
    setGoogtransCookie(language);
  };

  useEffect(() => {
    const initWidget = () => {
      if (window.google?.translate?.TranslateElement) {
        const element = document.getElementById(containerId);
        if (element && !widgetInitializedRef.current) {
          element.innerHTML = '';
          new window.google.translate.TranslateElement(
            { 
              pageLanguage: 'en', 
              autoDisplay: false,
              includedLanguages,
            }, 
            containerId
          );
          widgetInitializedRef.current = true;
        }
      }
    };

    if (window.google?.translate?.TranslateElement) {
      initWidget();
    }

    const handleReady = () => {
      initWidget();
      applyLanguageWithRetry(selectedLanguageRef.current);
    };
    window.addEventListener('google-translate-ready', handleReady);

    const initialLanguage = readPreferredLanguage();
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, initialLanguage);
      if (initialLanguage === 'en') {
        document.documentElement.setAttribute('translate', 'no');
      } else {
        document.documentElement.removeAttribute('translate');
      }
    }
    setSelectedLanguage(initialLanguage);
    selectedLanguageRef.current = initialLanguage;
    setGoogtransCookie(initialLanguage);

    const syncTimeout = window.setTimeout(() => {
      applyLanguageWithRetry(initialLanguage);
    }, 250);
    
    return () => {
      window.removeEventListener('google-translate-ready', handleReady);
      window.clearTimeout(syncTimeout);
    };
  }, [containerId, includedLanguages]);

  useEffect(() => {
    applyLanguageWithRetry(selectedLanguage);
  }, [selectedLanguage]);

  return (
    <div className="relative z-50">
      <label className="sr-only" htmlFor={`${containerId}-custom-select-trigger`}>
        Select language
      </label>
      <div className="relative" translate="no">
        <select
          id={`${containerId}-custom-select-trigger`}
          aria-label="Select language"
          value={selectedLanguage}
          onChange={(event) => handleLanguageChange(event.target.value)}
          className="h-9 min-w-[150px] rounded-md border border-border bg-background px-3 pr-8 text-xs font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {languageOptions.map((language) => (
            <option key={language.value} value={language.value}>
              {language.flag} {language.nativeLabel}
            </option>
          ))}
        </select>
      </div>

      <div 
        id={containerId} 
        className="google-translate-container pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0" 
      />
      
      <style>{`
        /* Hide Google Translate UI chrome; we only want our custom picker */
        .goog-te-banner-frame,
        .goog-te-banner-frame.skiptranslate,
        .goog-te-balloon-frame,
        iframe.goog-te-banner-frame,
        iframe.goog-te-banner-frame.skiptranslate,
        iframe.goog-te-balloon-frame,
        .VIpgJd-ZVi9od-ORHb-OEVmcd,
        .VIpgJd-ZVi9od-aZ2wEe-wOHMyf,
        .VIpgJd-ZVi9od-l4eHX-hSRGPd {
          display: none !important;
          visibility: hidden !important;
        }

        .goog-logo-link {
          display: none !important;
        }

        body { top: 0px !important; }
        html { margin-top: 0 !important; }
        
        /* Keep Google widget hidden; we drive it from custom select */
        .goog-te-gadget {
          font-size: 0 !important;
          color: transparent !important;
          visibility: hidden !important;
        }
        
        .goog-te-combo {
          visibility: hidden !important;
          height: 0 !important;
          width: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
          border: 0 !important;
        }

        /* Hide all other Google clutter */
        .goog-te-gadget span {
          display: none !important;
        }
        
        .goog-te-gadget-simple {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
