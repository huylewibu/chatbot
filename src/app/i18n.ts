// initTranslations.ts
import { createInstance, i18n, Resource } from 'i18next';
import { initReactI18next } from 'react-i18next/initReactI18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import i18nConfig from '../../i18nConfig';

// Khai báo kiểu cho tham số
export default async function initTranslations(
  locale: string,          
  namespaces: string[],    
  i18nInstance?: i18n,      
  resources?: Resource     
) {
  const instance = i18nInstance || createInstance();

  instance.use(initReactI18next);

  if (!resources) {
    instance.use(
      resourcesToBackend(
        // Thêm kiểu (language: string, namespace: string)
        (language: string, namespace: string) =>
          import(`../../locales/${language}/${namespace}.json`)
      )
    );
  }

  await instance.init({
    lng: locale,
    resources,
    // fallbackLng: i18nConfig.defaultLocale,
    fallbackLng: ['vi'],
    supportedLngs: i18nConfig.locales,
    defaultNS: namespaces[0],
    fallbackNS: namespaces[0],
    ns: namespaces,
    preload: resources ? [] : i18nConfig.locales
  });

  return {
    i18n: instance,
    resources: instance.services.resourceStore.data,
    t: instance.t
  };
}
