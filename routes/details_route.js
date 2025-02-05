const express = require("express");
const controller = require("../controller/details");
const router = express.Router();

router.post("/get-details", controller.getDetailsByRole);
router.post("/get-jma-customer-details", controller.getDetailsOfJMAandCustomers);
router.get("/get-customer-details/:refferalCode", controller.getCustomersDetails);

module.exports = router;
