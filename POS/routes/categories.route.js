const express = require("express");
const router = express.Router();
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getAllActiveCategoriesDropdown,
} = require("../controllers/categories.controller");
const { authenticateToken, authorizeRole } = require("../../middleware/auth_middleware");

// Public routes
router.get("/get_all_categories", getAllCategories);
router.get("/get_category/:id", getCategoryById);
router.post("/create_category", createCategory);
router.put("/update_category/:id", updateCategory);
router.delete("/delete_category/:id", deleteCategory);
router.get("/get_all_active_categories_dropdown", getAllActiveCategoriesDropdown);
module.exports = router;
