'use client'

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { registerFailure, registerSuccess } from "../store/authSlice/authSlice";
import { RootState } from "../store/app";
import ThemeSwitcher from "../components/ThemeSwitcher";
import { APIService } from "../services/APIServices";
import { ToastContainer, toast } from "react-toastify";

const RegisterForm: React.FC = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [otpArray, setOtpArray] = useState(Array(6).fill(""));
    const [otpCode, setOtpCode] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [timeLeft, setTimeLeft] = useState(300); // 5 phút

    const dispatch = useDispatch();
    const router = useRouter();

    const error = useSelector((state: RootState) => state.auth.error);

    useEffect(() => {
        if (otpSent && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [otpSent, timeLeft]);

    const validateEmail = (email: string): boolean => {
        return /\S+@gmail\.com$/.test(email);
    };

    const validatePassword = (password: string): boolean => {
        // Regex để kiểm tra mật khẩu
        const passwordRegex =
            /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    };

    const handleSendOTP = async () => {
        if (!validateEmail(email)) {
            toast.error("Email không đúng định dạng Gmail.", {autoClose: 3000, pauseOnHover: false});
            return;
        }

        setIsLoading(true);

        try {
            APIService.sendOTPApi({ username, email, password }, (response, error) => {
                if (error) {
                    toast.error(error.message || "Không thể gửi OTP.", {autoClose: 3000, pauseOnHover: false});
                    return;
                }
                if (response) {
                    setOtpSent(true);
                    setTimeLeft(300);
                    toast.success("OTP đã được gửi. Vui lòng kiểm tra email.", {autoClose: 3000, pauseOnHover: false});
                }
            });
        } catch (err) {
            toast.error("Lỗi gửi OTP.", {autoClose: 3000, pauseOnHover: false});
        } finally {
            setIsLoading(false);
        }
    };

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    inputRefs.current = Array(6)
        .fill(null)
        .map((_, i) => inputRefs.current[i] || React.createRef<HTMLInputElement>().current)

    const handleOTPChange = (index: number, value: string) => {
        // Nếu user gõ nhiều ký tự (paste), ta sẽ xử lý trong handlePaste
        if (value.length > 1) return;

        const newOtp = [...otpArray];
        newOtp[index] = value;
        setOtpArray(newOtp);
        setOtpCode(newOtp.join(""));

        // Tự động focus ô kế tiếp nếu còn
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace" && !otpArray[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
        e.preventDefault();
        let pasteData = e.clipboardData.getData("text").slice(0, 6);

        const newOtp = [...otpArray];
        // Bắt đầu điền từ ô hiện tại
        for (let i = index; i < 6; i++) {
            if (!pasteData) break;
            newOtp[i] = pasteData[0];
            pasteData = pasteData.substring(1);
        }
        setOtpArray(newOtp);
        setOtpCode(newOtp.join(""));

        // Focus ô kế cuối cùng đã điền
        let lastFilled = index;
        for (let i = index; i < 6; i++) {
            if (!newOtp[i]) break;
            lastFilled = i;
        }
        if (lastFilled < 5) {
            inputRefs.current[lastFilled + 1]?.focus();
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(registerFailure(null)); // Xóa lỗi trước khi gửi lại

        const errors: string[] = [];

        if (!otpSent) {
            errors.push("Bạn cần gửi mã OTP trước khi đăng ký.");
        }

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
            APIService.registerApi(
                { username, email, password, otpCode },
                (response, error) => {
                    if (error) {
                        toast.error(error.message || "Đăng ký thất bại.", {autoClose: 3000, pauseOnHover: false});
                        return;
                    }

                    if (response) {
                        localStorage.setItem("accessToken", response.access_token);
                        localStorage.setItem("refreshToken", response.refresh_token);

                        dispatch(registerSuccess({ username: response.username, token: response.access_token }));

                        toast.success("Đăng ký thành công!", {autoClose: 3000, pauseOnHover: false});
                        router.push("/chat/info");
                    }
                }
            );
        } catch (err) {
            toast.error("Lỗi đăng ký.", {autoClose: 3000, pauseOnHover: false});
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative flex justify-center items-center min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
            <ToastContainer />
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
                            className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
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
                            className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
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
                            className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full mt-1 p-2 border border-gray-300 rounded-lg"
                        />

                        {otpSent && (
                            <div className="mt-3">
                                {/* Thay vì 1 ô input, ta có 6 ô input OTP */}
                                <div className="flex justify-center space-x-2">
                                    {otpArray.map((digit, i) => (
                                        <input
                                            key={i}
                                            ref={(el) => {
                                                inputRefs.current[i] = el;
                                            }}
                                            type="text"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOTPChange(i, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(e, i)}
                                            onPaste={(e) => handlePaste(e, i)}
                                            className="
                                                w-10 h-10
                                                text-center text-xl
                                                border border-gray-300 
                                                rounded 
                                                focus:outline-none 
                                                focus:ring-2 focus:ring-blue-500
                                                text-black
                                            "
                                        />
                                    ))}
                                </div>

                                <p className="text-sm text-gray-500 mt-2">
                                    OTP hết hạn trong: {Math.floor(timeLeft / 60)}:
                                    {(timeLeft % 60).toString().padStart(2, "0")}
                                </p>
                            </div>
                        )}
                    </div>
                    {error && (
                        <div className="text-sm text-red-500 bg-red-100 p-2 rounded-md">
                            {typeof error === "string" && error}
                        </div>
                    )}

                    <div className="flex space-x-2">
                        {!otpSent ? (
                            <button
                                type="button"
                                onClick={handleSendOTP}
                                className="flex-grow py-3 bg-blue-500 text-white rounded-lg"
                            >
                                Gửi mã OTP tới Email của bạn
                            </button>
                        ) : (
                            <button
                                type="submit"
                                className="flex-grow py-3 bg-green-500 text-white rounded-lg"
                            >
                                Đăng ký
                            </button>
                        )}
                    </div>
                </form>
                <p className="text-sm text-center text-gray-500 mt-6">
                    Already have an account&#63;{" "}
                    <Link href="/login" className="text-blue-500 hover:underline">
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterForm;
