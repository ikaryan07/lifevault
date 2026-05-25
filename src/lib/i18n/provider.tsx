"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { type Locale, t as translate, getDirection } from "./translations";

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
}

const I18nContext = createContext<I18nContextType>({
  locale: "en",
  setLocale: () => {},
  t: (key) => key,
  dir: "ltr",
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window === "undefined") return "en";
    return (localStorage.getItem("homepin:locale") as Locale) || "en";
  });

  function handleSetLocale(newLocale: Locale) {
    setLocale(newLocale);
    localStorage.setItem("homepin:locale", newLocale);
    document.documentElement.dir = getDirection(newLocale);
    document.documentElement.lang = newLocale;
  }

  function tFn(key: string) {
    return translate(key as any, locale);
  }

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale: handleSetLocale,
        t: tFn,
        dir: getDirection(locale),
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
