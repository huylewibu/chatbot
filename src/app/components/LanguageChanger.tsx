"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import i18nConfig from "../../../i18nConfig";
import FlagVi from "../assets/flags/vi.png";
import FlagEn from "../assets/flags/en.png";
import Image from "next/image";
import { MdLanguage } from "react-icons/md";

interface I18nConfig {
  locales: string[];
  defaultLocale: string;
  prefixDefault?: boolean;
}

const typedI18nConfig = i18nConfig as I18nConfig;

interface LanguageChangerProps {
  language: string;
  setLanguage: (lang: string) => void;
  isLanguageLoaded: boolean;
  activeDropdown?: boolean;
  toggleDropdown?: () => void;
}

const LanguageChanger: React.FC<LanguageChangerProps> = ({
  setLanguage,
  isLanguageLoaded,
  activeDropdown,
  toggleDropdown,
}) => {
  const { t, i18n } = useTranslation();
  const currentLocale = i18n.language;
  const router = useRouter();
  const currentPathname = usePathname();

  const handleChange = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
    i18n.changeLanguage(lang);

    // set cookie cho next-i18n-router
    const days = 30;
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = date.toUTCString();
    document.cookie = `NEXT_LOCALE=${lang};expires=${expires};path=/`;

    if (
      currentLocale === typedI18nConfig.defaultLocale &&
      !typedI18nConfig.prefixDefault
    ) {
      router.push("/" + lang + currentPathname);
    } else {
      router.push(currentPathname.replace(`/${currentLocale}`, `/${lang}`));
    }

    router.refresh();
  };

  if (!isLanguageLoaded) {
    return null;
  }

  return (
    <div className="relative inline-block text-left mr-3">
      <button
        onClick={toggleDropdown}
        className="inline-flex items-center px-4 py-2 text-sm font-medium
        text-gray-700 bg-background-dark text-text-dark border 
        border-gray-300 rounded-md dark:bg-background-light dark:text-text-light
        shadow-sm focus:outline-none"
      >
        <MdLanguage className="w-4 h-4 mr-2" />
        {t("Language")}
        {/* Mũi tên dropdown (optional) */}
        <svg
          className="w-4 h-4 ml-2"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.67l3.71-3.44a.75.75 0 111.04 1.08l-4.24 3.93a.75.75 0 01-1.04 0L5.21 8.27a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Nội dung dropdown (hiển thị khi activeDropdown = true) */}
      {activeDropdown && (
        <div
          className="
          absolute left-0 z-10 mt-2 w-36
          origin-top-right rounded-md bg-white text-gray-900 
          dark:bg-gray-800 dark:text-white 
          shadow-lg border border-gray-300 dark:border-gray-600
          "
        >
          <div className="py-1">
            <button
              onClick={() => handleChange("en")}
              className="
                flex items-center w-full px-4 py-2 text-sm text-gray-700 
                hover:bg-gray-100 hover:text-gray-900 dark:text-white
              "
            >
              <Image className="w-5 h-5 mr-2" src={FlagEn} alt="English" />
              {t("English")}
            </button>
            <button
              onClick={() => handleChange("vi")}
              className="
                flex items-center w-full px-4 py-2 text-sm text-gray-700 
                hover:bg-gray-100 hover:text-gray-900 dark:text-white
              "
            >
              <Image className="w-5 h-5 mr-2" src={FlagVi} alt="Vietnamese" />
              {t("Vietnamese")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageChanger;
