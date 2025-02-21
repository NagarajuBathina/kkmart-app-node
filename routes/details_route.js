const express = require("express");
const controller = require("../controller/details");
const router = express.Router();

router.post("/get_details_by_role", controller.getDetailsByRole);
router.get("/get_all_category_details/:refferalCode", controller.getAllCategoryDetailsById);
router.get("/get_customer_details/:refferalCode", controller.getCustomersDetails);
router.get("/get_customer_details_by_sma_role/:refferalCode", controller.getCustomersDetailsBySMArole);
router.get("/get_customer_details_for_mma_and_above/:refferalCode", controller.getCustomersForMMAandAbove);

module.exports = router;
