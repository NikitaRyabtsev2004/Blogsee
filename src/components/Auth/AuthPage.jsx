import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { useState } from "react";
import Header from "../Front/Header";
import Menu from "../Front/Menu";

const AuthPage = () => {
  const [isPressed, setPressed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const isAuth = localStorage.getItem("isAuth");
    if (isAuth === "true") {
      navigate("/blog-page");
    }
  }, [navigate]);

  const handleClick = () => {
    setPressed(!isPressed);
  };

  return (
    <div className="AuthPage">
      <Menu />
      <div className="blur">
        <Header />
        <div
          className={isPressed ? "auth__container" : "auth__container__reverse"}
        >
          <button onClick={handleClick}>
            {isPressed ? (
              <div className="auth__button">Register</div>
            ) : (
              <div className="auth__button">Login</div>
            )}
          </button>
          {isPressed ? <LoginForm /> : <RegisterForm />}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
