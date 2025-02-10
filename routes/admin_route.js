const express = require("express");
const controller = require("../controller/admin");
const router = express.Router();

router.get("/get_employee_data", controller.allEmployeesData);
router.get("/get_all_monthly_renwal_data", controller.allMonthlyRenewalsData);
router.get("/get_all_customer_data", controller.allCustomersData);
router.get("/get_all_withdrawl_data", controller.allWithdrawlsData);
router.get("/get_all_employee_payment_data", controller.allEmployeesPayments);

module.exports = router;
