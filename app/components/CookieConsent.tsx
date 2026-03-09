"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "cookie-consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setVisible(true);
    } else if (stored === "granted") {
      updateConsent("granted");
    }
  }, []);

  function updateConsent(value: "granted" | "denied") {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: value,
      });
    }
  }

  function accept() {
    localStorage.setItem(STORAGE_KEY, "granted");
    updateConsent("granted");
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, "denied");
    updateConsent("denied");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white px-4 py-4 shadow-lg sm:px-6">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <p className="text-sm text-slate-600">
          Vi använder cookies för att förstå hur sajten används och göra den bättre.
          Ingen data säljs vidare.
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            onClick={decline}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Bara nödvändiga
          </button>
          <button
            onClick={accept}
            className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500"
          >
            Acceptera
          </button>
        </div>
      </div>
    </div>
  );
}
