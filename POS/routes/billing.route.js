const express = require("express");
const router = express.Router();
const controller = require("../controllers/billing.controller");

router.get("/get_store_product_details", controller.searchStoreProducts);
router.post("/billing", controller.billing);
router.get("/check_customer_purchasing_data/:phone", controller.checkCustomerPurchasing);

module.exports = router;
