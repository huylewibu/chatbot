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
  const { locale } = params;
  const { t } = await initTranslations(locale, ['ChatbotDemoWebApp']);

  return {
    title: t("metadata.title", { defaultValue: "Chatbot Demo Web App" }),
    description: t("metadata.description", { defaultValue: "Generated by create next app" }),
    openGraph: {
      title: t("metadata.title", { defaultValue: "Chatbot Demo Web App" }),
      description: t("metadata.description", { defaultValue: "Generated by create next app" }),
      url: `https://www.chatbothuyleui.xyz/${locale}`,
      type: "website",
      locale: locale,
      images: [
        {
          url: "https://www.chatbothuyleui.xyz/og-image.jpg",
          width: 1200,
          height: 630,
          alt: t("metadata.imageAlt", { defaultValue: "Chatbot Demo Image" }),
        },
      ],
    },
  };
}

const RootLayout = async ({ children, params}: RootLayoutProps) => {
  const { locale } = await params;
  const { t, resources } = await initTranslations(locale, i18nNamespaces);

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
