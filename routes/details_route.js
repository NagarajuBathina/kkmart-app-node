const express = require("express");
const controller = require("../controller/details");
const router = express.Router();

router.post("/get-details", controller.getDetailsByRole);
router.get("/get-jma-customer-details/:refferalCode", controller.getDetailsOfJMAandCustomers);
router.get("/get-customer-details/:refferalCode", controller.getCustomersDetails);
router.get("/get-customer-details-by-sma-role/:refferalCode", controller.getCustomersDetailsBySMArole);

module.exports = router;
