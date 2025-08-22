const connectToDatabase = require("../../misc/db");
const { Op, Sequelize, where, Model } = require("sequelize");


// add combo
const addComboProduct = async (req, res) => {
  let transaction;
  try {
    const { Combo, ComboProduct, StoreProducts, sequelize } = await connectToDatabase();
    transaction = await sequelize.transaction();
    const {
      combo_name,
      combo_description,
      combo_price,
      product_price,
      combo_quantity,
      created_by,
      products,
      product_ids,
      barcodes,
      store_id,
      combo_gst,
    } = req.body;


    const isComboNameExist = await Combo.findOne({ where: { combo_name: combo_name.trim() } });

    if (isComboNameExist) {
      return res.status(400).json({ message: "combo name already exist.", success: false });
    }

    const productsArray = products.split(",").map((product) => product.trim());
    const produtctIdsArray = product_ids.split(",").map((id) => id.trim());
    const barcodesArray = barcodes.split(",").map((barcode) => barcode.trim());
    const priductPricesArray = product_price.split(",").map((price) => price.trim());

    const comboData = {
      combo_name,
      combo_description,
      combo_price,
      combo_quantity,
      created_by,
      combo_gst,
      store_id,
    };

    // ✅ Create combo and capture inserted row
    const createdCombo = await Combo.create(comboData, { transaction });
    const comboId = createdCombo.combo_id;

    for (let i = 0; i < produtctIdsArray.length; i++) {
      const productId = produtctIdsArray[i];
      const barcode = barcodesArray[i];
      const productPrice = priductPricesArray[i];
      const productName = productsArray[i];

      // const storeProductData = {
      //   product_id: productId,
      //   store_id: store_id,
      //   quantity: combo_quantity,
      // };

      // // Create store products
      // await StoreProducts.create(storeProductData, { transaction });

      const comboProductData = {
        barcode: barcode,
        products_name: productName,
        price: productPrice,
        product_id: productId,
        combo_id: comboId,
      };

      // Create combo products
      await ComboProduct.create(comboProductData, { transaction });
    }

    await transaction.commit();
    return res.status(201).json({ message: "combo created successfully", success: true });
  } catch (error) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    console.error("Error adding combo:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getComboItemsOfStore = async (req, res) => {
  const { Combo, ComboProduct } = await connectToDatabase();
  try {
    const comboProducts = await Combo.findAll({
      where: { store_id: req.params.storeid },
      include: [{ model: ComboProduct }],
    });
    if (!comboProducts || comboProducts.length === 0) {
      return res.status(400).json({ message: "no combos found for this store" });
    }
    return res.status(200).json({ data: comboProducts, success: true, message: "fetched succssfully" });
  } catch (error) {
    console.error("Error adding combo:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  addComboProduct,
  getComboItemsOfStore,
};
