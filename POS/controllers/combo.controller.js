const connectToDatabase = require("../../misc/db");
const { Op, Sequelize } = require("sequelize");
// add combo
const addCombo = async (req, res) => {
  try {
    const { Combo, ComboProduct, Product } = await connectToDatabase();
    const {
      combo_name,
      combo_description,
      combo_price,
      combo_discount_price,
      combo_quantity,
      status,
      created_by,
      products,
    } = req.body;

    console.log(req.body);

    // Create the combo
    const newCombo = await Combo.create({
      combo_name,
      combo_description,
      combo_price,
      combo_discount_price,
      combo_quantity,
      status,
      created_by,
    });
    // Create ComboProduct entries for each product in the products array
    const comboProducts = [];
    if (Array.isArray(products)) {
      for (const prod of products) {
        // Find the product_id by barcode
        const productRecord = await Product.findOne({ where: { barcode: prod.barcode } });
        const product_id = productRecord ? productRecord.products_id : null;
        const comboProduct = await ComboProduct.create({
          barcode: prod.barcode,
          products_name: prod.products_name,
          quantity_in_combo: prod.quantity_in_combo,
          available_quantity: prod.available_quantity,
          unit_price: prod.unit_price,
          combo_id: newCombo.combo_id,
          product_id: product_id,
        });
        comboProducts.push(comboProduct);
      }
    }
    // Attach comboProducts to the response
    newCombo.dataValues.comboProducts = comboProducts;
    return res.status(201).json({
      message: "Combo added successfully",
      data: newCombo,
    });
  } catch (error) {
    console.error("Error adding combo:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

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

    console.log(req.body);

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

module.exports = {
  addComboProduct,
};
