const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Secret key for signing JWT
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'abc!@#';

// Function to generate JWT token
const generateToken = (user) => {
  const { email, name } = user;  // You can also include other user details if needed
  return jwt.sign({ email, name }, JWT_SECRET_KEY); // Token expires in 1 hour
};

// Function to verify JWT token
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET_KEY);
    return decoded; // Returns the decoded token payload (user details)
  } catch (err) {
    throw new Error('Invalid or expired token');
  }
};

module.exports = { generateToken, verifyToken };
