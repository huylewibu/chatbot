'use client'

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import API_ENDPOINTS from "../api/apiEndpoints";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { registerFailure, registerSuccess } from "../store/authSlice/authSlice";
import { RootState } from "../store/app";
import ThemeSwitcher from "../components/ThemeSwitcher";

const RegisterForm: React.FC = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const dispatch = useDispatch();
    const router = useRouter();

    const error = useSelector((state: RootState) => state.auth.error);

    const validateEmail = (email: string): boolean => {
        return /\S+@gmail\.com$/.test(email);
    };

    const validatePassword = (password: string): boolean => {
        // Regex để kiểm tra mật khẩu
        const passwordRegex =
            /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(registerFailure(null)); // Xóa lỗi trước khi gửi lại

        const errors: string[] = [];

        if (password !== confirmPassword) {
            errors.push("Password không khớp.");
        }
        if (!validateEmail(email)) {
            errors.push("Email không đúng định dạng Gmail.");
        }
        if (!validatePassword(password)) {
            errors.push("Password không đủ mạnh.");
        }

        if (errors.length > 0) {
            dispatch(registerFailure(errors.join(" ")));
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post(API_ENDPOINTS.AUTH_REGISTER, {
                username,
                email,
                password,
            });

            localStorage.setItem("accessToken", response.data.access_token);
            localStorage.setItem("refreshToken", response.data.refresh_token);

            dispatch(
                registerSuccess({
                    username: response.data.username,
                    token: response.data.access_token,
                })
            );

            router.push("/chat/info"); // Chuyển về trang Login sau khi đăng ký thành công
        } catch (err: unknown) {
            if (axios.isAxiosError(err) && err.response) {
                dispatch(registerFailure(err.response.data?.error || "Registration failed"));
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative flex justify-center items-center min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
            <div className="absolute top-4 right-4">
                <ThemeSwitcher />
            </div>
            <div className="w-full max-w-md p-8 bg-white shadow-md rounded-lg">
                <h1 className="text-2xl font-bold text-center mb-6 text-gray-700">Register</h1>
                <form onSubmit={handleRegister} className="space-y-6">
                    <div>
                        <label
                            htmlFor="username"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Username
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
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Password
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
                    <div>
                        <label
                            htmlFor="confirmPassword"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Confirm Password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
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
                        {isLoading ? "Registering..." : "Register"}
                    </button>
                </form>
                {/* eslint-disable-next-line react/no-unescaped-entities */}
                <p className="text-sm text-center text-gray-500 mt-6">
                    Already have an account?
                    <Link href="/login" className="text-blue-500 hover:underline">
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterForm;
