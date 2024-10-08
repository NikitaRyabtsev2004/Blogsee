const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(
  "/uploads/blogs",
  express.static(path.join(__dirname, "uploads/blogs"))
);

const db = new sqlite3.Database("./auth-system.db", (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Connected to the SQLite3 database.");
});

db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE,
  username TEXT,
  password TEXT,
  avatarUrl TEXT DEFAULT 'kit.jpeg',
  postsCount INTEGER DEFAULT 0,
  likesCount INTEGER DEFAULT 0,
  description TEXT DEFAULT '',
  socialLinks TEXT DEFAULT '',
  posts TEXT DEFAULT '',
  verificationCode TEXT,
  isVerified INTEGER DEFAULT 0,
  resetCode TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER,
  imageUrl TEXT,
  tag TEXT,
  title TEXT,
  description TEXT,
  createdAt TEXT,
  likesCount INTEGER DEFAULT 0,
  comments TEXT DEFAULT '', 
  FOREIGN KEY(userId) REFERENCES users(id)
)`);

db.run(`CREATE TABLE IF NOT EXISTS likes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER,
  postId INTEGER,
  FOREIGN KEY(userId) REFERENCES users(id),
  FOREIGN KEY(postId) REFERENCES posts(id)
)`);

db.run(`CREATE TABLE IF NOT EXISTS follows (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  followerId INTEGER,
  followedId INTEGER,
  FOREIGN KEY(followerId) REFERENCES users(id),
  FOREIGN KEY(followedId) REFERENCES users(id)
)`);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/avatars/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

const transporter = nodemailer.createTransport({
  host: "smtp.yandex.ru",
  port: 465,
  secure: true,
  auth: {
    user: "SoftSeason@yandex.ru",
    pass: "tlrozowdvoqzkmpu",
  },
});

function generateVerificationCode() {
  return crypto.randomInt(100000, 999999).toString();
}

app.post("/register", async (req, res) => {
  const { email, username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationCode = generateVerificationCode();

  const insertUserQuery = `INSERT INTO users (email, username, password, verificationCode) VALUES (?, ?, ?, ?)`;
  db.run(
    insertUserQuery,
    [email, username, hashedPassword, verificationCode],
    function (err) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      transporter.sendMail({
        from: '"SoftSeason" <SoftSeason@yandex.ru>',
        to: email,
        subject: "Account Verification",
        text: `Your verification code is ${verificationCode}`,
      });

      res.json({
        message: "User registered. Check your email for verification code.",
      });
    }
  );
});

app.post("/verify-email", (req, res) => {
  const { email, code } = req.body;
  const query = `SELECT * FROM users WHERE email = ?`;

  db.get(query, [email], (err, user) => {
    if (err || !user)
      return res.status(400).json({ message: "User not found" });

    if (user.verificationCode === code) {
      const updateUserQuery = `UPDATE users SET isVerified = 1 WHERE email = ?`;
      db.run(updateUserQuery, [email], (err) => {
        if (err)
          return res.status(400).json({ message: "Verification failed" });
        res.json({ message: "Email verified. You can now login." });
      });
    } else {
      res.status(400).json({ message: "Invalid verification code" });
    }
  });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const query = `SELECT * FROM users WHERE email = ?`;

  db.get(query, [email], async (err, user) => {
    if (err || !user)
      return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });
    if (user.isVerified === 0)
      return res.status(400).json({ message: "Account not verified" });

    const token = jwt.sign({ id: user.id }, "secret", { expiresIn: "1h" });
    res.json({ token, userId: user.id });
  });
});

app.post("/request-reset-password", (req, res) => {
  const { email } = req.body;
  const resetCode = generateVerificationCode();
  const updateQuery = `UPDATE users SET resetCode = ? WHERE email = ?`;

  db.run(updateQuery, [resetCode, email], (err) => {
    if (err)
      return res.status(400).json({ message: "Error generating reset code" });

    transporter.sendMail({
      from: '"SoftSeason" <SoftSeason@yandex.ru>',
      to: email,
      subject: "Password Reset",
      text: `Your password reset code is ${resetCode}`,
    });

    res.json({ message: "Reset code sent to email" });
  });
});

app.post("/reset-password", async (req, res) => {
  const { email, code, newPassword } = req.body;
  const query = `SELECT * FROM users WHERE email = ?`;

  db.get(query, [email], async (err, user) => {
    if (err || !user)
      return res.status(400).json({ message: "User not found" });

    if (user.resetCode === code) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const updateQuery = `UPDATE users SET password = ?, resetCode = '' WHERE email = ?`;
      db.run(updateQuery, [hashedPassword, email], (err) => {
        if (err)
          return res.status(400).json({ message: "Error resetting password" });
        res.json({
          message:
            "Password reset successful. You can now login with your new password.",
        });
      });
    } else {
      res.status(400).json({ message: "Invalid reset code" });
    }
  });
});

app.post("/profile/avatar", upload.single("avatar"), (req, res) => {
  const { userId } = req.body;
  const avatarFileName = req.file.filename;

  const updateAvatarQuery = `UPDATE users SET avatarUrl = ? WHERE id = ?`;
  db.run(updateAvatarQuery, [avatarFileName, userId], (err) => {
    if (err) return res.status(400).json({ message: "Error updating avatar" });

    res.json({
      message: "Avatar updated successfully",
      avatarUrl: avatarFileName,
    });
  });
});

app.delete("/profile/avatar", (req, res) => {
  const { userId } = req.body;

  const query = `SELECT avatarUrl FROM users WHERE id = ?`;
  db.get(query, [userId], (err, user) => {
    if (err || !user)
      return res.status(404).json({ message: "User not found" });

    if (user.avatarUrl !== "kit.jpeg") {
      fs.unlinkSync(`uploads/avatars/${user.avatarUrl}`);
    }

    const updateAvatarQuery = `UPDATE users SET avatarUrl = 'kit.jpeg' WHERE id = ?`;
    db.run(updateAvatarQuery, [userId], (err) => {
      if (err)
        return res.status(400).json({ message: "Error resetting avatar" });

      res.json({ message: "Avatar reset to default", avatarUrl: "kit.jpeg" });
    });
  });
});

app.post("/profile/description", (req, res) => {
  const { userId, description } = req.body;

  const updateDescriptionQuery = `UPDATE users SET description = ? WHERE id = ?`;
  db.run(updateDescriptionQuery, [description, userId], (err) => {
    if (err)
      return res.status(400).json({ message: "Error updating description" });

    res.json({ message: "Description updated successfully" });
  });
});

app.post("/profile/social-links", (req, res) => {
  const { userId, socialLinks } = req.body;

  if (!userId || !Array.isArray(socialLinks)) {
    return res.status(400).json({ message: "Invalid data format" });
  }

  const linksJson = JSON.stringify(socialLinks);

  const updateLinksQuery = `UPDATE users SET socialLinks = ? WHERE id = ?`;
  db.run(updateLinksQuery, [linksJson, userId], (err) => {
    if (err) {
      return res.status(400).json({ message: "Error updating social links" });
    }

    res.json({ message: "Social links updated successfully" });
  });
});

app.get("/profile/:userId", (req, res) => {
  const { userId } = req.params;

  const userQuery = `SELECT username, avatarUrl, description, socialLinks FROM users WHERE id = ?`;

  const postsLikesQuery = `
    SELECT 
      COUNT(posts.id) AS totalPosts, 
      SUM(posts.likesCount) AS totalLikes
    FROM posts
    WHERE posts.userId = ?
  `;

  db.get(userQuery, [userId], (err, user) => {
    if (err || !user) {
      return res.status(404).json({ message: "User not found" });
    }

    db.get(postsLikesQuery, [userId], (err, stats) => {
      if (err) {
        return res.status(500).json({ error: "Error fetching posts/likes" });
      }

      let socialLinks = [];
      try {
        socialLinks = JSON.parse(user.socialLinks) || [];
      } catch (e) {
        socialLinks = [];
      }

      const profileData = {
        username: user.username,
        avatarUrl: user.avatarUrl,
        description: user.description,
        socialLinks: socialLinks,
        postsCount: stats.totalPosts || 0,
        likesCount: stats.totalLikes || 0,
      };

      res.json(profileData);
    });
  });
});

const blogStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/blogs/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const blogUpload = multer({ storage: blogStorage });

app.post("/blog-upload", blogUpload.single("image"), (req, res) => {
  const { userId, title, description, tag } = req.body;
  const imageUrl = req.file.filename;
  const createdAt = new Date().toISOString();

  const insertPostQuery = `INSERT INTO posts (userId, imageUrl, title, description, tag, createdAt) VALUES (?, ?, ?, ?, ?, ?)`;
  db.run(
    insertPostQuery,
    [userId, imageUrl, title, description, tag, createdAt],
    function (err) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      res.json({ message: "Post uploaded successfully" });
    }
  );
});

app.get("/posts", (req, res) => {
  const query = `
    SELECT posts.*, users.username, users.avatarUrl as userAvatar 
    FROM posts
    JOIN users ON posts.userId = users.id
    ORDER BY posts.createdAt DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.post("/like", (req, res) => {
  const { postId, userId } = req.body;

  const checkLikeQuery = `SELECT * FROM likes WHERE postId = ? AND userId = ?`;
  db.get(checkLikeQuery, [postId, userId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (row) {
      return res.status(400).json({ message: "User already liked this post" });
    }

    const insertLikeQuery = `INSERT INTO likes (postId, userId) VALUES (?, ?)`;
    db.run(insertLikeQuery, [postId, userId], function (err) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      const updateLikesQuery = `UPDATE posts SET likesCount = likesCount + 1 WHERE id = ?`;
      db.run(updateLikesQuery, [postId], (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ message: "Post liked" });
      });
    });
  });
});

