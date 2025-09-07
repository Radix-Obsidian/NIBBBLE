'use client';

import Script from 'next/script';

export default function HotjarScript() {
  const handleError = (error: Error) => {
    console.warn('Hotjar script failed to load (likely blocked by ad blocker):', error);
  };

  return (
    <Script
      id="hotjar-script"
      strategy="afterInteractive"
      onError={handleError}
      dangerouslySetInnerHTML={{
        __html: `
          (function(h,o,t,j,a,r){
            try {
              h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
              h._hjSettings={hjid:6512561,hjsv:6};
              a=o.getElementsByTagName('head')[0];
              r=o.createElement('script');
              r.async=1;
              r.onerror=function(){console.warn('Hotjar external script blocked by ad blocker or network')};
              r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
              a.appendChild(r);
            } catch (e) {
              console.warn('Hotjar initialization failed:', e);
            }
          })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
        `,
      }}
    />
  );
}