const express = require("express");
const router = express.Router();
const {
  login,
  signup,
  getDashboardStats,
  getDashboardStatastics,
  getStoreDashboardStatastics,
} = require("../controllers/auth.controller");
const { authenticateToken, authorizeRole } = require("../../middleware/auth_middleware");

// Public routes
router.post("/login_pos", login);
// router.post('/signup', authenticateToken, authorizeRole(['admin']), signup); // Only admins can create new users
router.post("/signup", signup);
router.get("/test_auth", authenticateToken, (req, res) => {
  res.json({
    message: "JWT verification successful",
  });
});
router.get("/dashboard_stats", getDashboardStats);
router.get("/get_dashboard_statastics", getDashboardStatastics);
router.get("/get_store_dashboard_statastics/:storeid", getStoreDashboardStatastics);

module.exports = router;
