const connectToDatabase = require("../../misc/db");
const { Op } = require("sequelize");
const sequelize = require("sequelize");

const addProductsToStore = async (req, res) => {
  let transaction;
  const { product_ids, store_id, product_quantities } = req.body;

  try {
    const { sequelize, Products, StoreProducts } = await connectToDatabase();
    transaction = await sequelize.transaction();

    // Convert comma-separated strings into arrays
    const productIdsArray = product_ids.split(",").map((id) => id.trim());
    const productQuantityArray = product_quantities.split(",").map((q) => parseInt(q.trim(), 10));

    for (let i = 0; i < productIdsArray.length; i++) {
      const productId = productIdsArray[i];
      const quantity = productQuantityArray[i];

      // Find product instance (not raw)
      const productData = await Products.findOne({
        where: { products_id: productId, is_active: true },
        transaction,
      });

      if (!productData) {
        await transaction.rollback();
        return res.status(404).json({ message: `Product ${productId} not found` });
      }

      // Deduct quantity
      productData.quantity = productData.quantity - quantity;

      if (productData.quantity < 0) {
        await transaction.rollback();
        return res.status(400).json({ message: `Not enough stock for product ${productId}` });
      }

      await productData.save({ transaction });

      // Insert record into store products
      const finalData = {
        store_id: store_id,
        product_id: productId,
        quantity: quantity,
        added_on: new Date(),
      };

      await StoreProducts.create(finalData, { transaction });
    }
    await transaction.commit();
    return res.status(200).json({ message: "Products added to store successfully" });
  } catch (error) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    console.error("Error in addProductToStore:", error);
    return res.status(500).json({
      message: "Failed to add product to store",
      error: error.message,
    });
  }
};

module.exports = { addProductsToStore };
