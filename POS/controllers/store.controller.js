const connectToDatabase = require("../../misc/db.js");
const { Op } = require("sequelize");

// Function to create a new store
const createStore = async (req, res) => {
  try {
    const { Stores } = await connectToDatabase();
    const { name, address, phone, email, code } = req.body;

    // Validate required fields
    if (!name || !address || !phone || !email || !code) {
      return res.status(400).json({
        message: "Store name, address, phone number, and email and code are required",
      });
    }

    const storesCount = await Stores.count();
    if (storesCount > 11) {
      return res.status(400).json({ message: "Stores limit crossed" });
    }

    // Check if store already exists using store_name and phone_number
    const existingStore = await Stores.findOne({
      where: {
        [Op.or]: [{ name }, { phone }],
      },
    });

    if (existingStore) {
      return res.status(409).json({
        message: "Store with this name, email or phone number already exists",
      });
    }

    const created_at = new Date();

    // Create new store
    const newStore = await Stores.create({
      name,
      address,
      phone,
      email,
      created_at,
      code,
    });

    return res.status(201).json({
      message: "Store created successfully",
      store: newStore,
    });
  } catch (error) {
    console.error("Error in createStore:", error);
    return res.status(500).json({
      message: "Failed to create store",
      error: error.message,
    });
  }
};

//  get all stores implement pagination and search by name, address, phone number and email
const getallStores = async (req, res) => {
  try {
    const { Stores } = await connectToDatabase();
    const { page = 1, limit = 10, search = "" } = req.query;

    // Parse page and limit as integers
    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);

    if (isNaN(parsedPage) || isNaN(parsedLimit) || parsedPage <= 0 || parsedLimit <= 0) {
      return res.status(400).json({
        message: "Invalid page or limit value. Both must be positive integers.",
      });
    }

    const offset = (parsedPage - 1) * parsedLimit;

    const stores = await Stores.findAndCountAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { address: { [Op.like]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
        ],
      },
      limit: parsedLimit,
      offset,
    });

    return res.status(200).json({
      message: "Stores retrieved successfully",
      stores: stores.rows,
      totalStores: stores.count,
      totalPages: Math.ceil(stores.count / parsedLimit),
      currentPage: parsedPage,
    });
  } catch (error) {
    console.error("Error in getAllStores:", error);
    return res.status(500).json({
      message: "Failed to retrieve stores",
      error: error.message,
    });
  }
};

// Function to get a store by ID
const getStoreById = async (req, res) => {
  try {
    const { Stores } = await connectToDatabase();
    const { store_id } = req.params;

    const store = await Stores.findOne({
      where: { store_id },
    });

    if (!store) {
      return res.status(404).json({
        message: "Store not found",
      });
    }

    res.status(200).json({
      message: "Store retrieved successfully",
      store,
    });
  } catch (error) {
    console.error("Error in getStoreById:", error);
    res.status(500).json({
      message: "Failed to retrieve store",
      error: error.message,
    });
  }
};

// update store by id
const updateStoreById = async (req, res) => {
  try {
    const { Stores } = await connectToDatabase();
    const { store_id } = req.params;

    //  check if store exists
    const store = await Stores.findOne({
      where: { store_id },
    });

    if (!store) {
      return res.status(404).json({
        message: "Store not found",
      });
    }

    // check if only name and phone number are provided on request body
    let name = req.body.name || "";
    let phone = req.body.phone || "";

    if (name || phone) {
      const existingStore = await Stores.findOne({
        where: {
          [Op.or]: [{ name }, { phone }],
          store_id: { [Op.ne]: store_id }, // Exclude the current store_id from the check
        },
      });

      if (existingStore) {
        return res.status(409).json({
          message: "Store with this name or phone number already exists",
        });
      }
    }

    // Update store
    await Stores.update(req.body, { where: { store_id } });

    return res.status(200).json({
      message: "Store updated successfully",
    });
  } catch (error) {
    console.error("Error in updateStoreById:", error);
    return res.status(500).json({
      message: "Failed to update store",
      error: error.message,
    });
  }
};

module.exports = { createStore, getallStores, getStoreById, updateStoreById };
