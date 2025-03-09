import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ProviderWrapper from "./ProviderWrapper";
import { ReactNode } from 'react';
import i18nConfig from "../../../i18nConfig";
import initTranslations from "../i18n";
import { dir } from 'i18next';
import TranslationsProvider from "../components/TranslationsProvider";

interface RootLayoutProps {
  children: ReactNode;
  params: {
    locale: string;
  };
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const i18nNamespaces = ['ChatbotDemoWebApp'];

export function generateStaticParams() {
  return i18nConfig.locales.map(locale => ({ locale }));
}

export async function generateMetadata({ params }: RootLayoutProps) {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ['ChatbotDemoWebApp']);

  return {
    title: t("metadata.title", { defaultValue: t("metadata.title") }),
    description: t("metadata.description", { defaultValue: t("metadata.description") }),
    openGraph: {
      title: t("metadata.title", { defaultValue: t("metadata.title") }),
      description: t("metadata.description", { defaultValue: t("metadata.description") }),
      url: `https://www.chatbothuyleui.xyz/${locale}`,
      type: "website",
      locale: locale,
      images: [
        {
          url: "https://www.chatbothuyleui.xyz/images/Yui.jpg",
          width: 1200,
          height: 630,
          alt: t("metadata.imageAlt", { defaultValue: "Chatbot Demo Image" }),
        },
      ],
    },
    icon: {
      icon: "/images/favicon.png"
    }
  };
}

const RootLayout = async ({ children, params}: RootLayoutProps) => {
  const { locale } = await params;
  const { resources } = await initTranslations(locale, i18nNamespaces);

  return (
    <html lang={locale} dir={dir(locale)}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TranslationsProvider resources={resources} locale={locale} namespaces={i18nNamespaces}>
          <ProviderWrapper>
            {children}
          </ProviderWrapper>
        </TranslationsProvider>
      </body>
    </html>
  );
}

export default RootLayout
