const express = require("express");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const authRoutes = require("./router/auth_users.js");
const customerRoutes = authRoutes.authenticated;
const generalRoutes = require("./router/general.js").general;

const app = express();
app.use(express.json());

app.use(session({
  secret: "fingerprint_customer",
  resave: false,
  saveUninitialized: false
}));

app.use("/customer/auth", (req, res, next) => {
  if (!req.session.authorization) {
    return res.status(403).json({ message: "User not logged in" });
  }

  const token = req.session.authorization.accessToken;
  try {
    jwt.verify(token, "access");
    next();
  } catch (err) {
    return res.status(403).json({ message: "User not authenticated" });
  }
});

app.post("/login", authRoutes.loginUser);
app.use("/customer", customerRoutes);
app.use("/", generalRoutes);

const PORT = Number(process.env.PORT || 5000);
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
