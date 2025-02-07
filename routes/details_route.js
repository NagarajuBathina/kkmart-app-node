const express = require("express");
const controller = require("../controller/details");
const router = express.Router();

router.post("/get_details", controller.getDetailsByRole);
router.get("/get_all_category_details/:refferalCode", controller.getDetailsOfJMAandCustomers);
router.get("/get_customer_details/:refferalCode", controller.getCustomersDetails);
router.get("/get_customer_details_by_sma_role/:refferalCode", controller.getCustomersDetailsBySMArole);

module.exports = router;
