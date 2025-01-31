const express = require("express");
const controller = require("../controller/customer");
const router = express.Router();

router.post("/create-customer", controller.createCustomer);
router.get("/get-customer-data/:phone", controller.getCustomerDetails);
router.post("/monthly-renewal", controller.customerMonthlyRenewal);

module.exports = router;
