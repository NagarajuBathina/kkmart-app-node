const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const connectToDatabase = require("../../misc/db");

const { Op } = require("sequelize");

const login = async (req, res) => {
  try {
    const { Users } = await connectToDatabase();
    const { username, password } = req.body;

    const user = await Users.findOne({ where: { username, password } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // const isValidPassword = await bcrypt.compare(password, user.password);
    // if (!isValidPassword) {
    //   return res.status(401).json({ message: "Invalid credentials" });
    // }

    const JWT_SECRET = "kkmart.2025.pos.secretkey";

    const token = jwt.sign({ userId: user.user_id, role: user.role }, JWT_SECRET, { expiresIn: "24h" });

    await user.update({ last_login: new Date() });

    return res.status(200).json({
      token,
      user: user,
    });
  } catch (error) {
    console.error("Error in login:", error);
    return res.status(500).json({
      message: "Authentication failed",
      error: error.message,
    });
  }
};

const signup = async (req, res) => {
  try {
    const { User } = await connectToDatabase();
    const { username, password, email, role } = req.body;

    // Validate required fields
    if (!username || !password || !email) {
      return res.status(400).json({
        message: "Username, password and email are required",
      });
    }

    // Check if username already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Username or email already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = await User.create({
      username,
      password: hashedPassword,
      email,
      role: role || "cashier", // Default role
      last_login: new Date(),
    });

    // Generate JWT token
    const token = jwt.sign({ userId: user.user_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "24h" });

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        userId: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error in signup:", error);
    res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
};

// const getDashboardStats = async (req, res) => {
//   const {
//     Order,
//     Product,
//     Category,
//     User,
//     Supplier,
//     Brand,
//     Customer,
//     sequelizeDatabase
//   } = await connectToDatabase();

//   const stats = {
//     // Sales Stats
//     totalSales: await Order.sum('total_amount'),
//     totalOrders: await Order.count(),

//     // Inventory Stats
//     totalProducts: await Product.count({
//       where: { is_active: true }
//     }),
//     lowStockProducts: await Product.count({
//       where: sequelizeDatabase.literal('quantity <= qty_alert')
//     }),

//     // User Stats
//     totalCustomers: await Customer.count({
//       where: { is_active: true }
//     }),
//     totalUsers: await User.count(),

//     // Category Stats
//     categoriesCount: await Category.count({
//       where: { is_active: true }
//     }),

//     // Brand Stats
//     brandsCount: await Brand.count({
//       where: { is_active: true }
//     }),

//     // Supplier Stats
//     suppliersCount: await Supplier.count({
//       where: { is_active: true }
//     })
//   };

//   return res.status(200).json(stats);
// };

const getDashboardStats = async (req, res) => {
  const { Order, Product, Category, User, Supplier, Brand, Customer, OrderItem, sequelizeDatabase } =
    await connectToDatabase();

  try {
    const [stats, recentTransactions, topProducts, salesByCategory, paymentMethods] = await Promise.all([
      // Base stats
      {
        // Sales Stats
        totalSales: (await Order.sum("total_amount")) || 0,
        totalOrders: await Order.count(),
        dailySales:
          (await Order.sum("total_amount", {
            where: sequelizeDatabase.where(
              sequelizeDatabase.fn("DATE", sequelizeDatabase.col("order_date")),
              sequelizeDatabase.fn("CURDATE")
            ),
          })) || 0,
        weeklySales:
          (await Order.sum("total_amount", {
            where: sequelizeDatabase.where(
              sequelizeDatabase.fn("YEARWEEK", sequelizeDatabase.col("order_date")),
              sequelizeDatabase.fn("YEARWEEK", sequelizeDatabase.fn("CURDATE"))
            ),
          })) || 0,
        monthlySales:
          (await Order.sum("total_amount", {
            where: sequelizeDatabase.where(
              sequelizeDatabase.fn("MONTH", sequelizeDatabase.col("order_date")),
              sequelizeDatabase.fn("MONTH", sequelizeDatabase.fn("CURDATE"))
            ),
          })) || 0,

        // Inventory Stats
        totalProducts: await Product.count({ where: { is_active: true } }),
        lowStockProducts: await Product.count({
          where: sequelizeDatabase.literal("quantity <= qty_alert"),
        }),
        outOfStockProducts: await Product.count({
          where: { quantity: 0, is_active: true },
        }),
        criticalStock: await Product.count({
          where: sequelizeDatabase.literal("quantity <= FLOOR(qty_alert * 0.5)"),
        }),

        // User Stats
        totalCustomers: await Customer.count(),
        totalUsers: await User.count(),
        activeUsers: await User.count({ where: { is_active: true } }),

        // Category Stats
        categoriesCount: await Category.count(),
        activeCategories: await Category.count({ where: { is_active: true } }),

        // Brand Stats
        brandsCount: await Brand.count(),
        activeBrands: await Brand.count({ where: { is_active: true } }),

        // Supplier Stats
        suppliersCount: await Supplier.count(),
        activeSuppliers: await Supplier.count({ where: { is_active: true } }),
      },

      // Recent Transactions (last 5 orders)
      Order.findAll({
        order: [["order_date", "DESC"]],
        limit: 5,
        attributes: ["orders_id", "order_date", "total_amount", "payment_method"],
        include: [
          {
            model: Customer,
            attributes: ["customer_name"],
          },
        ],
      }),

      // Top Selling Products
      OrderItem.findAll({
        attributes: [
          "product_id",
          [sequelizeDatabase.fn("SUM", sequelizeDatabase.col("order_items.quantity")), "total_sold"],
        ],
        group: ["product_id"],
        order: [[sequelizeDatabase.literal("total_sold"), "DESC"]],
        limit: 5,
        include: [
          {
            model: Product,
            attributes: ["products_name", "barcode"],
          },
        ],
      }),
      getSalesByCategory(Order, OrderItem, Product, Category, sequelizeDatabase),
      getSalesByPaymentMethod(Order, sequelizeDatabase),
    ]);

    // Transform recent transactions
    const transformedTransactions = recentTransactions.map((order) => ({
      id: order.orders_id,
      date: order.order_date,
      amount: order.total_amount,
      paymentMethod: order.payment_method,
      customer: order.customer?.customer_name || "Walk-in",
    }));

    // Transform top products
    const transformedTopProducts = topProducts.map((item) => ({
      product_id: item.product_id,
      name: item.product.products_name,
      barcode: item.product.barcode,
      total_sold: item.get("total_sold"),
    }));

    return res.status(200).json({
      ...stats,
      recentTransactions: transformedTransactions,
      topProducts: transformedTopProducts,
      salesTrend: await getSalesTrend(Order, sequelizeDatabase),
      charts: {
        salesByCategory,
        salesByPaymentMethod: paymentMethods,
        dailySalesGraph: await getSalesTrend(Order, sequelizeDatabase),
      },
    });
  } catch (error) {
    console.error("Error in getDashboardStats:", error);
    return res.status(500).json({
      message: "Failed to fetch dashboard stats",
      error: error.message,
    });
  }
};

// Helper function for sales trend (last 7 days)
async function getSalesTrend(Order, sequelize) {
  const results = await Order.findAll({
    attributes: [
      [sequelize.fn("DATE", sequelize.col("order_date")), "date"],
      [sequelize.fn("SUM", sequelize.col("total_amount")), "total"],
    ],
    where: {
      order_date: {
        [sequelize.Sequelize.Op.gte]: sequelize.literal("DATE_SUB(CURDATE(), INTERVAL 7 DAY)"),
        [sequelize.Sequelize.Op.lte]: sequelize.literal("CURDATE()"),
      },
    },
    group: [sequelize.fn("DATE", sequelize.col("order_date"))],
    order: [[sequelize.col("date"), "ASC"]],
  });

  return results.map((item) => ({
    date: item.get("date"),
    total: parseFloat(item.get("total")) || 0,
  }));
}

// Helper function for sales by category
async function getSalesByCategory(Order, OrderItem, Product, Category, sequelizeDatabase) {
  const results = await OrderItem.findAll({
    attributes: [
      [
        sequelizeDatabase.fn("SUM", sequelizeDatabase.literal("order_items.quantity * order_items.price")),
        "total_sales",
      ],
    ],
    include: [
      {
        model: Product,
        attributes: [],
        include: [
          {
            model: Category,
            attributes: ["category"],
          },
        ],
      },
    ],
    group: ["product.category.category"],
    raw: true,
  });

  return results.map((item) => ({
    category: item["product.category.category"] || "Others",
    sales: parseFloat(item.total_sales) || 0,
  }));
}

// Helper function for payment method breakdown
async function getSalesByPaymentMethod(Order, sequelizeDatabase) {
  const results = await Order.findAll({
    attributes: ["payment_method", [sequelizeDatabase.fn("SUM", sequelizeDatabase.col("total_amount")), "total_sales"]],
    group: ["payment_method"],
    raw: true,
  });

  return results.map((item) => ({
    paymentMethod: item.payment_method,
    sales: parseFloat(item.total_sales) || 0,
  }));
}

module.exports = {
  login,
  signup,
  getDashboardStats,
};
