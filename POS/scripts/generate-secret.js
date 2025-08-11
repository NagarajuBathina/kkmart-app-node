const crypto = require("crypto");

const generateSecret = () => {
  return crypto.randomBytes(64).toString("hex");
};

console.log("Generated JWT_SECRET:", generateSecret());
