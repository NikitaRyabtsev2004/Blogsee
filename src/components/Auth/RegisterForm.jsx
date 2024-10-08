import React, { useState } from "react";
import axios from "axios";

const RegisterForm = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const hasEmptyFields = () => {
    return !email || !username || !password || !confirmPassword;
  };

  const handleRegister = async () => {
    if (hasEmptyFields()) {
      alert("Please fill out all fields!");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/register", {
        email,
        username,
        password,
      });

      if (response.data.message) {
        alert(response.data.message);
        setVerificationSent(true);
      }
    } catch (error) {
      console.error(error.response.data);
      alert("Registration failed. Please try again.");
    }
  };

  const handleVerify = async () => {
    if (!verificationCode) {
      alert("Please enter a verification code!");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/verify-email", {
        email,
        code: verificationCode,
      });

      if (response.data.message) {
        alert(response.data.message);
        setIsVerified(true);
      }
    } catch (error) {
      console.error(error.response.data);
      alert("Invalid verification code. Please try again.");
    }
  };

  return (
    <div className="register__container">
      <div className="register__logo">
        <h1>Register</h1>
      </div>

      {!verificationSent ? (
        <div className="register__input">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button onClick={handleRegister}>Register</button>
        </div>
      ) : !isVerified ? (
        <div className="verification__input">
          <input
            type="text"
            placeholder="Enter verification code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
          />
          <button onClick={handleVerify}>Verify Account</button>
        </div>
      ) : (
        <div className="register__success">
          <p>Account successfully verified! You can now log in.</p>
        </div>
      )}
    </div>
  );
};

export default RegisterForm;
