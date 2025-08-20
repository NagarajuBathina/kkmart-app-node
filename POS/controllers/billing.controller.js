const connectToDatabase = require("../../misc/db");
const { Op, Sequelize } = require("sequelize");

// get product details
const searchStoreProducts = async (req, res) => {
  try {
    const { Products, StoreProducts, Combo } = await connectToDatabase();
    const { search, store_id } = req.query;

    if (!search) {
      return res.status(400).json({
        message: "Search parameter is required",
      });
    }

    const productsData = await StoreProducts.findAll({
      where: {
        status: "Confirmed",
        store_id: store_id,
      },
      include: [
        {
          model: Products,
          where: {
            [Op.or]: [{ products_name: { [Op.like]: `%${search}%` } }, { barcode: { [Op.like]: `%${search}%` } }],
          },
        },
      ],
    });

    const combosData = await Combo.findAll({
      where: {
        store_id,
        combo_name: { [Op.like]: `%${search}%` },
      },
    });

    // Transform the response
    let transformedProducts;
    if (!productsData || productsData.length === 0) {
      transformedProducts = combosData.map((combo) => ({
        products_name: combo.combo_name,
        products_price: parseFloat(combo.combo_price),
        discount_price: parseFloat(combo.combo_price),
        barcode: combo.combo_id,
        is_combo: true,
      }));
    } else {
      transformedProducts = productsData.map((p) => ({
        store_product_id: p.id,
        store_id: p.store_id,
        quantity: p.quantity,
        status: p.status,
        products_id: p.pos_product.products_id,
        products_name: p.pos_product.products_name,
        products_price: parseFloat(p.pos_product.products_price),
        discount_price: parseFloat(p.pos_product.discount_price),
        barcode: p.pos_product.barcode,
        gst: p.pos_product.gst,
        //   unit: p.Products.unit,
        qty_alert: p.pos_product.qty_alert,
        is_combo: false,
      }));
    }

    return res.status(200).json({
      count: transformedProducts.length,
      products: transformedProducts,
    });
  } catch (error) {
    console.error("Error in searchProducts:", error);
    return res.status(500).json({
      message: "Failed to search products",
      error: error.message,
    });
  }
};

// billing products
const billing = async (req, res) => {
  let transaction;
  const { StoreProducts, ComboProduct, Customers, OrderItems, Orders, sequelize } = await connectToDatabase();
  transaction = await sequelize.transaction();

  const {
    customer_id,
    customer_joined_by,
    user_id,
    total_amount,
    payment_method,
    store_id,
    is_existing_user,
    customer_phone_number,
    products,
  } = req.body;

  console.log(req.body);

  try {
    const ordersData = {
      customer_id,
      user_id,
      total_amount,
      payment_method,
      store_id,
    };

    // const order = await Orders.create(ordersData, { transaction });
    // const orderId = order.orders_id;

    if (Array.isArray(products)) {
      for (const prod of products) {
        const orderItem = {
          // order_id: orderId,
          is_combo: prod.is_combo,
          price: prod.price,
          quantity: prod.quantity,
        };

        if (prod.is_combo === true) {
          const productId = await ComboProduct.findAll({ where: { combo_id: prod.product_id } });
        }

        let finalData = {
          ...orderItem,
          product_id: prod.is_combo === true ? productId : prod.product_id,
        };

        console.log(finalData);

        // await OrderItems.create(finalData, { transaction });
      }
    }

    return res.status(200).json({ message: "purchased successfully", success: true });
  } catch (error) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    console.error("Error billing:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { searchStoreProducts, billing };