app.post("/unlike", (req, res) => {
  const { postId, userId } = req.body;
  const deleteLikeQuery = `DELETE FROM likes WHERE postId = ? AND userId = ?`;
  db.run(deleteLikeQuery, [postId, userId], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const updateLikesQuery = `UPDATE posts SET likesCount = likesCount - 1 WHERE id = ?`;
    db.run(updateLikesQuery, [postId], (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: "Post unliked" });
    });
  });
});

app.post("/check-like", (req, res) => {
  const { postId, userId } = req.body;

  const checkLikeQuery = `SELECT * FROM likes WHERE postId = ? AND userId = ?`;
  db.get(checkLikeQuery, [postId, userId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (row) {
      return res.json({ isLiked: true });
    } else {
      return res.json({ isLiked: false });
    }
  });
});

app.post("/add-comment", (req, res) => {
  const { postId, userId, comment } = req.body;

  const userQuery = `SELECT username, avatarUrl FROM users WHERE id = ?`;
  db.get(userQuery, [userId], (err, user) => {
    if (err || !user) {
      return res.status(500).json({ message: "Error fetching user data" });
    }

    const query = `SELECT comments FROM posts WHERE id = ?`;
    db.get(query, [postId], (err, row) => {
      if (err) {
        return res.status(500).json({ message: "Error fetching comments" });
      }

      const existingComments = row.comments ? JSON.parse(row.comments) : [];

      const newComment = {
        userId,
        username: user.username,
        userAvatar: user.avatarUrl || null,  // Добавляем аватар пользователя
        text: comment,
        createdAt: new Date().toISOString(),
      };

      existingComments.push(newComment);

      const updateQuery = `UPDATE posts SET comments = ? WHERE id = ?`;
      db.run(updateQuery, [JSON.stringify(existingComments), postId], (err) => {
        if (err) {
          return res.status(500).json({ message: "Error saving comment" });
        }
        res.json({ comment: newComment });
      });
    });
  });
});



app.get("/comments/:postId", (req, res) => {
  const postId = req.params.postId;
  const query = `SELECT comments FROM posts WHERE id = ?`;

  db.get(query, [postId], (err, row) => {
    if (err) {
      return res.status(500).json({ message: "Error fetching comments" });
    }
    const comments = row.comments ? JSON.parse(row.comments) : [];
    res.json({ comments });
  });
});

app.post("/logout", (req, res) => {
  res.json({ message: "Logout successful" });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});


