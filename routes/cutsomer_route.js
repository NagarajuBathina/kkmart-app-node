const express = require("express");
const controller = require("../controller/customer");
const upload = require("../middleware/file_upload");
const router = express.Router();

router.post("/create_customer", controller.createCustomer);
router.get("/get_customer_data/:phone", controller.getCustomerDetails);
router.post("/monthly_renewal", controller.customerMonthlyRenewal);
router.post("/validate_before_creating_customer", controller.validateBeforeCreatingCustomer);
router.get("/get_renewal_data_by_id/:joined_by", controller.getRenewalHistory);
router.get("/get_customer_payment_data_by_id/:joined_by", controller.getCustomerPaymentHistory);
router.post("/update_profile_for_customer", upload.single("profile"), controller.uploadProfileforCustomer);

module.exports = router;
