const express = require("express");
const controller = require("../controller/employees");
const upload = require("../middleware/file_upload");
const router = express.Router();

router.post("/create_employee", controller.createEmployeeByPayment);
router.post("/create_employee_by_pin", controller.createEmployeeByPIN);
router.post("/login", controller.loginEmployee);
router.post("/employee_details", controller.getEmployeeDetails);
router.post("/change_password", controller.changePassword);
router.post("/update_profile", upload.single("profile"), controller.uploadProfile);
router.post("/validate_userdetails_before_account_creation", controller.checkUserDetailsBeforeCreating);
router.get("/generate_offer_letter/:phone", controller.generateOfferLetter);
router.post("/check_phone_already_exists", controller.checkPhoneAlreadyExists);
router.post("/check_mma_pincode_already_exists", controller.checkMMAalreadyExistsForPincode);
router.post("/update_employee_details", controller.updateEmployeeDetails);
router.post("/update_today_earinings", controller.updateTodayEarnings);
router.put("/forgot_password", controller.forgotPassword);
module.exports = router;

// {
//     "joined_by":"KKkPtU",
//     "phone":"7989683038",
//     "id":"4941234",
//     "refferel_code":"KKWrtq",
//     "name":"B Anusha",
//     "role":"mma",
//     "father_name":"W/o G.RAMU",
//     "city":"Vijayanagaram",
//     "pincode":"535002",
//     "dob":"08/06/1997",
//     "place_of_posting":"Vijayanagaram",
//     "address":"vixag",
//     "password":"123456",
//     "earnings":0,
//     "mma_count":0,
//     "jma_count":0,
//     "customer_count":0,
//     "direct_mma_count":0,
//     "level1_mma_count":0,
//     "level2_mma_count":0,
//     "deductions":0,
//     "position":1,
//     "addedon":"2025-05-05 09:09:19.149018",
//     "payment_status":"success",
//     "amount":2950,
//     "transaction_id":"pay_QRFnPiqAJ1l89u",
//     "status":1,
//     "profile":"",
//     "offer_letter":"",
//     "name_on_idcard":"B Anusha",
//     "daily_earnings":0,
//     "date":"2025-05-05 00:00:00",
//     "state":"Andhra Pradesh",
//     "district":"Vizianagaram",
//     "one_time_income":0,
//     "monthly_income":0,
//     "yearly_income":0,
//     "gender":"Female"
//   }
