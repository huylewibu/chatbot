'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "./components/Login";
import { isAuthenticated } from "./services/authService";

const Home = () => {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("accessToken");

      // Kiểm tra token và xác thực
      if (token && isAuthenticated()) {
        router.push("/chat/info");
      } else {
        setLoading(false); // Hiển thị LoginForm
      }
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
