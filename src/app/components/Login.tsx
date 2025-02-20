'use client'

import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { loginSuccess, loginFailure } from "../store/authSlice/authSlice";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ThemeSwitcher from "./ThemeSwitcher";
import { APIService } from "../services/APIServices";
import { useTranslation } from "react-i18next";
import LanguageChanger from "./LanguageChanger";

const LoginForm: React.FC = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { t, i18n } = useTranslation();
    const [language, setLanguage] = useState("");
    const [isLanguageLoaded, setIsLanguageLoaded] = useState(false);
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(false);

    const dispatch = useDispatch();
    const router = useRouter();

    useEffect(() => {
        if (language) {
            i18n.changeLanguage(language);
        }
    }, [language]);

    useEffect(() => {
        const storedLanguage = localStorage.getItem('language');
        if (storedLanguage) {
            setLanguage(storedLanguage);
        } else {
            setLanguage('vi');
        }
        setIsLanguageLoaded(true);
    }, []);

    const toggleMobileNav = () => {
        setIsMobileNavOpen(!isMobileNavOpen);
    };

    const toggleDropdown = () => {
        setActiveDropdown(!activeDropdown);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            APIService.getAuthToken(
                { username, password },
                (response, error) => {
                    if (error) {
                        console.log(error);
                        const message =
                            error.response?.data?.detail || "Invalid username or password!";
                        setError(message);
                        dispatch(loginFailure(message));
                        setIsLoading(false);
                        return;
                    }

                    if (response) {
                        localStorage.setItem("accessToken", response.access);
                        localStorage.setItem("refreshToken", response.refresh);
                        const userInfo = {
                            username: response.username,
                            email: response.email,
                            last_login: response.last_login,
                        };

                        dispatch(loginSuccess(userInfo));

                        router.push("/chat/info"); // Điều hướng sau khi login
                    }
                }
            );
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const message =
                    err.response?.data?.detail || "Invalid username or password!";
                setError(message);
                dispatch(loginFailure(message));
            } else {
                console.error("Unexpected error:", error);
                setError("An unexpected error occurred. Please try again later.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative flex justify-center items-center min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
            <div className="absolute top-4 right-4">
                <LanguageChanger
                    language={language}
                    setLanguage={setLanguage}
                    isLanguageLoaded={isLanguageLoaded}
                    activeDropdown={activeDropdown}
                    toggleDropdown={toggleDropdown}
                />
                <ThemeSwitcher />
            </div>
            <div className="w-full max-w-md p-8 bg-white shadow-md rounded-lg">
                <h1 className="text-2xl font-bold text-center mb-6 text-gray-700">{t("Login")}</h1>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label
                            htmlFor="username"
                            className="block text-sm font-medium text-gray-700"
                        >
                            {t("Username")}
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700"
                        >
                            {t("Password")}
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                        />
                    </div>
                    {error && (
                        <div className="text-sm text-red-500 bg-red-100 p-3 rounded-md">
                            {error}
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-4 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        {isLoading ? t("Logging in...") : t("Login")}
                    </button>
                </form>
                <p className="text-sm text-center text-gray-500 mt-6">
                    {t("Don't have an account?")}{" "}
                    <Link href="/register" className="text-blue-500 hover:underline">
                        {t('Register here')}
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginForm;
