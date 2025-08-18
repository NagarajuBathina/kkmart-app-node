const express = require("express");
const router = express.Router();
const controller = require("../controllers/store.products.controller");

router.post("/crete_store_products", controller.addProductsToStore);

module.exports = router;
