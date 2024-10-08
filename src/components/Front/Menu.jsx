import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Menu = () => {
  const [isAuth, setIsAuth] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsAuth(localStorage.getItem("isAuth") === "true");
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isAuth");
    localStorage.removeItem("userId");
    setIsAuth(false);
    navigate("/auth-page");
  };

  return (
    <div className="menu">
      <div className="menu__logo">
        <Link to="/" style={{ textDecoration: "none" }}>
          <p className="logo">Blogsee</p>
        </Link>
      </div>
      <div className="menu__buttons">
        {!isAuth ? (
          <div>access denied</div>
        ) : (
          <div>
            <div className="blogupload__container">
              <div className="blogupload__container__btn">
                <div className="profile__btn">
                  <Link style={{ textDecoration: "none" }} to="/blog-upload">
                    New Blog
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
        {!isAuth ? (
          <Link
            style={{ textDecoration: "none" }}
            to="/auth-page"
            className="menu__button"
          >
            Login
          </Link>
        ) : (
          <>
            <button className="menu__button">
              <Link style={{ textDecoration: "none", color:"white"}} to="/myprofile">Profile</Link>
            </button>
            <button onClick={handleLogout} className="menu__button">
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Menu;
