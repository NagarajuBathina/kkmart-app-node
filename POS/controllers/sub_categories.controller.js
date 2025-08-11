const connectToDatabase = require("../../misc/db");

// add subcategory
const createSubcategory = async (req, res) => {
  try {
    const { SubCategory, Category, User } = await connectToDatabase();
    // check if subcategory already exists
    const subCategoryExists = await SubCategory.findOne({
      where: {
        sub_category: req.body.sub_category,
      },
    });
    if (subCategoryExists) {
      return res.status(400).json({
        message: "Subcategory already exists",
      });
    }
    // check if category exists
    const category = await Category.findOne({
      where: {
        category: req.body.category,
      },
    });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // check if user exists
    const user = await User.findOne({
      where: {
        user_id: req.body.created_by,
      },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const created_on = new Date();
    const category_id = category.category_id;
    const subCategory = await SubCategory.create({ ...req.body, created_on, category_id });
    return res.status(200).json({ message: "Subcategory created successfully", subCategory });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// get all subcategories
const getAllSubcategories = async (req, res) => {
  try {
    const { SubCategory, Category, User } = await connectToDatabase();
    const subcategories = await SubCategory.findAll({
      where: { is_active: true },
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["category"],
        },
        {
          model: User,
          as: "creator",
          attributes: ["username"],
        },
      ],
      raw: true,
      nest: true,
    });

    // Transform the response
    const transformedSubcategories = subcategories.map((subcategory) => ({
      sub_category_id: subcategory.sub_category_id,
      sub_category: subcategory.sub_category,
      description: subcategory.description,
      created_on: subcategory.created_on,
      updated_on: subcategory.updated_on,
      category: subcategory.category.category,
      created_by: subcategory.creator.username,
      status: Boolean(subcategory.status),
    }));

    res.status(200).json(transformedSubcategories);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch subcategories",
      error: error.message,
    });
  }
};

// get subcategory by id
const getSubcategoryById = async (req, res) => {
  try {
    const { SubCategory } = await connectToDatabase();
    const subcategory = await SubCategory.findByPk(req.params.id);
    if (!subcategory) {
      return res.status(404).json({
        message: "Subcategory not found",
      });
    }
    res.status(200).json(subcategory);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch subcategory",
      error: error.message,
    });
  }
};

// update subcategory
const updateSubcategory = async (req, res) => {
  try {
    const { SubCategory } = await connectToDatabase();
    const [updated] = await SubCategory.update(req.body, {
      where: { sub_category_id: req.params.id },
    });
    if (!updated) {
      return res.status(404).json({
        message: "Subcategory not found",
      });
    }
    const updatedSubcategory = await SubCategory.findByPk(req.params.id);
    res.status(200).json({
      message: "Subcategory updated successfully",
      subcategory: updatedSubcategory,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update subcategory",
      error: error.message,
    });
  }
};

// delete subcategory
const deleteSubcategory = async (req, res) => {
  try {
    const { SubCategory } = await connectToDatabase();
    const subcategory = await SubCategory.findByPk(req.params.id);
    if (!subcategory) {
      return res.status(404).json({
        message: "Subcategory not found",
      });
    }
    await subcategory.update({ is_active: false });
    res.status(200).json({
      message: "Subcategory deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete subcategory",
      error: error.message,
    });
  }
};

module.exports = {
  createSubcategory,
  getAllSubcategories,
  getSubcategoryById,
  updateSubcategory,
  deleteSubcategory,
};
