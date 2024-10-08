import React from "react";

const ProfilePreview = ({ profile, onClose, userId }) => {

  return (
    <div className="profile__modal">
      <div className="profile__container">
        <div className="profile__card">
          <button className="close__btn" onClick={onClose}>✖</button>
          <img
            alt="User Avatar"
            className="profile__card__image"
            src={`http://localhost:5000/uploads/avatars/${profile.avatarUrl}`}
          />
          <p className="profile__card__name">{profile.username}</p>
          <div className="profile__grid-container">
            <div className="profile__grid-child-posts">{profile.postsCount} Posts</div>
            <div className="profile__grid-child-followers">{profile.likesCount} Likes</div>
          </div>
          <div className="profile__description">{profile.description}</div>

          <div className="profile__social-links">
            <h3>Social Links</h3>
            {profile.socialLinks && profile.socialLinks.length > 0 ? (
              profile.socialLinks.map((link, index) => (
                <a
                  style={{ textDecoration: "none" }}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={index}
                >
                  {link.platform}
                </a>
              ))
            ) : (
              <p>No social links available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePreview;
