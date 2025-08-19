const connectToDatabase = require("../../misc/db");
const { Op, Sequelize } = require("sequelize");

// get product details
const searchStoreProducts = async (req, res) => {
  try {
    const { Products, StoreProducts } = await connectToDatabase();
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

    // Transform the response
    const transformedProducts = productsData.map((p) => ({
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
    }));

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

module.exports = { searchStoreProducts };
