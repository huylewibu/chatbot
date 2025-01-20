'use client';

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isAuthenticated, refreshAccessToken } from "../services/authService"

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                if (!isAuthenticated()) {
                    router.push("/login");
                } else {
                    await refreshAccessToken();
                }
            } catch {
                router.push("/login");
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    if (loading) {
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin"></div>
        </div> // Hiển thị loading trong khi kiểm tra
    }

    return <>{children}</>; // Hiển thị component con nếu xác thực thành công
};

export default RequireAuth;
