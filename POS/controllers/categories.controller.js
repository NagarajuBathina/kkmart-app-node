const connectToDatabase = require("../../misc/db");
const { Op } = require("sequelize");

// add category
const createCategory = async (req, res) => {
  try {
    const { Category } = await connectToDatabase();
    // check if category already exists
    const categoryExists = await Category.findOne({
      where: {
        category: req.body.category,
      },
    });
    if (categoryExists && categoryExists.is_active) {
      return res.status(400).json({
        message: "Category already exists",
        category: categoryExists,
      });
    }
    if (categoryExists && !categoryExists.is_active) {
      await categoryExists.update({ ...req.body, is_active: true });
      return res.status(200).json({
        message: "Category added successfully",
        category: categoryExists,
      });
    }
    const created_on = new Date();
    const category = await Category.create({ ...req.body, created_on });
    return res.status(200).json({ message: "Category added successfully", category });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// get all categories
const getAllCategories = async (req, res) => {
  try {
    const { Category } = await connectToDatabase();
    const categories = await Category.findAll({
      where: { is_active: true },
    });
    return res.status(200).json(categories);
  } catch (error) {
    return res.status(500).json({ error: "Failed to retrieve categories", message: error.message });
  }
};

// get category by id
const getCategoryById = async (req, res) => {
  try {
    const { Category } = await connectToDatabase();
    const category = await Category.findOne({
      where: {
        category_id: req.params.id,
      },
    });
    return res.status(200).json({
      category,
      message: category ? "Category found" : "Category not found",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// update category
const updateCategory = async (req, res) => {
  try {
    const { Category } = await connectToDatabase();
    const category = await Category.findOne({
      where: {
        category_id: req.params.id,
      },
    });
    if (category) {
      // check if category already exists
      const categoryExists = await Category.findOne({
        where: {
          category: req.body.category,
          category_id: { [Op.ne]: req.params.id },
        },
      });
      if (categoryExists) {
        return res.status(400).json({
          message: "Category already exists",
          category: categoryExists,
        });
      }
      await category.update(req.body);
      return res.status(200).json({
        category,
        message: "Category updated successfully",
      });
    }
    return res.status(404).json({
      message: "Category not found",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// delete category
const deleteCategory = async (req, res) => {
  try {
    const { Category } = await connectToDatabase();
    const category = await Category.findOne({
      where: {
        category_id: req.params.id,
      },
    });
    if (category) {
      await category.update({ is_active: false });
      return res.status(200).json({
        message: "Category deleted successfully",
      });
    }
    return res.status(404).json({
      message: "Category not found",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getAllActiveCategoriesDropdown = async (req, res) => {
  try {
    const { Category } = await connectToDatabase();

    const categories = await Category.findAll({
      where: { is_active: true, status: true },
      attributes: ["category_id", "category"],
    });
    return res.status(200).json(categories);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getAllActiveCategoriesDropdown,
};
