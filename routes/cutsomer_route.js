const express = require("express");
const controller = require("../controller/customer");
const router = express.Router();

router.post("/create-customer", controller.createCustomer);
router.get("/get-customer-data/:phone", controller.getCustomerDetails);
router.post("/monthly-renewal", controller.customerMonthlyRenewal);
router.post("/validate_before_creating_customer", controller.validateBeforeCreatingCustomer);

module.exports = router;
