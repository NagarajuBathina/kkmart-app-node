const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { Op, fn, col, literal, where } = require("sequelize");
const connectToDatabase = require("../../misc/db");

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

const getDashboardStatastics = async (req, res) => {
  const { Orders, Products, Category, Users, Supplier, Brand, Customer, Stores, sequelize } = await connectToDatabase();

  try {
    const stats = {
      // Sales Stats
      totalSales: await Orders.sum("total_amount"),
      totalOrders: await Orders.count(),

      // stores stats
      totalStores: await Stores.count(),

      // brands stats
      totalBrands: await Brand.count(),

      // Inventory Stats
      totalProducts: await Products.count({
        where: { is_active: true },
      }),
      lowStockProducts: await Products.count({
        where: sequelize.literal("quantity <= qty_alert"),
      }),

      outOfStockProducts: await Products.count({
        where: {
          quantity: {
            [Op.eq]: 0,
          },
        },
      }),

      // User Stats
      totalCustomers: await Customer.count(),
      totalUsers: await Users.count(),

      // Category Stats
      categoriesCount: await Category.count({
        where: { is_active: true },
      }),

      // Brand Stats
      brandsCount: await Brand.count({
        where: { is_active: true },
      }),

      // Supplier Stats
      suppliersCount: await Supplier.count({
        where: { is_active: true },
      }),

      //  Today's sales
      todaySales: await Orders.sum("total_amount", {
        where: where(fn("DATE", col("order_date")), fn("CURDATE")),
      }),

      // This week's sales
      weekSales: await Orders.sum("total_amount", {
        where: where(fn("YEARWEEK", col("order_date")), fn("YEARWEEK", fn("CURDATE"))),
      }),

      //  This month's sales
      monthSales: await Orders.sum("total_amount", {
        where: where(fn("MONTH", col("order_date")), fn("MONTH", fn("CURDATE"))),
      }),
    };

    return res.status(200).json(stats);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

const getDashboardStats = async (req, res) => {
  const db = await connectToDatabase();
  const { Orders, Products, Category, Users, Supplier, Brand, OrderItems, Customer, sequelize } = db;

  try {
    const [stats, recentTransactions, topProducts, salesByCategory, paymentMethods] = await Promise.all([
      // Base stats
      {
        // Sales Stats
        totalSales: (await Orders.sum("total_amount")) || 0,
        totalOrders: await Orders.count(),
        dailySales:
          (await Orders.sum("total_amount", {
            where: sequelize.where(fn("DATE", sequelize.col("order_date")), fn("CURDATE")),
          })) || 0,
        weeklySales:
          (await Orders.sum("total_amount", {
            where: sequelize.where(
              sequelize.fn("YEARWEEK", sequelize.col("order_date")),
              sequelize.fn("YEARWEEK", sequelize.fn("CURDATE"))
            ),
          })) || 0,
        monthlySales:
          (await Orders.sum("total_amount", {
            where: sequelize.where(
              sequelize.fn("MONTH", sequelize.col("order_date")),
              sequelize.fn("MONTH", sequelize.fn("CURDATE"))
            ),
          })) || 0,

        // Inventory Stats
        totalProducts: await Products.count({ where: { is_active: true } }),
        lowStockProducts: await Products.count({
          where: sequelize.literal("quantity <= qty_alert"),
        }),
        outOfStockProducts: await Products.count({
          where: { quantity: 0, is_active: true },
        }),
        criticalStock: await Products.count({
          where: sequelize.literal("quantity <= FLOOR(qty_alert * 0.5)"),
        }),

        // User Stats
        totalCustomers: await Customer.count(),
        totalUsers: await Users.count(),
        activeUsers: await Users.count({ where: { is_active: true } }),

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
      Orders.findAll({
        order: [["order_date", "DESC"]],
        limit: 5,
        attributes: ["orders_id", "order_date", "total_amount", "payment_method"],
        include: [
          {
            model: Customer,
            attributes: ["name"],
          },
        ],
      }),

      // Top Selling Products
      OrderItems.findAll({
        attributes: ["product_id", [sequelize.fn("SUM", sequelize.col("pos_order_items.quantity")), "total_sold"]],
        group: ["product_id"],
        order: [[sequelize.literal("total_sold"), "DESC"]],
        limit: 5,
        include: [
          {
            model: Products,
            attributes: ["products_name", "barcode"],
          },
        ],
      }),
      getSalesByCategory(Orders, OrderItems, Products, Category, sequelize),
      getSalesByPaymentMethod(Orders, sequelize),
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
      salesTrend: await getSalesTrend(Orders, sequelize),
      charts: {
        salesByCategory,
        salesByPaymentMethod: paymentMethods,
        dailySalesGraph: await getSalesTrend(Orders, sequelize),
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
async function getSalesTrend(Orders, sequelize) {
  const results = await Orders.findAll({
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
async function getSalesByCategory(Orders, OrderItems, Products, Category, sequelize) {
  const results = await OrderItems.findAll({
    attributes: [
      [sequelize.fn("SUM", sequelize.literal("pos_order_items.quantity * pos_order_items.price")), "total_sales"],
    ],
    include: [
      {
        model: Products,
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
async function getSalesByPaymentMethod(Orders, sequelize) {
  const results = await Orders.findAll({
    attributes: ["payment_method", [sequelize.fn("SUM", sequelize.col("total_amount")), "total_sales"]],
    group: ["payment_method"],
    raw: true,
  });

  return results.map((item) => ({
    paymentMethod: item.payment_method,
    sales: parseFloat(item.total_sales) || 0,
  }));
}

const getStoreDashboardStatastics = async (req, res) => {
  const { Orders, StoreProducts, Brand, Stores, sequelize } = await connectToDatabase();
  const { storeid } = req.params;
  try {
    const stats = {
      // Sales Stats
      totalSales: await Orders.sum("total_amount", { where: { store_id: storeid } }),
      totalOrders: await Orders.count({ where: { store_id: storeid } }),

      // stores stats
      totalStores: await Stores.count({ where: { store_id: storeid } }),

      // Inventory Stats
      totalProducts: await StoreProducts.count({ where: { store_id: storeid } }),

      outOfStockProducts: await StoreProducts.count({
        where: {
          quantity: {
            [Op.eq]: 0,
          },
          store_id: storeid,
        },
      }),

      //  Today's sales
      todaySales: await Orders.sum("total_amount", {
        where: {
          [Op.and]: [where(fn("DATE", col("order_date")), fn("CURDATE")), { store_id: storeid }],
        },
      }),

      // This week's sales
      weekSales: await Orders.sum("total_amount", {
        where: {
          [Op.and]: [where(fn("YEARWEEK", col("order_date")), fn("YEARWEEK", fn("CURDATE"))), { store_id: storeid }],
        },
      }),

      //  This month's sales
      monthSales: await Orders.sum("total_amount", {
        where: {
          [Op.and]: [where(fn("MONTH", col("order_date")), fn("MONTH", fn("CURDATE"))), { store_id: storeid }],
        },
      }),
    };

    return res.status(200).json(stats);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

module.exports = {
  login,
  signup,
  getDashboardStats,
  getDashboardStatastics,
  getStoreDashboardStatastics,
};
