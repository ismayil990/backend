const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET // ya da hardcoded

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: "Token tələb olunur" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("Token error:", err);
      return res.status(403).json({ message: "Token etibarsızdır" });
    }

    console.log("Decoded token:", decoded);  // <-- burda bax gör id gəlir?
    req.user = decoded;
    next();
  });
}

module.exports = authenticateToken;

