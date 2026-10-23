const express = require("express");
const axios = require("axios");
const books = require("./booksdb.js");
const { isValid, users } = require("./auth_users.js");

const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (typeof username !== "string" || !username.trim() ||
      typeof password !== "string" || !password.trim()) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!isValid(username)) {
    return res.status(409).json({ message: "User already exists" });
  }

  users.push({ username, password });
  return res.json({ message: "User successfully registered. Now you can login" });
});

public_users.get("/", (req, res) => {
  return res.json(books);
});

public_users.get("/isbn/:isbn", (req, res) => {
  const book = books[req.params.isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  return res.json(book);
});

public_users.get("/author/:author", (req, res) => {
  const matches = Object.fromEntries(
    Object.entries(books).filter(([, book]) =>
      book.author.toLowerCase() === req.params.author.toLowerCase()
    )
  );
  return res.json(matches);
});

public_users.get("/title/:title", (req, res) => {
  const matches = Object.fromEntries(
    Object.entries(books).filter(([, book]) =>
      book.title.toLowerCase() === req.params.title.toLowerCase()
    )
  );
  return res.json(matches);
});

public_users.get("/review/:isbn", (req, res) => {
  const book = books[req.params.isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  return res.json(book.reviews);
});

const baseURL = `http://127.0.0.1:${process.env.PORT || 5000}`;

async function getAllBooks() {
  const response = await axios.get(baseURL + "/");
  return response.data;
}

async function getBookByISBN(isbn) {
  const response = await axios.get(baseURL + "/isbn/" + encodeURIComponent(isbn));
  return response.data;
}

async function getBooksByAuthor(author) {
  const response = await axios.get(baseURL + "/author/" + encodeURIComponent(author));
  return response.data;
}

async function getBooksByTitle(title) {
  const response = await axios.get(baseURL + "/title/" + encodeURIComponent(title));
  return response.data;
}

module.exports.general = public_users;
module.exports.getAllBooks = getAllBooks;
module.exports.getBookByISBN = getBookByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;
