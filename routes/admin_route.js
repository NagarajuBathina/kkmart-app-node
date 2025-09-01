const express = require("express");
const controller = require("../controller/admin");
const upload = require("../middleware/file_upload");
const router = express.Router();

router.get("/get_employee_data", controller.allEmployeesData);
router.get("/get_all_monthly_renwal_data", controller.allMonthlyRenewalsData);
router.get("/get_all_customer_data", controller.allCustomersData);
router.get("/get_all_withdrawl_data", controller.allWithdrawlsData);
router.get("/get_all_employee_payment_data", controller.allEmployeesPaymentsData);
router.get("/get_employee_details_by_id/:phone", controller.EmployeeFullDetailsById);
router.put("/update_employee_bankdetails/:slno", controller.updateEmployeeBankDetails);
router.put("/update_employee_details/:slno", controller.updateEmployeePersonalDetails);
router.get("/get_dashboard_details", controller.getDashBoardDetails);
router.get("/get_daywise_customers_count", controller.getDayWiseCustomersCount);
router.get("/get_rolewise_employee_data/:role", controller.allRoleWiseEmployeesData);
router.get("/get_sma_jma_customer_details/:refferalCode", controller.getSmaJmaCustomerDetails);
router.post("/generate_random_pins", controller.generateRandomPins);
router.post("/upload_billboard", upload.single("billboard"), controller.addBillBoard);
router.delete("/delete_bill_board_by_id/:slno", controller.deleteBillBoard);
router.put("/update_employee_deductions/:phone", controller.updateEmployeeDeductions);

module.exports = router;