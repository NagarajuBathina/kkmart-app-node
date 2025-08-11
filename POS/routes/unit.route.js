const express = require("express");
const router = express.Router();
const {
  createUnit,
  getAllUnits,
  getUnitById,
  updateUnit,
  deleteUnit,
  getAllActiveUnitsDropdown
} = require("../controllers/unit.controller");

router.post("/create_unit", createUnit);
router.get("/get_all_units", getAllUnits);
router.get("/get_unit/:id", getUnitById);
router.put("/update_unit/:id", updateUnit);
router.delete("/delete_unit/:id", deleteUnit);
router.get("/get_all_active_units_dropdown", getAllActiveUnitsDropdown);

module.exports = router;
