const express = require("express");
const controller = require("../controller/customer");
const upload = require("../middleware/file_upload");
const router = express.Router();

router.post("/create-customer", controller.createCustomer);
router.get("/get-customer-data/:phone", controller.getCustomerDetails);
router.post("/monthly-renewal", controller.customerMonthlyRenewal);
router.post("/validate_before_creating_customer", controller.validateBeforeCreatingCustomer);
router.get("/get_renewal_data_by_id/:phone", controller.getRenewalHistoryById);
router.post("/update_profile_for_customer", upload.single("profile"), controller.uploadProfileforCustomer);

module.exports = router;
