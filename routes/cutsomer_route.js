const express = require("express");
const controller = require("../controller/customer");
const router = express.Router();

router.post("/create-customer", controller.createCustomer);
router.post("/get-customer-data", controller.getCustomerDetails);
router.post("/monthly-renewal", controller.customerMonthlyRenewal);

module.exports = router;
