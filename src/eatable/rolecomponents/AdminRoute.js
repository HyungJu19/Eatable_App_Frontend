import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // 수정된 부분

// 사용자의 권한을 체크하는 함수
const checkAdminRole = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  
  try {
    const decoded = jwtDecode(token);
    const roles = decoded.auth ? decoded.auth.split(",") : [];
    console.log(decoded)
    console.log(token)
    return roles.includes("ROLE_ADMIN");
  } catch (error) {
    console.error("토큰 디코딩 중 오류 발생:", error);
    return false;
  }
};

const AdminRoute = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!checkAdminRole()) {
      navigate("/roleErrorPage"); // 권한이 없으면 Forbidden 페이지로 리다이렉트
    }
  }, [navigate]);

  return children;
};

export default AdminRoute;
