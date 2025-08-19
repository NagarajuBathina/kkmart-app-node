const express = require("express");
const router = express.Router();
const controller = require("../controllers/billing.controller");

router.get("/get_store_product_details", controller.searchStoreProducts);

module.exports = router;
