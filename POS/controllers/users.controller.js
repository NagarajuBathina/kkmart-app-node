const connectToDatabase = require("../../misc/db");
const { Op, where } = require("sequelize");

const createUser = async (req, res) => {
  const { Users } = await connectToDatabase();
  const { username, store_id, role } = req.body;

  try {
    const cashierCount = await Users.count({
      where: { store_id, role: "cashier" },
    });

    const storeCount = await Users.count({
      where: { store_id, role: "store" },
    });

    if (role === "cashier" && cashierCount === 2) {
      return res.status(400).json({ message: "Store can only have 2 cashiers." });
    }

    if (role === "store" && storeCount === 1) {
      return res.status(400).json({ message: "Store can only have 1 store manager." });
    }

    const isUserNameExits = await Users.findOne({ where: { username: username } });
    if (isUserNameExits) {
      return res.status(400).json({ message: "Username already exists.", success: false });
    }
    const user = await Users.create(req.body);
    return res.status(201).json({ success: true, user: user, message: "User created successfully" });
  } catch (e) {
    return res.status(500).json(e.message);
  }
};

const getAllUsers = async (req, res) => {
  const { Users } = await connectToDatabase();
  const { page = 1, limit = 10, search = "" } = req.query;

  // Parse page and limit as integers
  const parsedPage = parseInt(page, 10);
  const parsedLimit = parseInt(limit, 10);
  try {
    if (isNaN(parsedPage) || isNaN(parsedLimit) || parsedPage <= 0 || parsedLimit <= 0) {
      return res.status(400).json({
        message: "Invalid page or limit value. Both must be positive integers.",
      });
    }

    const offset = (parsedPage - 1) * parsedLimit;

    const users = await Users.findAndCountAll({
      where: {
        [Op.or]: [{ username: { [Op.like]: `%${search}%` } }, { email: { [Op.like]: `%${search}%` } }],
      },
      limit: parsedLimit,
      offset,
    });

    return res.status(200).json({
      message: "users retrieved successfully",
      users: users.rows,
      totalusers: users.count,
      totalPages: Math.ceil(users.count / parsedLimit),
      currentPage: parsedPage,
      limit: parsedLimit,
    });
  } catch (error) {
    console.error("Error in getAllusers:", error);
    return res.status(500).json({
      message: "Failed to retrieve users",
      error: error.message,
    });
  }
};

const updateUser = async (req, res) => {
  const { Users } = await connectToDatabase();
  try {
    const [updated] = await Users.update(req.body, { where: { user_id: req.params.id } });

    if (updated === 0) {
      return res.status(404).json({ error: "user not found" });
    }
    return res.status(200).json({ message: "Updated successfully" });
  } catch (e) {
    console.log(e);
    return res.status(500).json(e.message);
  }
};

const getStoreUsers = async (req, res) => {
  const { Users } = await connectToDatabase();

  try {
    const users = await Users.findAndCountAll({
      where: { store_id: req.params.storeid },
    });

    return res.status(200).json({
      message: "users retrieved successfully",
      users: users.rows,
    });
  } catch (error) {
    console.error("Error in getAllusers:", error);
    return res.status(500).json({
      message: "Failed to retrieve users",
      error: error.message,
    });
  }
};

module.exports = { createUser, getAllUsers, updateUser, getStoreUsers };
