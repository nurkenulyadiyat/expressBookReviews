const express = require("express");
const jwt = require("jsonwebtoken");
const books = require("./booksdb.js");

const regd_users = express.Router();
const users = [];

const isValid = (username) => !users.some(user => user.username === username);

const authenticatedUser = (username, password) =>
  users.some(user => user.username === username && user.password === password);

function loginUser(req, res) {
  const { username, password } = req.body;

  if (!username || !password || !authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const accessToken = jwt.sign({ username }, "access", { expiresIn: "1h" });
  req.session.authorization = { accessToken, username };
  return res.json({ message: "Login successful" });
}

regd_users.post("/login", loginUser);

regd_users.put("/auth/review/:isbn", (req, res) => {
  const book = books[req.params.isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  const review = req.body.review;
  if (typeof review !== "string" || !review.trim()) {
    return res.status(400).json({ message: "Review is required" });
  }

  const username = req.session.authorization.username;
  book.reviews[username] = review;
  return res.json({ message: "Review added or updated successfully", reviews: book.reviews });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const book = books[req.params.isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  const username = req.session.authorization.username;
  if (!(username in book.reviews)) {
    return res.status(404).json({ message: "Your review was not found" });
  }

  delete book.reviews[username];
  return res.json({ message: `Review for ISBN ${req.params.isbn} deleted.` });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

module.exports.loginUser = loginUser;
