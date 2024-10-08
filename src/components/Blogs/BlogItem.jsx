import React, { useState, useEffect } from "react";
import axios from "axios";
import Comments from "./Comments/Comments";
import ProfilePreview from "../Profile/ProfilePreview";

const BlogItem = ({ post, userId, onOpenProfile }) => {
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [isLiked, setIsLiked] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [profile, setProfile] = useState(null);

  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  useEffect(() => {
    const fetchLikeStatus = async () => {
      try {
        const likeData = { postId: post.id, userId: userId };
        const response = await axios.post(
          "http://localhost:5000/check-like",
          likeData
        );
        setIsLiked(response.data.isLiked);
      } catch (error) {
        console.error("Error fetching like status:", error);
      }
    };

    const fetchComments = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/comments/${post.id}`
        );
        setComments(response.data.comments);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchLikeStatus();
    fetchComments();
  }, [post.id, userId]);

  const handleOpenProfile = async (user) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/profile/${user.userId || user.id}`
      );
      setProfile(response.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleOpenComments = () => {
    setIsOpen(!isOpen);
  };

  const handleLike = async () => {
    try {
      const likeData = { postId: post.id, userId: userId };
      if (isLiked) {
        await axios.post("http://localhost:5000/unlike", likeData);
        setLikesCount(likesCount - 1);
        setIsLiked(false);
      } else {
        await axios.post("http://localhost:5000/like", likeData);
        setLikesCount(likesCount + 1);
        setIsLiked(true);
      }
    } catch (error) {
      console.error("Error handling like:", error);
    }
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;

    try {
      const commentData = {
        postId: post.id,
        userId: userId,
        comment: newComment,
      };
      const response = await axios.post(
        "http://localhost:5000/add-comment",
        commentData
      );
      setComments([response.data.comment, ...comments]);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  return (
    <div className="blogitem__container">
      <div className="card">
        <div className="card__header">
          <img
            src={`http://localhost:5000/uploads/blogs/${post.imageUrl}`}
            alt="blog"
          />
        </div>
        <div className="card__body">
          <span className="tag tag-blue">{post.tag}</span>
          <h4>{post.title}</h4>
          <p>{post.description}</p>
        </div>
        <div className="card__footer">
          <div className="user">
            <img
              src={`http://localhost:5000/uploads/avatars/${post.userAvatar}`}
              alt="user"
              onClick={() => handleOpenProfile(post)}
              style={{ cursor: "pointer" }}
            />
            <div className="user__info">
              <h5
                onClick={() => handleOpenProfile(post)}
                style={{ cursor: "pointer" }}
              >
                {post.username}
              </h5>
              <small>{formattedDate}</small>
            </div>
          </div>
          <div className="card__footer__l_c__container">
            <div className="card__footer__l_c">
              <div className="card__footer__like" onClick={handleLike}>
                ❤︎ {likesCount}
              </div>
              <div
                className="card__footer__comments__container"
                onClick={handleOpenComments}
              >
                💬{comments.length}
              </div>
            </div>
            {isOpen && (
              <div className="open__comments__container">
                <div className="comments__sended">
                  {comments.length === 0 && (
                    <div
                      style={{
                        textAlign: "center",
                        margin: "10px 0",
                        background: "#bebebec1",
                        borderRadius: "10px",
                      }}
                    >
                      No Comments
                    </div>
                  )}
                  {comments.map((comment, index) => (
                    <Comments
                      key={index}
                      comment={comment}
                      onOpenProfile={handleOpenProfile}
                    />
                  ))}
                </div>
                <div className="comments__sender">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write your comment..."
                  />
                  <button onClick={handleCommentSubmit}>
                    <p>📩</p>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {profile && (
        <ProfilePreview profile={profile} onClose={() => setProfile(null)} />
      )}
    </div>
  );
};

export default BlogItem;
