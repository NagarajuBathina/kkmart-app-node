const express = require("express");
const controller = require("../controller/employees");
const upload = require("../middleware/file_upload");
const router = express.Router();

router.post("/create-employee", controller.createEmployee);
router.post("/login", controller.loginEmployee);
router.post("/employee-details", controller.getEmployeeDetails);
router.post("/change-password", controller.changePassword);
router.post("/update-profile", upload.single("profile"), controller.uploadProfile);
router.post("/validate-userdetails-before-account-creation", controller.checkUserDetailsBeforeCreating);
router.get("/generate_offer_letter/:phone", controller.generateOfferLetter);
module.exports = router;
