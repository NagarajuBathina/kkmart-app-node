const connectToDatabase = require("../../misc/db");
const sequelize = require("sequelize");

// create supplier
const createSupplier = async (req, res) => {
  try {
    const { Supplier } = await connectToDatabase();
    // check if supplier already exists
    const existingSupplier = await Supplier.findOne({
      where: {
        email: req.body.email,
        suppliers_name: req.body.suppliers_name,
        phone: req.body.phone,
      },
    });
    if (existingSupplier && existingSupplier.is_active) {
      return res.status(400).json({ message: "Supplier already exists" });
    }
    // check if supplier is exists but is_active is false then update is_active to true and also update other fields
    if (existingSupplier && !existingSupplier.is_active) {
      const updated_by = req.body.created_by;
      await existingSupplier.update({
        is_active: true,
        updated_by: updated_by,
        updated_on: new Date(),
      });
      return res.status(200).json({ message: "Supplier updated successfully" });
    }
    const supplier = await Supplier.create(req.body);
    return res.status(201).json({ supplier, message: "Supplier created successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error creating supplier", error: err.message });
  }
};

// get all suppliers
const getAllSuppliers = async (req, res) => {
  try {
    const { Supplier } = await connectToDatabase();
    const suppliers = await Supplier.findAll({ where: { is_active: true } });
    return res.status(200).json(suppliers);
  } catch (err) {
    return res.status(500).json({ message: "Error getting all suppliers", error: err.message });
  }
};

// get supplier by id
const getSupplierById = async (req, res) => {
  try {
    const { Supplier } = await connectToDatabase();
    const supplier = await Supplier.findOne({
      where: {
        suppliers_id: req.params.id,
        is_active: true,
      },
    });
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    return res.status(200).json(supplier);
  } catch (err) {
    return res.status(500).json({ message: "Error getting supplier by id", error: err.message });
  }
};

// update supplier
const updateSupplier = async (req, res) => {
  try {
    const { Supplier } = await connectToDatabase();
    const supplier = await Supplier.findOne({
      where: {
        suppliers_id: req.params.id,
        is_active: true,
      },
    });
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    await supplier.update(req.body);
    return res.status(200).json({ supplier, message: "updated successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Error updating supplier", error: err.message });
  }
};

// delete supplier
const deleteSupplier = async (req, res) => {
  const { Supplier, Product, sequelizeDatabase } = await connectToDatabase();
  const transaction = await sequelizeDatabase.transaction();
  try {
    const supplier = await Supplier.findOne({
      where: {
        suppliers_id: req.params.id,
        is_active: true,
      },
      transaction,
    });
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    await supplier.update({ is_active: false }, { transaction });
    await Product.update(
      {
        is_active: false,
      },
      {
        where: {
          supplier_id: req.params.id,
        },
        transaction,
      }
    );
    await transaction.commit();
    return res.status(200).json(supplier);
  } catch (err) {
    await transaction.rollback();
    return res.status(500).json({ message: "Error deleting supplier", error: err.message });
  }
};

// get all supplier names dropdown
const getSupplierNames = async (req, res) => {
  try {
    const { Supplier } = await connectToDatabase();
    const suppliers = await Supplier.findAll({
      attributes: ["suppliers_id", "suppliers_name", "city", "address"],
      where: { is_active: true, status: true },
    });
    return res.status(200).json(suppliers);
  } catch (err) {
    return res.status(500).json({ message: "Error getting supplier names", error: err.message });
  }
};

module.exports = {
  createSupplier,
  getAllSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
  getSupplierNames,
};
