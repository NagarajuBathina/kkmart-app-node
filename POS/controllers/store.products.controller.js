const connectToDatabase = require("../../misc/db");
const { Op, Sequelize, where } = require("sequelize");

const addProductsToStore = async (req, res) => {
  let transaction;
  const { product_ids, store_id, product_quantities } = req.body;

  try {
    const { sequelize, Products, StoreProducts, DummyStoreProducts } = await connectToDatabase();
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

      await DummyStoreProducts.create(finalData, { transaction });
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

const getStoreProductDetails = async (req, res) => {
  const { Products, Stores, DummyStoreProducts } = await connectToDatabase();
  const { storeid } = req.params;
  console.log(storeid);
  try {
    const storeData = await DummyStoreProducts.findAll({
      where: { store_id: storeid },
      include: [
        {
          model: Products,
        },
        {
          model: Stores,
        },
      ],
      raw: true,
      nest: true,
      order: [["added_on", "DESC"]],
    });

    if (!storeData || storeData.length === 0) {
      return res.status(400).json({ message: "No data found" });
    }

    return res.status(200).json({ data: storeData });
  } catch (error) {
    console.error("Error :", error);
    return res.status(500).json({
      message: "Failed to fetch store",
      error: error.message,
    });
  }
};

const updateStroeProductChecked = async (req, res) => {
  const { DummyStoreProducts } = await connectToDatabase();
  const { remarks, remarks_quantity, status, checked_on } = req.body;
  const { id } = req.params;
  try {
    const [updated] = await DummyStoreProducts.update(
      {
        remarks,
        remarks_quantity,
        status,
        checked_on,
      },
      { where: { id } }
    );

    if (updated === 0) {
      return res.status(400).json({ message: "no data found" });
    }

    return res.status(200).json({ message: "updated successfully", success: true });
  } catch (error) {
    console.error("Error :", error);
    return res.status(500).json({
      message: "Failed to fetch store",
      error: error.message,
    });
  }
};

const updateStroeProductConfirmed = async (req, res) => {
  let transaction;
  const { StoreProducts, DummyStoreProducts, sequelize } = await connectToDatabase();
  const { remarks_quantity, status, confirmed_on, product_id, store_id, quantity } = req.body;
  const { id } = req.params;

  transaction = await sequelize.transaction();

  console.log(req.body);
  try {
    const [updated] = await DummyStoreProducts.update(
      {
        // quantity: Sequelize.literal(`quantity - ${parseInt(remarks_quantity, 10)}`),
        remarks_quantity,
        status,
        confirmed_on,
      },
      { where: { id }, transaction }
    );

    if (updated === 0) {
      return res.status(400).json({ message: "no data found" });
    }

    const isExistingItem = await StoreProducts.findOne({
      where: { product_id: product_id, store_id: store_id },
    });

    console.log(isExistingItem);

    if (isExistingItem) {
      isExistingItem.quantity = Number(isExistingItem.quantity) + Number(quantity);
      await isExistingItem.save({ transaction });
    } else {
      await StoreProducts.create(req.body, { transaction });
    }

    await transaction.commit();
    return res.status(200).json({ message: "updated successfully", success: true });
  } catch (error) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    console.error("Error :", error);
    return res.status(500).json({
      message: "Failed to fetch store",
      error: error.message,
    });
  }
};

module.exports = { addProductsToStore, getStoreProductDetails, updateStroeProductChecked, updateStroeProductConfirmed };
