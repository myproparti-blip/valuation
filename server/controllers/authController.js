import { users } from "../models/userModel.js";

// Hardcoded users for authentication (not using database)
const authUsers = [
  { role: "admin", username: "admin", password: "2020" },
  { role: "manager1", username: "manager1", password: "1122" },
  { role: "manager2", username: "manager2", password: "1133" },
  { role: "user", username: "user1", password: "1111" },
  { role: "user", username: "user2", password: "2222" },
  { role: "user", username: "user3", password: "3333" },
  { role: "user", username: "user4", password: "4444" },
  { role: "user", username: "user5", password: "5555" },
  { role: "user", username: "user6", password: "6666" },
  { role: "user", username: "user7", password: "7777" },
  { role: "user", username: "user8", password: "8888" },
  { role: "user", username: "user9", password: "9999" },
  { role: "user", username: "user10", password: "1010" },
];

export const login = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
     return res.status(400).json({ message: "Username and password are required" });
   }

   const user = authUsers.find(
     (u) => u.username === username && u.password === password
   );

   if (!user) {
     return res.status(401).json({ message: "Invalid credentials. Please check your username and password." });
   }

   res.status(200).json({
     message: "Sign in successful",
     role: user.role,
     username: user.username,
   });
};

export const logout = (req, res) => {
  // Extract user from Authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(400).json({ message: "No user session found" });
  }

  try {
    // Decode the Authorization header (sent as URL-encoded JSON)
    const userString = decodeURIComponent(authHeader);
    const user = JSON.parse(userString);

    // Send success response
    res.status(200).json({
      message: "Logout successful",
      username: user.username,
    });
  } catch (error) {
    res.status(400).json({ message: "Invalid session" });
  }
};