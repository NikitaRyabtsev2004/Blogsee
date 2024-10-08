import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Menu from "../Front/Menu";
import CryptoJS from "crypto-js";

const ProfilePage = () => {
  const [profile, setProfile] = useState({});
  const [newDescription, setNewDescription] = useState("");
  const [socialLink, setSocialLink] = useState({ platform: "", url: "" });
  const [selectedFile, setSelectedFile] = useState(null);
  const [socialLinks, setSocialLinks] = useState([]);

  const userId = CryptoJS.AES.decrypt(
    localStorage.getItem("userId"),
    "secret-key"
  ).toString(CryptoJS.enc.Utf8);

  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        console.log("Fetching profile for userId:", userId); // Отладочная информация
        const response = await axios.get(`http://localhost:5000/profile/${userId}`);
        console.log("Profile data received:", response.data); // Отладочная информация
        setProfile(response.data);
        setNewDescription(response.data.description);
        setSocialLinks(response.data.socialLinks || []);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
  
    if (userId) {
      fetchProfile();
    }
  }, [userId]);
  

  const handleAvatarUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("avatar", selectedFile);
    formData.append("userId", userId);

    try {
      const response = await axios.post(
        "http://localhost:5000/profile/avatar",
        formData
      );
      setProfile((prev) => ({ ...prev, avatarUrl: response.data.avatarUrl }));
    } catch (error) {
      console.error("Error uploading avatar:", error);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleDeleteAvatar = async () => {
    try {
      const response = await axios.delete(
        "http://localhost:5000/profile/avatar",
        { data: { userId } }
      );
      setProfile((prev) => ({ ...prev, avatarUrl: response.data.avatarUrl }));
    } catch (error) {
      console.error("Error deleting avatar:", error);
    }
  };

  const handleUpdateDescription = async () => {
    try {
      await axios.post("http://localhost:5000/profile/description", {
        userId,
        description: newDescription,
      });
      setProfile((prev) => ({ ...prev, description: newDescription }));
    } catch (error) {
      console.error("Error updating description:", error);
    }
  };

  const handleSaveSocialLink = async () => {
    if (socialLink.platform && socialLink.url) {
      try {
        const updatedLinks = [...socialLinks, socialLink]; 

        await axios.post("http://localhost:5000/profile/social-links", {
          userId,
          socialLinks: updatedLinks, 
        });

        setSocialLinks(updatedLinks);
        setSocialLink({ platform: "", url: "" }); 
        alert("Social link saved successfully!");
      } catch (error) {
        console.error("Error saving social link:", error);
      }
    } else {
      alert("Please fill out both platform and URL fields before saving.");
    }
  };


  const handleDeleteSocialLink = async (index) => {
    const updatedLinks = socialLinks.filter((_, i) => i !== index); 

    try {
      await axios.post("http://localhost:5000/profile/social-links", {
        userId,
        socialLinks: updatedLinks,
      });

      setSocialLinks(updatedLinks);
      alert("Social link deleted successfully!");
    } catch (error) {
      console.error("Error deleting social link:", error);
    }
  };

  return (
    <div className="profile__container">
      <Menu />
      <div className="profile__card">
        <img
          src={`http://localhost:5000/uploads/avatars/${profile.avatarUrl}`}
          alt="User Avatar"
          className="profile__card__image"
        />
        <p className="profile__card__name">{profile.username}</p>
        <div className="profile__grid-container">
          <div className="profile__grid-child-posts">
            {profile.postsCount} Posts
          </div>
          <div className="profile__grid-child-followers">
            {profile.likesCount} Likes
          </div>
        </div>

        <form onSubmit={handleAvatarUpload}>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={(e) => setSelectedFile(e.target.files[0])}
          />
          <button type="button" onClick={handleFileSelect}>
            Select Avatar
          </button>
          <button type="submit">Upload Avatar</button>
          <button type="button" onClick={handleDeleteAvatar}>
            Delete Avatar
          </button>
        </form>

        <div className="profile__description">
          <textarea
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Enter a description..."
          />
          <button onClick={handleUpdateDescription}>Save Description</button>
        </div>

        <div className="profile__social-links">
          <h3>Social Links</h3>
          {socialLinks.length > 0 ? (
            socialLinks.map((link, index) => (
              <div className="social__link" key={index}>
                <a href={link.url} style={{textDecoration:"none"}} target="_blank" rel="noopener noreferrer">
                  {link.platform}
                </a>
                <button onClick={() => handleDeleteSocialLink(index)}>
                  Delete
                </button>
              </div>
            ))
          ) : (
            <p>No social links added.</p>
          )}

          <div className="social__inputs">
            <input
              type="text"
              placeholder="Platform"
              value={socialLink.platform}
              onChange={(e) =>
                setSocialLink({ ...socialLink, platform: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="URL"
              value={socialLink.url}
              onChange={(e) =>
                setSocialLink({ ...socialLink, url: e.target.value })
              }
            />
          </div>

          <button style={{marginBottom:"50px"}} onClick={handleSaveSocialLink}>Save Social Link</button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
