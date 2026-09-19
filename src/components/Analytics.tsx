"use client";

import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
import Script from "next/script";

function isRealGaId(id: string | undefined): id is string {
  if (!id) return false;
  // Ignore placeholders from .env.example
  if (/X{3,}/i.test(id) || id === "G-XXXXXXXX") return false;
  return /^G-[A-Z0-9]+$/i.test(id);
}

export function Analytics() {
  const ga = process.env.NEXT_PUBLIC_GA_ID;
  const enableGa = process.env.NODE_ENV === "production" && isRealGaId(ga);

  return (
    <>
      <VercelAnalytics />
      {enableGa && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga}');`}
          </Script>
        </>
      )}
    </>
  );
}
