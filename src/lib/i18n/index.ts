import { create } from "zustand";
import { persist } from "zustand/middleware";
import { translations, type Locale, type TranslationKeys, LOCALE_NAMES } from "./translations";

export type { Locale, TranslationKeys };
export { LOCALE_NAMES };

interface I18nState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useI18nStore = create<I18nState>()(
  persist(
    (set) => ({
      locale: "de",
      setLocale: (locale) => set({ locale }),
    }),
    { name: "iptv-trex-i18n" }
  )
);

/**
 * Translation hook. Usage:
 * ```
 * const t = useT();
 * <p>{t("nav.home")}</p>
 * ```
 */
export function useT(): (key: keyof TranslationKeys) => string {
  const locale = useI18nStore((s) => s.locale);
  return (key: keyof TranslationKeys) => {
    return translations[locale]?.[key] ?? translations.de[key] ?? key;
  };
}
