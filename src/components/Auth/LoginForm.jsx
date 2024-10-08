import React, { useState } from "react";
import axios from "axios";
import CryptoJS from "crypto-js";
import { useNavigate } from "react-router-dom";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isForgotPassword, setForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(""); 

  const navigate = useNavigate(); 

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:5000/login", { email, password });
  
      const encryptedUserId = CryptoJS.AES.encrypt(response.data.userId.toString(), 'secret-key').toString();
      localStorage.setItem("userId", encryptedUserId);
      localStorage.setItem("isAuth", true);
      
      navigate("/blog-page");
    } catch (err) {
      if (err.response && err.response.status === 400) {
        setError("Invalid email or password. Please try again.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  const handleRequestReset = async () => {
    await axios.post("http://localhost:5000/request-reset-password", { email: resetEmail });
    setForgotPassword("verify");
  };

  const handleCancel = async () => {
    setForgotPassword(false)
  };

  const handleResetPassword = async () => {
    if (newPassword === confirmPassword) {
      await axios.post("http://localhost:5000/reset-password", {
        email: resetEmail,
        code: resetCode,
        newPassword,
      });
      setForgotPassword(false); 
    }
  };

  return (
    <div className="login__container">
      <div className="login__logo">
        <h1>{isForgotPassword ? "Reset Password" : "Login"}</h1>
      </div>
      
      {error && <p className="login__error">{error}</p>}

      {!isForgotPassword ? (
        <div className="login__input">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="auth__btn" onClick={handleLogin}>Login</button>
          <p onClick={() => setForgotPassword(true)}>Forgot Password?</p>
        </div>
      ) : isForgotPassword === true ? (
        <div className="login__input">
          <input
            type="email"
            placeholder="Enter your email"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
          />
          <button className="auth__btn" onClick={handleRequestReset}>Send Reset Code</button>
          <button className="auth__btn" onClick={handleCancel}>Cancel</button>
        </div>
      ) : (
        <div className="login__input">
          <input
            type="text"
            placeholder="Enter Reset Code"
            value={resetCode}
            onChange={(e) => setResetCode(e.target.value)}
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button className="auth__btn" style={{ height:"100%"}} onClick={handleResetPassword}>Confirm Password Reset</button>
        </div>
      )}
    </div>
  );
};

export default LoginForm;
