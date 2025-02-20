'use client'

import React, { useState, useEffect } from "react";
import { FaMoon, FaSun } from "react-icons/fa";

const ThemeSwitcher = () => {
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "dark") {
            setDarkMode(true);
            document.documentElement.classList.add("dark");
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = darkMode ? "light" : "dark";
        setDarkMode(!darkMode);
        localStorage.setItem("theme", newTheme);

        if (newTheme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    };

    return (
        <button
            onClick={toggleTheme}
            className="px-4 z-50 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 transition"
        >
            {darkMode ? <FaSun /> : <FaMoon />}
        </button>
    );
};

export default ThemeSwitcher;
