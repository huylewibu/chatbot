"use client";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/app";
import { useRouter } from "next/navigation";
import { logout } from "../store/authSlice/authSlice";
import React, { useEffect, useState } from "react";
import ThemeSwitcher from "./ThemeSwitcher";
import { resetChat } from "../store/chatSlice/chatSlice";
import LanguageChanger from "./LanguageChanger";
import { useTranslation } from "react-i18next";

const UserInfo: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const [language, setLanguage] = useState("");
  const [isLanguageLoaded, setIsLanguageLoaded] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(false);
  const { t, i18n } = useTranslation();

  const handleLogout = () => {
    dispatch(logout());
    dispatch(resetChat());
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    router.push("/login");
  };

  useEffect(() => {
    if (language) {
      i18n.changeLanguage(language);
    }
  }, [language]);

  useEffect(() => {
    const storedLanguage = localStorage.getItem("language");
    if (storedLanguage) {
      setLanguage(storedLanguage);
    } else {
      setLanguage("vi");
    }
    setIsLanguageLoaded(true);
  }, []);

  const toggleMobileNav = () => {
    setIsMobileNavOpen(!isMobileNavOpen);
  };

  const toggleDropdown = () => {
    setActiveDropdown(!activeDropdown);
  };

  return (
    <div className="min-h-screen bg-background-light text-text-light dark:bg-background-dark dark:text-text-dark">
      <div className="absolute top-4 right-4 flex items-center space-x-4">
        <div className="z-50">
          <LanguageChanger
            language={language}
            setLanguage={setLanguage}
            isLanguageLoaded={isLanguageLoaded}
            activeDropdown={activeDropdown}
            toggleDropdown={toggleDropdown}
          />
        </div>
        <ThemeSwitcher />
        <p className="text-sm font-medium">{t(`Welcome Back`)}, {user?.username}</p>
        <button
          onClick={handleLogout}
          className="z-50 px-4 text-sm rounded-md hover:bg-gray-300 transition duration-300"
        >
          {t("Logout")}
        </button>
      </div>
      {children}
    </div>
  );
};

export default UserInfo;
