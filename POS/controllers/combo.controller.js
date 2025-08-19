const connectToDatabase = require("../../misc/db");

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

module.exports = {
  addCombo,
};
