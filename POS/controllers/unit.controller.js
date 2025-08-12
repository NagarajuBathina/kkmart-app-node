const connectToDatabase = require("../../misc/db");

// Create a new unit
const createUnit = async (req, res) => {
  console.log(req.body);
  try {
    const { Unit } = await connectToDatabase();
    if (!req.body.unit) {
      return res.status(400).json({ message: "Unit can not be empty" });
    }
    const data = await Unit.create(req.body);
    return res.status(201).json({ message: "Unit created successfully", data });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
};

// Retrieve all units
const getAllUnits = async (req, res) => {
  try {
    const { Unit } = await connectToDatabase();
    const data = await Unit.findAll({
      where: { is_active: true },
    });
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Find a single unit with an id
const getUnitById = async (req, res) => {
  try {
    const { Unit } = await connectToDatabase();
    const data = await Unit.findOne({
      where: {
        unit_id: req.params.id,
      },
    });
    if (!data) {
      return res.status(404).json({ message: "Unit not found" });
    }
    return res.status(200).json({ message: "Unit found", data });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Update a unit by the id in the request
const updateUnit = async (req, res) => {
  try {
    const { Unit } = await connectToDatabase();
    const data = await Unit.findOne({
      where: {
        unit_id: req.params.id,
      },
    });

    if (!data) {
      return res.status(404).json({ message: "Unit not found" });
    }

    // Remove no_of_products from request body if it exists
    const { no_of_products, ...updateData } = req.body;

    const updatedData = await data.update(updateData);
    return res.status(200).json({
      message: "Unit updated successfully",
      updatedData,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Delete a unit with the specified id in the request
const deleteUnit = async (req, res) => {
  try {
    const { Unit } = await connectToDatabase();
    const data = await Unit.findOne({
      where: {
        unit_id: req.params.id,
      },
    });
    if (!data) {
      return res.status(404).json({ message: "Unit not found" });
    }
    await data.update({
      is_active: false,
    });
    return res.status(200).json({ message: "Unit deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getAllActiveUnitsDropdown = async (req, res) => {
  try {
    const { Unit } = await connectToDatabase();
    const units = await Unit.findAll({
      where: { is_active: true, status: true },
      attributes: ["unit_id", "unit"],
    });
    return res.status(200).json(units);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createUnit,
  getAllUnits,
  getUnitById,
  updateUnit,
  deleteUnit,
  getAllActiveUnitsDropdown,
};
