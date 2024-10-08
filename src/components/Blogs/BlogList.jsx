import React, { useState, useEffect } from "react";
import BlogItem from "./BlogItem";
import Menu from "../Front/Menu";
import { Link } from "react-router-dom";
import CryptoJS from "crypto-js";
import axios from "axios";
import ProfilePreview from "../Profile/ProfilePreview";

const BlogList = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [posts, setPosts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null); 

  const userId = CryptoJS.AES.decrypt(
    localStorage.getItem("userId"),
    "secret-key"
  ).toString(CryptoJS.enc.Utf8);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get("http://localhost:5000/posts");
        setPosts(response.data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    setIsAuth(localStorage.getItem("isAuth") === "true");
  }, []);

  const handleOpenProfile = (profile) => {
    setSelectedProfile(profile);
    setIsOpen(true);
  };

  const handleCloseProfile = () => {
    setIsOpen(false);
    setSelectedProfile(null);
  };

  return (
    <div className="bloglist__container">
      <Menu />

      {isOpen && (
        <ProfilePreview
          profile={selectedProfile} 
          onClose={handleCloseProfile} 
        />
      )}

      <div className="bloglist__display blur">
        <div className="bloglist__items">
          {posts.map((post) => (
            <BlogItem
              key={post.id}
              post={post}
              userId={userId}
              onOpenProfile={handleOpenProfile} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogList;
