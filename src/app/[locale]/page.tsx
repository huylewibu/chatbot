'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "../components/Login";
import { isAuthenticated } from "../services/authService";

const Home = () => {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      // Kiểm tra token và xác thực
      try {
        const token = localStorage.getItem("accessToken");

        if (token) {
          const authStatus = await isAuthenticated(); 
          if (authStatus) {
            router.push("/chat/info"); 
            return;
          }
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      }
      // Nếu không có token hoặc xác thực thất bại
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return <LoginForm />;
};

export default Home;
