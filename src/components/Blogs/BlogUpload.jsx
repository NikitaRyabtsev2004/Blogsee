import React, { useState, useRef } from "react";
import axios from "axios";
import Menu from "../Front/Menu";
import CryptoJS from "crypto-js";

const BlogUpload = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tag, setTag] = useState("");
  const [image, setImage] = useState(null);
  const [fileName, setFileName] = useState("");

  const fileInputRef = useRef(null);

  const userId = CryptoJS.AES.decrypt(
    localStorage.getItem("userId"),
    "secret-key"
  ).toString(CryptoJS.enc.Utf8);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("tag", tag);
    formData.append("image", image);

    try {
      await axios.post("http://localhost:5000/blog-upload", formData);
      alert("Post uploaded successfully!");
    } catch (error) {
      console.error("Error uploading post:", error);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0]; 
    if (file) {
      setImage(file);
      setFileName(file.name);
    } else {
      setFileName("");
    }
  };

  return (
    <div className="upload__container">
      <Menu />
      <div className="upload__form">
        <div className="upload__field">
          <span className="upload__placeholder">Title</span>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="upload__field">
          <span className="upload__placeholder">Tag</span>
          <input
            type="text"
            placeholder="Tag"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
          />
        </div>
        <div className="upload__field">
          <span className="upload__placeholder">Description</span>
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="upload__file-input">
          <label htmlFor="fileInput">
            {fileName ? fileName : "Choose File"}
          </label>
          <input
            type="file"
            id="fileInput"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileSelect}
          />
          <button type="button" onClick={() => fileInputRef.current.click()}>
            Select File
          </button>
        </div>
        <button style={{transform:"skewY(-3deg)"}} onClick={handleUpload}>
          Upload
        </button>
      </div>
    </div>
  );
};

export default BlogUpload;
