import { useEffect } from 'react';

interface GoogleTranslateElement {
  TranslateElement: new (
    options: { pageLanguage: string },
    elementId: string
  ) => void;
}

interface GoogleTranslate {
  translate: GoogleTranslateElement;
}

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate?: GoogleTranslateElement;
    };
  }
}

interface GoogleTranslateProps {
  containerId?: string;
}

export function GoogleTranslate({ 
  containerId = "google_translate_element" 
}: GoogleTranslateProps) {
  useEffect(() => {
    // 1. Define the Init Function (Supporting both IDs if they exist)
    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        // Init the standard one
        const el1 = document.getElementById('google_translate_element');
        if (el1 && !el1.querySelector('.goog-te-gadget')) {
          new window.google.translate.TranslateElement({pageLanguage: 'en'}, 'google_translate_element');
        }
        // Init the sidebar one
        const el2 = document.getElementById('google_translate_sidebar');
        if (el2 && !el2.querySelector('.goog-te-gadget')) {
          new window.google.translate.TranslateElement({pageLanguage: 'en'}, 'google_translate_sidebar');
        }
      }
    };

    // 2. Load Script
    const scriptId = 'google-translate-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.type = 'text/javascript';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    } else if (window.google?.translate?.TranslateElement) {
      // If already loaded, trigger init manually
      window.googleTranslateElementInit();
    }
  }, []);

  return (
    <div className="relative group z-50">
      <div 
        id={containerId} 
        className="google-translate-container overflow-hidden rounded-md border border-input bg-background shadow-sm hover:border-accent hover:bg-accent/50 transition-colors" 
      />
      <div className="absolute inset-y-0 right-2 pointer-events-none flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground opacity-70"><path d="m6 9 6 6 6-6"/></svg>
      </div>
      <style>{`
        /* Hide everything we don't need */
        .goog-te-banner-frame, iframe.skiptranslate { display: none !important; }
        body { top: 0px !important; }
        .goog-logo-link { display: none !important; }
        .goog-te-gadget { color: transparent !important; font-size: 0 !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }
        .goog-te-gadget > span { display: none !important; }
        .goog-te-gadget > div { display: block !important; width: 100% !important; }
        
        /* Style the Select Dropdown */
        .goog-te-combo {
          width: 100% !important;
          height: 36px !important;
          background-color: transparent !important;
          border: none !important;
          color: hsl(var(--foreground)) !important;
          font-family: inherit !important;
          font-size: 13px !important;
          font-weight: 500 !important;
          padding: 0 30px 0 12px !important;
          margin: 0 !important;
          cursor: pointer !important;
          outline: none !important;
          appearance: none !important; /* Hide default arrow */
          -webkit-appearance: none !important;
          box-shadow: none !important;
        }

        /* Dropdown Options */
        .goog-te-combo option {
          background-color: hsl(var(--popover)) !important;
          color: hsl(var(--popover-foreground)) !important;
          padding: 8px !important;
        }

        /* Container Adjustment for Sidebar */
        #google_translate_sidebar .goog-te-combo {
            height: 32px !important;
            font-size: 12px !important;
        }
      `}</style>
    </div>
  );
}
