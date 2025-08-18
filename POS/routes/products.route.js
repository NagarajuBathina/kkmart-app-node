const express = require("express");
const router = express.Router();
const {
  addProduct,
  getProducts,
  getProductByBarcode,
  updateProductByBarcode,
  deleteProduct,
  bulkUploadProducts,
  searchProducts,
} = require("../controllers/products.controller");

router.post("/add_products", addProduct);
router.post("/bulk_upload_products", bulkUploadProducts);
router.get("/get_all_products", getProducts);
router.get("/get_product_barcode_details/:barcode", getProductByBarcode);
router.put("/update_product/:barcode", updateProductByBarcode);
router.delete("/delete_product/:barcode", deleteProduct);
router.get("/search_products", searchProducts);
 
module.exports = router;


// const express = require("express");
// const router = express.Router();
// const { authenticateToken, authorizeRole } = require("../middleware/auth.middleware");

// const {
//     addProduct,
//     getProducts,
//     getProductByBarcode,
//     updateProductByBarcode,
//     deleteProduct,
//     bulkUploadProducts,
//     searchProducts,
// } = require("../controllers/products.controller");

// // Public routes
// router.get("/get_all_products", getProducts);
// router.get("/get_product_barcode_details/:barcode", getProductByBarcode);
// router.get("/search_products", searchProducts);

// // Protected routes
// router.post("/add_products", authenticateToken, authorizeRole(['admin', 'manager']), addProduct);
// router.post("/bulk_upload_products", authenticateToken, authorizeRole(['admin']), bulkUploadProducts);
// router.put("/update_product/:barcode", authenticateToken, authorizeRole(['admin', 'manager']), updateProductByBarcode);
// router.delete("/delete_product/:barcode", authenticateToken, authorizeRole(['admin']), deleteProduct);

// module.exports = router;
