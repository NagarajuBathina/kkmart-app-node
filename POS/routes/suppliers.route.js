const express = require("express");
const router = express.Router();

const {
  createSupplier,
  getAllSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
  getSupplierNames,
} = require("../controllers/suppliers.controller");

router.post("/create_supplier", createSupplier);
router.get("/get_all_suppliers", getAllSuppliers);
router.get("/get_supplier_by_id/:id", getSupplierById);
router.put("/update_supplier/:id", updateSupplier);
router.delete("/delete_supplier/:id", deleteSupplier);
router.get("/get_supplier_names", getSupplierNames);

module.exports = router;
