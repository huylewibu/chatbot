'use client'

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/app";
import { useRouter } from "next/navigation";
import { logout } from "../store/authSlice/authSlice";
import React from "react";
import ThemeSwitcher from "./ThemeSwitcher";

const UserInfo: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-background-light text-text-light dark:bg-background-dark dark:text-text-dark">
      <div className="absolute top-4 right-4 flex items-center space-x-4">
        <ThemeSwitcher />
        <p className="text-sm font-medium">
          Xin chào, {user?.username}
        </p>
        <button
          onClick={handleLogout}
          className="z-50 px-4 text-sm rounded-md hover:bg-gray-300 transition duration-300"
        >
          Đăng xuất
        </button>
      </div>
      {children}
    </div>
  );
};

export default UserInfo;
