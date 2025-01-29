const express = require("express");
const controller = require("../controller/customer");
const router = express.Router();

router.post("/create-customer", controller.createCustomer);

module.exports = router;
