const { where } = require("sequelize");
const connectTodb = require("../misc/db");

const createCustomer = async (req, res) => {
  try {
    const { Customer } = await connectTodb();
    let { phone, adhaar } = req.body;

    const existingAdhaar = await Customer.findOne(adhaar);
    if (existingAdhaar) {
      return res.status(400).json({ error: "Customer already exists" });
    }

    const exitstingPhone = await Customer.findOne({ where: phone });
    if (exitstingPhone) {
      return res.status(400).json({ error: "Phone number already exists" });
    }

    let newCustomer = await Customer.create(req.body);
    return res.status(201).json(newCustomer);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

module.exports = { createCustomer };
