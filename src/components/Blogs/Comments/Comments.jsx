import React from "react";

const Comments = ({ comment, onOpenProfile }) => {
  const formattedDate = new Date(comment.createdAt).toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }
  );

  return (
    <div className="comment__sended">
      <div className="comment__user__info">
        <img
          onClick={() => onOpenProfile(comment)}
          src={`http://localhost:5000/uploads/avatars/${
            comment.userAvatar || "kit.jpeg"
          }`}
          alt="user"
        />

        <h5 onClick={() => onOpenProfile(comment)}>{comment.username}</h5>
        <small>{formattedDate}</small>
      </div>
      <div className="comment__data__info">
        <div className="comment__data">{comment.text}</div>
      </div>
    </div>
  );
};


export default Comments;
