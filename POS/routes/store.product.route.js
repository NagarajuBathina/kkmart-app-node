const express = require("express");
const router = express.Router();
const controller = require("../controllers/store.products.controller");

router.post("/crete_store_products", controller.addProductsToStore);
router.get("/get_dummy_store_details/:storeid", controller.getDummyStoreProductDetails);
router.get("/get_store_details/:storeid", controller.getStoreProductDetails);
router.put("/update_checked/:id", controller.updateStroeProductChecked);
router.put("/update_confirmed/:id", controller.updateStroeProductConfirmed);

module.exports = router;
