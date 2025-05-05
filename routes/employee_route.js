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
//     "joined_by":"DESETTI MUKUNDA RAO wUz",
//     "adhaar":"111111111111",
//     "transaction_id":"3490",
//     "phone":"34590",
//     "id":"34890",
//     "refferel_code":"sma",
//     "name":"sma",
//     "role":"sma",
//     "father_name":"adf",
//     "city":"vizag",
//     "pincode":"5353555",
//     "dob":"010101",
//     "place_of_posting":"vizag",
//     "address":"vixag",
//     "password":"1234",
//     "earnings":0,
//     "mma_count":0,
//     "jma_count":0,
//     "customer_count":0,
//     "addedon":"249857",
//     "payment_status":"success",
//     "amount":650
//   }
